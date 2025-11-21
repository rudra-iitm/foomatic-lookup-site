import fs from 'fs';
import path from 'path';

const PRINTERS_DIR = 'public/foomatic-db/printer';
const DRIVERS_DIR = 'public/foomatic-db/driver';
const OUTPUT_FILE = 'public/foomatic-db/printers.json';

function getFunctionalityStatus(func) {
    if (!func || func === '?') {
        return 'unknown';
    }
    switch (func) {
        case 'A':
            return 'perfect';
        case 'B':
            return 'good';
        case 'C':
            return 'partial';
        default:
            return 'unsupported';
    }
}

function getPrinterType(printer) {
    if (!printer.mechanism) {
        return 'unknown';
    }
    
    const mechanism = printer.mechanism;
    
    if (mechanism.inkjet !== undefined) {
        return 'inkjet';
    }
    if (mechanism.laser !== undefined) {
        return 'laser';
    }
    if (mechanism.dotmatrix !== undefined) {
        return 'dot-matrix';
    }

    if (mechanism.transfer === 'i') {
        return 'inkjet';
    }
    if (mechanism.transfer === 't') {
        return 'laser';
    }
    
    return 'unknown';
}

function parseConnectivity(printer) {
    const connectivity = [];
    if (!printer.autodetect) {
        return connectivity;
    }
    
    if (printer.autodetect.usb) {
        connectivity.push('USB');
    }
    if (printer.autodetect.parallel) {
        connectivity.push('Parallel');
    }
    if (printer.autodetect.serial) {
        connectivity.push('Serial');
    }
    if (printer.autodetect.network) {
        connectivity.push('Network');
    }
    
    return connectivity;
}

async function combineData() {
    const printers = new Map();
    const drivers = new Map();
    const printerToDrivers = new Map(); 

    const printerFiles = fs.readdirSync(PRINTERS_DIR);
    for (const file of printerFiles) {
        if (file.endsWith('.json')) {
            try {
                const printerData = JSON.parse(fs.readFileSync(path.join(PRINTERS_DIR, file), 'utf-8'));
                const printer = printerData.printer;
                if (printer && printer['@id']) {
                    printers.set(printer['@id'], printer);

                    printerToDrivers.set(printer['@id'], new Set());
                    if (printer.drivers && printer.drivers.driver) {
                        const driverRefs = Array.isArray(printer.drivers.driver) 
                            ? printer.drivers.driver 
                            : [printer.drivers.driver];
                        
                        for (const driverRef of driverRefs) {
                            let driverId = null;
                            if (typeof driverRef === 'string') {
                                driverId = driverRef;
                            } else if (driverRef && typeof driverRef === 'object') {
                                driverId = driverRef.id || driverRef['@id'] || driverRef['#text'];
                            }
                            
                            if (driverId) {
                                if (!driverId.startsWith('driver/')) {
                                    driverId = `driver/${driverId}`;
                                }
                                printerToDrivers.get(printer['@id']).add(driverId);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error loading printer file ${file}:`, error.message);
            }
        }
    }

    const driverFiles = fs.readdirSync(DRIVERS_DIR);
    for (const file of driverFiles) {
        if (file.endsWith('.json')) {
            try {
                const driverData = JSON.parse(fs.readFileSync(path.join(DRIVERS_DIR, file), 'utf-8'));
                const driver = driverData.driver;
                if (driver && driver['@id']) {
                    drivers.set(driver['@id'], driver);

                    if (driver.printers && driver.printers.printer) {
                        const printerRefs = Array.isArray(driver.printers.printer) 
                            ? driver.printers.printer 
                            : [driver.printers.printer];
                        
                        for (const printerRef of printerRefs) {
                            let printerId = null;

                            if (typeof printerRef === 'string') {
                                printerId = printerRef;
                            } else if (printerRef && typeof printerRef === 'object') {
                                printerId = printerRef.id || printerRef['@id'] || printerRef['#text'];
                            }
                            
                            if (printerId) {
                                if (!printerId.startsWith('printer/')) {
                                    printerId = `printer/${printerId}`;
                                }
                                
                                if (!printerToDrivers.has(printerId)) {
                                    printerToDrivers.set(printerId, new Set());
                                }
                                printerToDrivers.get(printerId).add(driver['@id']);
                                
                                if (!printers.has(printerId)) {
                                    const newPrinter = {};
                                    newPrinter['@id'] = printerId;
                                    const parts = printerId.substring('printer/'.length).split('-');
                                    newPrinter.make = parts[0].replace(/_/g, ' ');
                                    newPrinter.model = parts.slice(1).join('-').replace(/_/g, ' ');
                                    newPrinter.mechanism = {};
                                    newPrinter.functionality = '?';
                                    if (typeof printerRef === 'object' && printerRef.comments) {
                                        newPrinter.comments = printerRef.comments;
                                    }
                                    printers.set(printerId, newPrinter);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error loading driver file ${file}:`, error.message);
            }
        }
    }
    console.log(`Loaded ${drivers.size} drivers`);

    console.log('Combining data...');
    const combinedPrinters = [];
    
    for (const [printerId, printer] of printers.entries()) {
        const driverIdSet = printerToDrivers.get(printerId) || new Set();
        const driverIds = Array.from(driverIdSet);

        let recommendedDriverId = null;
        if (printer.driver) {
            recommendedDriverId = `driver/${printer.driver}`;
       
            if (!driverIdSet.has(recommendedDriverId)) {
                driverIdSet.add(recommendedDriverId);
                driverIds.push(recommendedDriverId);
            }
        } else if (driverIds.length > 0) {
          
            recommendedDriverId = driverIds[0];
        }
        
        const driverDetails = driverIds
            .map(driverId => drivers.get(driverId))
            .filter(Boolean)
            .map(driver => {
                return {
                    id: driver['@id'],
                    name: driver.name,
                    url: driver.url || null,
                    comments: driver.comments ? (driver.comments.en || driver.comments || '') : '',
                    execution: driver.execution || null,
                };
            });
        let series = '';
        if (printer.series) {
            series = typeof printer.series === 'string' ? printer.series : '';
        }

        combinedPrinters.push({
            id: printer['@id'].replace('printer/', ''),
            manufacturer: printer.make,
            model: printer.model,
            series: '',
            connectivity: [],
            recommended_driver: recommendedDriverId,
            drivers: driverDetails,
            type: getPrinterType(printer),
            status: getFunctionalityStatus(printer.functionality || '?'),
            notes: printer.comments ? (printer.comments.en || printer.comments || '') : '',
        });
    }
    combinedPrinters.sort((a, b) => {
        const am = String(a.manufacturer || '');
        const bm = String(b.manufacturer || '');
        if (am !== bm) {
            return am.localeCompare(bm);
        }
        const aModel = String(a.model || '');
        const bModel = String(b.model || '');
        return aModel.localeCompare(bModel);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ printers: combinedPrinters }, null, 2));
    console.log(` Combined data written to ${OUTPUT_FILE}`);
    console.log(`   Total printers: ${combinedPrinters.length}`);
    console.log(`   Printers with drivers: ${combinedPrinters.filter(p => p.drivers.length > 0).length}`);
}

combineData().catch(error => {
    console.error('Error combining data:', error);
    process.exit(1);
});
