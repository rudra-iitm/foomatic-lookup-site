import { Printer } from "@/lib/types";
import PrinterCard from "./PrinterCard";

interface PrintersProps {
  printers: Printer[];
}

export default function Printers({ printers }: PrintersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {printers.map((printer) => (
        <PrinterCard key={printer.id} printer={printer} />
      ))}
    </div>
  );
}