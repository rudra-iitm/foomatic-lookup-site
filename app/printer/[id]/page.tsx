import fs from "fs/promises"
import { existsSync } from "fs" // Import synchronous check
import path from "path"
import type { PrinterSummary } from "@/lib/types"
import PrinterPageClient from "@/components/PrinterPageClient"

async function getPrinterSummaries(): Promise<PrinterSummary[]> {
  const filePath = path.join(process.cwd(), "public", "foomatic-db", "printersMap.json")

  try {
    const data = await fs.readFile(filePath, "utf-8")
    const json = JSON.parse(data)
    return json.printers
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "foomatic-db", "printersMap.json")

  if (existsSync(filePath)) {
    const printers = await getPrinterSummaries()
    return printers.map((printer) => ({
      id: printer.id,
    }))
  } else {
    return [{ id: "__static_export_stub__" }]
  }
}

interface PrinterPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PrinterPage({ params }: PrinterPageProps) {
  const { id } = await params

  if (id === "__static_export_stub__") {
    return null
  }

  return <PrinterPageClient printerId={id} />
}

