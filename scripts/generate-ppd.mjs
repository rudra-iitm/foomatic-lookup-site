import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PRINTERS_FILE = path.join(PROJECT_ROOT, 'public/foomatic-db/printers.json');
const PPD_OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/ppd');
// foomatic-db is cloned by generate-from-xml.mjs as a sibling to the project root
const FOOMATIC_DB_DIR = process.env.FOOMATICDB || path.join(PROJECT_ROOT, '../foomatic-db');
const PPD_GENERATION_TIMEOUT = 30000;

function checkFoomaticAvailable() {
  const result = spawnSync('foomatic-ppdfile', ['-h'], {
    stdio: 'pipe',
    env: { ...process.env, FOOMATICDB: FOOMATIC_DB_DIR },
  });
  return result.error === undefined;
}

function generatePPDFile(printerId, driverId, outputPath) {
  const result = spawnSync(
    'foomatic-ppdfile',
    ['-p', printerId, '-d', driverId],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FOOMATICDB: FOOMATIC_DB_DIR },
      timeout: PPD_GENERATION_TIMEOUT,
    }
  );

  if (result.status === 0 && result.stdout && result.stdout.length > 0) {
    fs.writeFileSync(outputPath, result.stdout);
    return true;
  }
  return false;
}

async function generatePPDs() {
  if (!checkFoomaticAvailable()) {
    console.warn('foomatic-db-engine (foomatic-ppdfile) not found. Skipping PPD generation.');
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

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  const total = printers.reduce((sum, p) => sum + (p.drivers?.length || 0), 0);

  console.log(`Processing ${printers.length} printers with ${total} driver combinations...`);

  for (const printer of printers) {
    const printerId = printer.id;
    const printerDir = path.join(PPD_OUTPUT_DIR, printerId);
    const drivers = printer.drivers || [];

    if (drivers.length === 0) continue;

    fs.mkdirSync(printerDir, { recursive: true });

    for (const driver of drivers) {
      const rawDriverId = driver.id.replace(/^driver\//, '');
      const ppdPath = path.join(printerDir, `${rawDriverId}.ppd`);

      if (fs.existsSync(ppdPath)) {
        skipped++;
        continue;
      }

      const success = generatePPDFile(printerId, rawDriverId, ppdPath);
      if (success) {
        generated++;
        if (generated % 100 === 0) {
          console.log(`  Generated ${generated} PPD files...`);
        }
      } else {
        failed++;
      }
    }
  }

  console.log(`PPD generation complete.`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

generatePPDs().catch((error) => {
  console.error('Error generating PPD files:', error);
  process.exit(1);
});
