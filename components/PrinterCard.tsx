
import { Printer } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PrinterCardProps {
  printer: Printer;
}

export default function PrinterCard({ printer }: PrinterCardProps) {
  const printerId = printer.id.replace('printer/', '');

  return (
    <Link href={`/printer/${printerId}`} className="h-full">
      <Card className="hover:border-primary transition-colors duration-200 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">{printer.model}</CardTitle>
          <CardDescription>{printer.manufacturer}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Add more details here if needed */}
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{printer.type}</Badge>
            <Badge variant={printer.status === 'recommended' ? 'default' : 'secondary'}>{printer.status}</Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
