import fs from "fs/promises"
import { existsSync } from "fs" // Import synchronous check
import path from "path"
import type { PrinterSummary } from "@/lib/types"
import PrinterPageClient from "@/components/PrinterPageClient"

async function getPrinterSummaries(): Promise<PrinterSummary[]> {
  // Use try-catch or existence check since we are handling missing file case in generateStaticParams
  const filePath = path.join(process.cwd(), "public", "foomatic-db", "printersMap.json")

  try {
    const data = await fs.readFile(filePath, "utf-8")
    const json = JSON.parse(data)
    return json.printers
  } catch {
    // If file is missing or invalid, we handle it upstream or return empty
    // But generateStaticParams needs to handle the existence check explicitly
    return []
  }
}

/**
 * NOTE:
 * This project uses `output: "export"` (static export).
 * Next.js requires dynamic routes to provide at least one static path.
 *
 * Data files (printersMap.json) may not exist at build time in CI/devcontainer.
 * If data is missing, we provide a build-only stub to satisfy the build requirement.
 * This stub is not user-facing and is effectively ignored at runtime.
 */
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "foomatic-db", "printersMap.json")

  if (existsSync(filePath)) {
    const printers = await getPrinterSummaries()
    return printers.map((printer) => ({
      id: printer.id,
    }))
  } else {
    // Fallback for CI/devcontainer without generated data
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

  // Runtime guard: Ignore the stub page
  if (id === "__static_export_stub__") {
    return null
  }

  return <PrinterPageClient printerId={id} />
}
