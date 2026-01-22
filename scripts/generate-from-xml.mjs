import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { execSync } from 'child_process';

const FDB_REPO = 'https://github.com/OpenPrinting/foomatic-db.git';
const FDB_DIR = '../foomatic-db';
const FDB_PATH = path.join(FDB_DIR, 'db/source');
const PRINTER_XML_DIR = path.join(FDB_PATH, 'printer');
const DRIVER_XML_DIR = path.join(FDB_PATH, 'driver');
const PRINTER_JSON_DIR = 'public/foomatic-db/printer';
const DRIVER_JSON_DIR = 'public/foomatic-db/driver';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '#text',
  allowBooleanAttributes: true,
};

const parser = new XMLParser(parserOptions);

function setupFoomaticDb() {
  console.log(`Checking for foomatic-db at ${FDB_DIR}...`);
  if (fs.existsSync(FDB_DIR)) {
    console.log('Found existing repository. Pulling latest changes...');
    try {
      execSync(`git -C ${FDB_DIR} pull`);
      console.log('foomatic-db is up to date.');
    } catch (e) {
      console.error('Error pulling foomatic-db:', e.message);
      process.exit(1);
    }
  } else {
    console.log('Repository not found. Cloning from GitHub...');
    try {
      execSync(`git clone ${FDB_REPO} ${FDB_DIR}`);
      console.log('foomatic-db cloned successfully.');
    } catch (e) {
      console.error('Error cloning foomatic-db:', e.message);
      process.exit(1);
    }
  }
}

const allPrinters = [];
const driverMap = new Map();

function processDrivers(sourceDir, outputDir) {
  let fileCount = 0;
  console.log(`Processing Drivers from: ${sourceDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (file.endsWith('.xml')) {
      const xmlPath = path.join(sourceDir, file);
      const jsonPath = path.join(outputDir, file.replace('.xml', '.json'));

      try {
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        let parsedData = parser.parse(xmlContent);

        if (parsedData.driver) {
          const d = parsedData.driver;
          const driverId = d.id || file.replace('.xml', '');

          // Normalize printer references
          if (d.printers?.printer) {
            let printerRefs = d.printers.printer;
            if (!Array.isArray(printerRefs)) printerRefs = [printerRefs];

            d.printers.printer = printerRefs.map(ref => {
              if (typeof ref === 'string') return { id: ref };
              return ref;
            });
          }

          // Save to map for embedding later
          driverMap.set(driverId, d);

          // Write driver JSON
          fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2));
          fileCount++;
        }
      } catch (error) {
        console.error(`Failed to process driver ${file}:`, error);
      }
    }
  }
  console.log(`Processed ${fileCount} drivers.`);
}

function processPrinters(sourceDir, outputDir) {
  let fileCount = 0;
  console.log(`Processing Printers from: ${sourceDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (file.endsWith('.xml')) {
      const xmlPath = path.join(sourceDir, file);
      const jsonPath = path.join(outputDir, file.replace('.xml', '.json'));

      try {
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        let parsedData = parser.parse(xmlContent);

        if (parsedData.printer) {
          const p = parsedData.printer;
          const printerId = p.id || file.replace('.xml', '');

          // EMBED DRIVERS
          let embeddedDrivers = [];

          // 1. Check 'driver' property (single string or array of strings)
          if (p.driver) {
            const driverRefs = Array.isArray(p.driver) ? p.driver : [p.driver];
            driverRefs.forEach(ref => {
              const dId = typeof ref === 'object' ? ref.id : ref;
              if (driverMap.has(dId)) {
                embeddedDrivers.push(driverMap.get(dId));
              } else {
                // Fallback if driver not found in map, make a minimal object
                embeddedDrivers.push({ id: dId, name: dId, execution: null });
              }
            });
          }

          // 2. Check 'drivers' property (some XMLs use this)
          if (p.drivers?.driver) {
            const driverRefs = Array.isArray(p.drivers.driver) ? p.drivers.driver : [p.drivers.driver];
            driverRefs.forEach(ref => {
              const dId = typeof ref === 'object' ? ref.id : ref;
              if (driverMap.has(dId)) {
                embeddedDrivers.push(driverMap.get(dId));
              }
            });
          }

          // Deduplicate
          const uniqueDrivers = [];
          const seen = new Set();
          for (const d of embeddedDrivers) {
            if (!seen.has(d.id)) {
              seen.add(d.id);
              uniqueDrivers.push(d);
            }
          }

          // Update the printer object with the full driver list
          p.drivers = uniqueDrivers;


          // Add to global map
          allPrinters.push({
            id: printerId,
            manufacturer: p.make,
            model: p.model,
            type: p.mechanism?.type || 'Unknown',
            status: p.functionality || 'Unknown',
            driverCount: uniqueDrivers.length,
          });

          fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2));
          fileCount++;
        }

      } catch (error) {
        console.error(`Failed to process printer ${file}:`, error);
      }
    }
  }
  console.log(`Processed ${fileCount} printers.`);
}

console.log('Starting data generation pipeline...');
setupFoomaticDb();

console.log('Step 1: Processing Drivers...');
processDrivers(DRIVER_XML_DIR, DRIVER_JSON_DIR);

console.log('Step 2: Processing Printers (Embedding Drivers)...');
processPrinters(PRINTER_XML_DIR, PRINTER_JSON_DIR);

// Write the printers map
const mapPath = path.join('public/foomatic-db', 'printersMap.json');
fs.writeFileSync(mapPath, JSON.stringify({ printers: allPrinters }, null, 2));
console.log(`Generated printersMap.json with ${allPrinters.length} entries.`);

console.log('Data generation complete.');