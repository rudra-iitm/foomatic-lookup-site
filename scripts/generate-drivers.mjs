import fs from 'fs';
import path from 'path';

const DRIVERS_DIR = 'public/foomatic-db/driver';
const OUTPUT_FILE = 'public/foomatic-db/drivers.json';

function extractDescription(comments) {
  if (!comments) return '';

  if (typeof comments === 'string') {
    return comments;
  }

  if (comments.en) {
    return comments.en;
  }

  if (comments['#text']) {
    return comments['#text'];
  }

  return '';
}

function countPrinters(printers) {
  if (!printers || !printers.printer) {
    return 0;
  }

  if (Array.isArray(printers.printer)) {
    return printers.printer.length;
  }

  return 1;
}

function inferDriverType(execution) {
  if (!execution || typeof execution !== 'object') return 'Unknown';
  const keys = Object.keys(execution);

  if (keys.includes('uniprint')) return 'Ghostscript Uniprint';
  if (keys.includes('ghostscript')) return 'Ghostscript built-in';
  if (keys.includes('cups')) return 'CUPS Raster';
  if (keys.includes('ijs')) return 'IJS';
  if (keys.includes('postscript')) return 'PostScript';
  if (keys.includes('pdf')) return 'PDF';
  if (keys.includes('filter')) return 'Filter';

  return 'Unknown';
}

async function generateDrivers() {
  const drivers = [];

  if (!fs.existsSync(DRIVERS_DIR)) {
    console.warn(`Drivers directory not found: ${DRIVERS_DIR}`);
    return;
  }

  const driverFiles = fs.readdirSync(DRIVERS_DIR);

  for (const file of driverFiles) {
    if (!file.endsWith('.json')) continue;

    try {
      const filePath = path.join(DRIVERS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const driverData = JSON.parse(fileContent);

      if (!driverData.driver) {
        console.warn(`Skipping ${file}: missing driver object`);
        continue;
      }

      const driver = driverData.driver;

      const id = driver['@id'];
      if (!id) {
        console.warn(`Skipping ${file}: missing @id`);
        continue;
      }

      const name = driver.name || '';
      const license = driver.license || null;
      const description = extractDescription(driver.comments);
      const printerCount = countPrinters(driver.printers);
      const url = driver.url || null;
      const type = inferDriverType(driver.execution);
      const thirdpartysupplied = !!(
        driver.thirdpartysupplied &&
        typeof driver.thirdpartysupplied === 'string' &&
        driver.thirdpartysupplied.trim().length > 0
      );

      drivers.push({
        id,
        name,
        license,
        description,
        printerCount,
        url,
        type,
        thirdpartysupplied,
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  drivers.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(drivers, null, 2));

  console.log(`✓ Generated ${OUTPUT_FILE}`);
  console.log(`  Total drivers: ${drivers.length}`);
  console.log(
    `  Total printers supported: ${drivers.reduce(
      (sum, d) => sum + (d.printerCount || 0),
      0
    )}`
  );
}

generateDrivers().catch((error) => {
  console.error('Error generating drivers:', error);
  process.exit(1);
});
