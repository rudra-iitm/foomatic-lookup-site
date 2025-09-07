import fs from 'fs';
import path from 'path';

const PRINTERS_DIR = 'public/foomatic-db/printer';
const DRIVERS_DIR = 'public/foomatic-db/driver';
const OUTPUT_FILE = 'public/foomatic-db/printers.json';

function getFunctionalityStatus(func) {
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

async function combineData() {
    const printers = [];
    const drivers = new Map();

    // Load drivers
    const driverFiles = fs.readdirSync(DRIVERS_DIR);
    for (const file of driverFiles) {
        if (file.endsWith('.json')) {
            const driverData = JSON.parse(fs.readFileSync(path.join(DRIVERS_DIR, file), 'utf-8'));
            drivers.set(driverData.driver['@id'], driverData.driver);
        }
    }

    // Load printers
    const printerFiles = fs.readdirSync(PRINTERS_DIR);
    for (const file of printerFiles) {
        if (file.endsWith('.json')) {
            const printerData = JSON.parse(fs.readFileSync(path.join(PRINTERS_DIR, file), 'utf-8'));
            const printer = printerData.printer;
            const driver = drivers.get(`driver/${printer.driver}`);

            printers.push({
                id: printer['@id'],
                manufacturer: printer.make,
                model: printer.model,
                series: '', // Not available
                connectivity: [], // Not available
                driverSupport: {
                    linux: true,
                    cups: true,
                    foomatic: true,
                    driverName: driver ? driver.name : 'N/A',
                    driverUrl: driver ? driver.url : 'N/A',
                },
                features: [], // Not available
                type: printer.mechanism && printer.mechanism.transfer === 'i' ? 'inkjet' : 'laser', // Example logic
                status: getFunctionalityStatus(printer.functionality),
                notes: printer.comments ? printer.comments.en : '',
            });
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ printers }, null, 2));
    console.log(`Combined data written to ${OUTPUT_FILE}`);
}

combineData();
