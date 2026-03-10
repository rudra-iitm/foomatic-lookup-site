import fs from 'fs';
import path from 'path';

const DRIVERS_JSON = 'public/foomatic-db/drivers.json';
const PRINTERS_JSON = 'public/foomatic-db/printers.json';
const OUTPUT_FILE = 'public/search/foomatic-index.json';


function stripHtml(str) {
  if (str == null || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


function stripHtmlMax(str, maxLength = 500) {
  const plain = stripHtml(str);
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength);
}

async function generateSearchIndex() {
  const cwd = process.cwd();

  const driversPath = path.join(cwd, DRIVERS_JSON);
  if (!fs.existsSync(driversPath)) {
    console.warn(`Drivers file not found: ${DRIVERS_JSON}`);
  }
  let drivers = [];
  if (fs.existsSync(driversPath)) {
    const driversRaw = fs.readFileSync(driversPath, 'utf-8');
    try {
      drivers = JSON.parse(driversRaw);
      if (!Array.isArray(drivers)) drivers = [];
    } catch (err) {
      console.error(`Error parsing ${DRIVERS_JSON}:`, err.message);
    }
  }

  const printersPath = path.join(cwd, PRINTERS_JSON);
  if (!fs.existsSync(printersPath)) {
    console.warn(`Printers file not found: ${PRINTERS_JSON}`);
  }
  let printers = [];
  if (fs.existsSync(printersPath)) {
    const printersRaw = fs.readFileSync(printersPath, 'utf-8');
    try {
      const data = JSON.parse(printersRaw);
      printers = data?.printers && Array.isArray(data.printers) ? data.printers : [];
    } catch (err) {
      console.error(`Error parsing ${PRINTERS_JSON}:`, err.message);
    }
  }

  const driverDocs = drivers.map((driver) => ({
    id: driver.id,
    type: 'driver',
    name: driver.name ?? '',
    driverType: driver.type ?? 'Unknown',
    description: stripHtmlMax(driver.description ?? '', 500),
    printerCount: driver.printerCount ?? 0,
    url: driver.url ?? null,
  }));

  const printerDocs = printers.map((printer) => ({
    id: printer.id,
    type: 'printer',
    name: printer.model ?? '',
    manufacturer: printer.manufacturer ?? null,
    recommendedDriver: printer.recommended_driver ?? null,
    status: printer.status ?? 'Unknown',
    functionality: printer.functionality ?? null,
  }));

  const documents = [...printerDocs, ...driverDocs];
  const total = documents.length;

  const output = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    documents,
    metadata: {
      documentCount: total,
      contentTypes: ['printer', 'driver'],
    },
  };

  const outDir = path.join(cwd, path.dirname(OUTPUT_FILE));
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(cwd, OUTPUT_FILE);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✓ Generated ${OUTPUT_FILE}`);
  console.log(`  Document count: ${total}`);
}

generateSearchIndex().catch((error) => {
  console.error('Error generating search index:', error);
  process.exit(1);
});
