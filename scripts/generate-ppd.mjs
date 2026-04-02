import { spawnSync, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PRINTERS_FILE = path.join(PROJECT_ROOT, 'public/foomatic-db/printers.json');
const PPD_OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/ppd');
const FAILED_COMBOS_FILE = path.join(PPD_OUTPUT_DIR, '.failed-combos.json');
const BATCH_SCRIPT = path.join(__dirname, 'generate-ppd-batch.pl');
// foomatic-db is cloned by generate-from-xml.mjs as a sibling to the project root
const FOOMATIC_DB_DIR = process.env.FOOMATICDB || path.join(PROJECT_ROOT, '../foomatic-db');
// Number of parallel batch workers (capped at CPU count)
const WORKER_COUNT = Math.max(1, Math.min(os.cpus().length, 4));

function checkFoomaticAvailable() {
  const result = spawnSync('perl', ['-e', 'use Foomatic::DB; exit 0'], {
    stdio: 'pipe',
    env: { ...process.env, FOOMATICDB: FOOMATIC_DB_DIR },
  });
  return result.status === 0;
}

/**
 * Run one batch worker with the given combos (array of {printerId, driverId, outputPath}).
 * Returns a promise that resolves with { generated, failed, failedKeys } counts.
 */
function runBatchWorker(combos) {
  return new Promise((resolve) => {
    const env = { ...process.env, FOOMATICDB: FOOMATIC_DB_DIR };
    const proc = spawn('perl', [BATCH_SCRIPT], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
    });

    let generated = 0;
    let failed = 0;
    const failedKeys = [];

    proc.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('OK:')) {
          generated++;
        } else if (line.startsWith('FAIL:')) {
          const parts = line.slice(5).split(':');
          if (parts.length >= 2) failedKeys.push(`${parts[0]}:${parts[1]}`);
          failed++;
        }
      }
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      // Log warnings/errors from the worker (excluding the summary line)
      const lines = text.split('\n').filter((l) => l && !l.startsWith('Batch done:'));
      if (lines.length > 0) {
        process.stderr.write(lines.join('\n') + '\n');
      }
    });

    proc.on('close', () => resolve({ generated, failed, failedKeys }));
    proc.on('error', () => resolve({ generated, failed: combos.length, failedKeys }));

    // Write combos to stdin
    const input = combos.map((c) => `${c.printerId}:${c.driverId}:${c.outputPath}`).join('\n');
    proc.stdin.end(input);
  });
}

async function generatePPDs() {
  if (!checkFoomaticAvailable()) {
    console.warn('Foomatic::DB (foomatic-db-engine) not found. Skipping PPD generation.');
    return;
  }

  if (!fs.existsSync(FOOMATIC_DB_DIR)) {
    console.warn(`foomatic-db not found at ${FOOMATIC_DB_DIR}. Skipping PPD generation.`);
    return;
  }

  if (!fs.existsSync(PRINTERS_FILE)) {
    console.warn(`Printers data not found at ${PRINTERS_FILE}. Run build:data first.`);
    return;
  }

  console.log('Starting PPD file generation...');
  const data = JSON.parse(fs.readFileSync(PRINTERS_FILE, 'utf-8'));
  const printers = data.printers || [];

  fs.mkdirSync(PPD_OUTPUT_DIR, { recursive: true });

  // Load previously-known incompatible combos (from prior runs) to skip them
  let knownFailed = new Set();
  if (fs.existsSync(FAILED_COMBOS_FILE)) {
    try {
      const list = JSON.parse(fs.readFileSync(FAILED_COMBOS_FILE, 'utf-8'));
      knownFailed = new Set(list);
    } catch {
      // Ignore malformed file
    }
  }

  // Build the list of combos that still need to be generated
  const pending = [];
  let skipped = 0;

  for (const printer of printers) {
    const printerId = printer.id;
    const drivers = printer.drivers || [];
    if (drivers.length === 0) continue;

    const printerDir = path.join(PPD_OUTPUT_DIR, printerId);
    fs.mkdirSync(printerDir, { recursive: true });

    for (const driver of drivers) {
      const rawDriverId = driver.id.replace(/^driver\//, '');
      const key = `${printerId}:${rawDriverId}`;
      const ppdPath = path.join(printerDir, `${rawDriverId}.ppd`);
      if (fs.existsSync(ppdPath) || knownFailed.has(key)) {
        skipped++;
      } else {
        pending.push({ printerId, driverId: rawDriverId, outputPath: ppdPath });
      }
    }
  }

  const total = pending.length + skipped;
  console.log(`  Total combinations: ${total}`);
  console.log(`  Already generated (skipped): ${skipped}`);
  console.log(`  To generate: ${pending.length}`);

  if (pending.length === 0) {
    console.log('All PPD files already exist. Nothing to do.');
    return;
  }

  // Split into WORKER_COUNT batches and process in parallel
  console.log(`  Using ${WORKER_COUNT} parallel workers...`);
  const batchSize = Math.ceil(pending.length / WORKER_COUNT);
  const batches = [];
  for (let i = 0; i < pending.length; i += batchSize) {
    batches.push(pending.slice(i, i + batchSize));
  }

  const results = await Promise.all(batches.map(runBatchWorker));

  const generated = results.reduce((sum, r) => sum + r.generated, 0);
  const failed = results.reduce((sum, r) => sum + r.failed, 0);

  // Persist newly-discovered failed combos so they are skipped on next run
  const newFailedKeys = results.flatMap((r) => r.failedKeys);
  if (newFailedKeys.length > 0) {
    const updatedFailed = Array.from(new Set([...knownFailed, ...newFailedKeys]));
    fs.writeFileSync(FAILED_COMBOS_FILE, JSON.stringify(updatedFailed, null, 2));
  }

  console.log('PPD generation complete.');
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped (already existed or known incompatible): ${skipped}`);
  console.log(`  Failed (incompatible combos, saved for next run): ${failed}`);
}

generatePPDs().catch((error) => {
  console.error('Error generating PPD files:', error);
  process.exit(1);
});

