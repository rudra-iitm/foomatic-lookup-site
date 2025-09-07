import fs from 'fs';
import path from 'path';
import Printers from '@/components/Printers';

async function getPrintersData() {
  const filePath = path.join(process.cwd(), 'public', 'foomatic-db', 'printers.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(jsonData);
  return data;
}

export default async function Page() {
  const { printers } = await getPrintersData();
  const manufacturers = Array.from(new Set(printers.map(p => p.manufacturer))).sort();
  const connectivityOptions = Array.from(
    new Set(printers.flatMap(p => p.connectivity))
  ).sort();
  const printerTypes = Array.from(new Set(printers.map(p => p.type))).sort();

  return (
    <Printers 
      printers={printers}
      manufacturers={manufacturers}
      connectivityOptions={connectivityOptions}
      printerTypes={printerTypes}
    />
  )
}