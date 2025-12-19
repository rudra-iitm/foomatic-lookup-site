import type { PrinterSummary } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PrinterIcon } from "lucide-react"
import { calculateAccurateStatus } from "@/lib/utils"

interface PrinterCardProps {
  printer: PrinterSummary
}

export default function PrinterCard({ printer }: PrinterCardProps) {
  const printerId = printer.id.replace("printer/", "")
  const accurateStatus = calculateAccurateStatus(printer)

  const getStatusStyling = (status: string) => {
    switch (status.toLowerCase()) {
      case 'perfect':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-300 border-green-400/30'
        }
      case 'partial':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
        }
      case 'mostly':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
        }
      case 'unsupported':
        return {
          variant: 'secondary' as const,
          className: 'bg-red-500/20 text-red-300 border-red-400/30'
        }
      case 'unknown':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        }
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        }
    }
  }

  return (
    <Link href={`/printer/${printerId}`} className="h-full">
      <Card className="h-full flex flex-col bg-gradient-card border border-border/50 rounded-2xl shadow-card backdrop-blur-sm group transition-all duration-300 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <PrinterIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {printer.model}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">{printer.manufacturer}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {printer.driverCount ? `${printer.driverCount} driver${printer.driverCount > 1 ? 's' : ''} available` : 'No drivers available'}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-2 w-full">
            <Badge variant="outline" className="text-xs border-border bg-muted/50 text-muted-foreground">
              {printer.type}
            </Badge>
            <Badge
              variant={getStatusStyling(accurateStatus).variant}
              className={getStatusStyling(accurateStatus).className}
            >
              {accurateStatus}
            </Badge>
            {
              (printer.driverCount ?? 0) >= 0 && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                  {printer.driverCount ?? 0} driver{(printer.driverCount ?? 0) > 1 ? 's' : ''}
                </Badge>
              )
            }
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
