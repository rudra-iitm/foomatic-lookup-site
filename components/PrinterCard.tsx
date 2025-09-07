import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "@/data/printers";
import { Wifi, Usb, Cable, Download, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

interface PrinterCardProps {
  printer: Printer;
}

const PrinterCard = ({ printer }: PrinterCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'perfect':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'unsupported':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unsupported':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'ethernet':
        return <Cable className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {printer.manufacturer} {printer.model}
            </CardTitle>
            {printer.series && (
              <p className="text-sm text-muted-foreground">{printer.series} Series</p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(printer.status)} flex items-center gap-1.5 font-medium`}
          >
            {getStatusIcon(printer.status)}
            {printer.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type & Features */}
        <div className="space-y-2">
          <Badge variant="outline" className="capitalize font-medium">
            {printer.type}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {printer.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {printer.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{printer.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Connectivity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Connectivity</h4>
          <div className="flex flex-wrap gap-2">
            {printer.connectivity.map((conn, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                {getConnectivityIcon(conn)}
                <span>{conn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Support */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Linux Support</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${printer.driverSupport.linux ? 'text-green-600' : 'text-red-600'}`}>
              {printer.driverSupport.linux ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              <span>Linux</span>
            </div>
            <div className={`flex items-center gap-1 ${printer.driverSupport.cups ? 'text-green-600' : 'text-red-600'}`}>
              {printer.driverSupport.cups ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              <span>CUPS</span>
            </div>
            <div className={`flex items-center gap-1 ${printer.driverSupport.foomatic ? 'text-green-600' : 'text-red-600'}`}>
              {printer.driverSupport.foomatic ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              <span>Foomatic</span>
            </div>
          </div>
          
          {printer.driverSupport.driverName && (
            <div className="text-xs text-muted-foreground">
              Driver: <span className="font-mono font-medium">{printer.driverSupport.driverName}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {printer.notes && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
            {printer.notes}
          </div>
        )}

        {/* Action Button */}
        {printer.driverSupport.driverUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group/btn"
            onClick={() => window.open(printer.driverSupport.driverUrl, '_blank')}
          >
            <Download className="h-4 w-4 mr-2 group-hover/btn:animate-bounce" />
            Download Driver
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PrinterCard;