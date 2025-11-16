import type { PrinterSummary, Printer } from "@/lib/types"

/**
 * Calculates accurate printer status based on driver availability and functionality
 * Status priority:
 * - If no drivers: unsupported
 * - Otherwise use the provided status with appropriate mappings
 */
export function calculateAccurateStatus(printer: PrinterSummary | Printer): string {
  let driverCount = 0
  if ('driverCount' in printer) {
    driverCount = printer.driverCount ?? 0
  } else if ('drivers' in printer) {
    driverCount = printer.drivers?.length ?? 0
  }
  
  const currentStatus = printer.status?.toLowerCase() || 'unknown'

  if (driverCount === 0) {
    return 'unsupported'
  }

  // Map common status variations to standard values
  const statusMap: Record<string, string> = {
    'perfect': 'perfect',
    'perfectly': 'perfect',
    'good': 'good',
    'mostly': 'good',
    'partial': 'partial',
    'paperweight': 'unsupported',
    'unsupported': 'unsupported',
    'deprecated': 'deprecated',
    'unknown': 'unknown'
  }

  // Return mapped status or the original status if it's already valid
  const mappedStatus = statusMap[currentStatus]
  if (mappedStatus) {
    return mappedStatus
  }

  // Return the status as-is if it's a known valid status
  const validStatuses = ['perfect', 'good', 'partial', 'unsupported', 'deprecated', 'unknown']
  if (validStatuses.includes(currentStatus)) {
    return currentStatus
  }

  // Default to 'unknown' if status is invalid
  return 'unknown'
}

