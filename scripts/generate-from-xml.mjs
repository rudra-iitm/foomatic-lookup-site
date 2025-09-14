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

/** * @param {string} sourceDir 
 * @param {string} outputDir 
 */
function processDirectory(sourceDir, outputDir) {
  let fileCount = 0;
  console.log(`Processing XML from: ${sourceDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (file.endsWith('.xml')) {
      const xmlPath = path.join(sourceDir, file);
      const jsonPath = path.join(outputDir, file.replace('.xml', '.json'));

      try {
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        let parsedData = parser.parse(xmlContent);
        if (sourceDir === DRIVER_XML_DIR && parsedData.driver?.printers?.printer) {
          
          let printerRefs = parsedData.driver.printers.printer;
          if (!Array.isArray(printerRefs)) {
            printerRefs = [printerRefs];
          }

          const transformedPrinterRefs = printerRefs.map(printerRef => {
            let newRef = {};
            let printerId = null;

            if (typeof printerRef === 'string') {
              printerId = printerRef;
              newRef.id = printerId;

            } else if (typeof printerRef === 'object' && printerRef !== null) {
              newRef = { ...printerRef };
              
              if (printerRef.id) printerId = printerRef.id;
              else if (printerRef['@id']) printerId = printerRef['@id'];
              else if (printerRef['#text']) printerId = printerRef['#text'];
              
              if (printerId) {
                newRef.id = printerId;
              }
            }
            return newRef;
          });

          parsedData.driver.printers.printer = transformedPrinterRefs;
        }
        fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2));
        fileCount++;

      } catch (error) {
        console.error(`Failed to process ${file}:`, error);
      }
    }
  }
  console.log(`Successfully converted ${fileCount} files in ${outputDir}`);
}
console.log('Starting data generation pipeline...');
setupFoomaticDb();
console.log('Starting XML to JSON data generation...');
processDirectory(PRINTER_XML_DIR, PRINTER_JSON_DIR);
processDirectory(DRIVER_XML_DIR, DRIVER_JSON_DIR);
console.log('Data generation complete.');