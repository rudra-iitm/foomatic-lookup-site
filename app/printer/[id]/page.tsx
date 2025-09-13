import fs from 'fs/promises';
import path from 'path';
import { Printer } from '@/lib/types';
import PrinterPageClient from '@/components/PrinterPageClient';

async function getPrinters(): Promise<Printer[]> {
  const filePath = path.join(process.cwd(), 'public', 'foomatic-db', 'printers.json');
  const data = await fs.readFile(filePath, 'utf-8');
  const json = JSON.parse(data);
  return json.printers;
}

async function getPrinterById(id: string): Promise<Printer | undefined> {
  const printers = await getPrinters();
  return printers.find((p) => p.id === id);
}

export async function generateStaticParams() {
  const printers = await getPrinters();
  return printers.map((printer) => ({
    id: printer.id,
  }));
}

interface PrinterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrinterPage({ params }: PrinterPageProps) {
  const { id } = await params;
  const printer = await getPrinterById(id);

  return <PrinterPageClient printer={printer} />;
}
