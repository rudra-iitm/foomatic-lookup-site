import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import DriverPpdTools from "@/components/DriverPpdTools"
import fs from "node:fs/promises"
import path from "node:path"

type DriverIndexItem = {
  id: string
  name?: string
  license?: string | null
  description?: string
  printerCount?: number
  url?: string | null
  type?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getDriverObject(driverFile: unknown): Record<string, unknown> | null {
  if (!isRecord(driverFile)) return null
  const driver = driverFile["driver"]
  return isRecord(driver) ? driver : null
}

async function readDriverIndex(): Promise<DriverIndexItem[]> {
  const p = path.join(process.cwd(), "public", "foomatic-db", "drivers.json")
  const raw = await fs.readFile(p, "utf8").catch(() => null)
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data as DriverIndexItem[]) : []
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  const index = await readDriverIndex()
  return index
    .filter((d) => typeof d.id === "string" && d.id.length > 0)
    .map((d) => ({ id: d.id.split("/") }))
}

const GHOSTSCRIPT_PLACEHOLDER_HTML = `<p class="ghostscript-app-holder"><strong>Ghostscript Printer Application:</strong> <a href="https://github.com/OpenPrinting/ghostscript-printer-app" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://snapcraft.io/ghostscript-printer-app" target="_blank" rel="noopener noreferrer">Snapcraft</a></p>`

/** Strip the standard "This driver is available in the Ghostscript Printer Application" intro so we show only one holder block. */
function stripGhostscriptIntro(html: string): string {
  return html.replace(
    /^\s*<B>\s*This driver is available in the\s+<A\s+[^>]*>Ghostscript Printer Application<\/A>\s*<\/B>\s*<P>\s*/gi,
    ""
  )
}

function sanitizeCommentsHtml(html: string): string {
  if (!html) return ""

  let cleaned = stripGhostscriptIntro(html)
  cleaned = cleaned
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, GHOSTSCRIPT_PLACEHOLDER_HTML)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")

  cleaned = cleaned.replace(
    /<a\s+([^>]*?)>/gi,
    (_match, attrs: string) => {
      const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i)
      if (hrefMatch) {
        return `<a href="${hrefMatch[1]}" target="_blank" rel="noopener noreferrer">`
      }
      return "<a>"
    },
  )

  const allowedTags = new Set([
    "a", "b", "strong", "i", "em", "p", "br", "ul", "ol", "li", "code", "pre",
  ])

  cleaned = cleaned.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (tag, tagName: string) => {
    const name = tagName.toLowerCase()
    if (allowedTags.has(name)) return tag
    if (tag.startsWith("</")) return ""
    const isBlock = ["div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(name)
    return isBlock ? "<br/>" : " "
  })

  return cleaned.replace(/&nbsp;/g, " ").trim()
}

async function readDriverFile(driverId: string): Promise<unknown | null> {
  const fileId = driverId.startsWith("driver/") ? driverId.slice("driver/".length) : driverId
  if (!fileId || fileId.includes("/") || fileId.includes("..")) return null

  const filePath = path.join(process.cwd(), "public", "foomatic-db", "driver", `${fileId}.json`)
  const raw = await fs.readFile(filePath, "utf8").catch(() => null)
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function extractCommentsText(comments: unknown): string {
  if (typeof comments === "string") return comments
  if (isRecord(comments)) {
    const en = comments["en"]
    if (typeof en === "string") return en
    const text = comments["#text"]
    if (typeof text === "string") return text
  }
  return ""
}

function extractPrinterIds(driverData: unknown): string[] {
  const driver = getDriverObject(driverData)
  if (!driver) return []

  const printersObj = driver["printers"]
  if (!isRecord(printersObj)) return []

  const printers = printersObj["printer"]

  if (!printers) return []
  if (Array.isArray(printers)) {
    return printers
      .map((p) => (isRecord(p) && typeof p["id"] === "string" ? (p["id"] as string) : ""))
      .filter(Boolean)
  }
  if (isRecord(printers) && typeof printers["id"] === "string") return [printers["id"] as string]
  return []
}

function extractExecutionPrototype(driverData: unknown): string | null {
  const driver = getDriverObject(driverData)
  if (!driver) return null
  const execution = driver["execution"]
  if (!isRecord(execution)) return null
  const proto = execution["prototype"]
  return typeof proto === "string" ? proto : null
}

function inferDriverType(driverData: unknown): string {
  const driver = getDriverObject(driverData)
  if (!driver) return "Unknown"
  const execution = driver["execution"]
  if (!isRecord(execution)) return "Unknown"

  const keys = Object.keys(execution)

  if (keys.includes("uniprint")) return "Ghostscript Uniprint"
  if (keys.includes("ghostscript")) return "Ghostscript built-in"
  if (keys.includes("cups")) return "CUPS Raster"
  if (keys.includes("ijs")) return "IJS"
  if (keys.includes("postscript")) return "PostScript"
  if (keys.includes("pdf")) return "PDF"
  if (keys.includes("filter")) return "Filter"

  return "Unknown"
}

function isFreeDriver(driverData: unknown): boolean {
  const driver = getDriverObject(driverData)
  if (!driver) return true
  const ts = driver["thirdpartysupplied"]
  if (typeof ts === "string" && ts.trim().length > 0) return false
  return true
}

function humanizePrinterSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/_/g, " ")
}

interface DriverDetailPageProps {
  params: Promise<{ id: string[] }>
}

export default async function DriverDetailPage({ params }: DriverDetailPageProps) {
  const { id } = await params
  const driverId = Array.isArray(id) ? id.join("/") : ""

  const index = await readDriverIndex()
  const idx = index.find((d) => d.id === driverId)
  const driverData = await readDriverFile(driverId)
  if (!idx && !driverData) notFound()

  const driverObj = getDriverObject(driverData)

  const name =
    (typeof driverObj?.["name"] === "string" ? (driverObj["name"] as string) : "") ||
    idx?.name ||
    "Unknown driver"

  const driverUrl =
    (typeof driverObj?.["url"] === "string" ? (driverObj["url"] as string) : null) ??
    idx?.url ??
    null

  const rawComments = extractCommentsText(driverObj?.["comments"]) || idx?.description || ""
  const commentsHtml = sanitizeCommentsHtml(rawComments)

  const printerIds = extractPrinterIds(driverData)
  const printerNames = printerIds.map((pid) => pid.replace(/^printer\//, ""))
  const driverType = driverData ? inferDriverType(driverData) : (idx?.type ?? "Unknown")
  const freeSoftware = driverData ? isFreeDriver(driverData) : true
  const executionPrototype = extractExecutionPrototype(driverData)
  const printerCount = printerNames.length || idx?.printerCount || 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/drivers" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to drivers
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
        {driverUrl ? (
          <a
            href={driverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {name}
          </a>
        ) : (
          name
        )}
      </h1>

      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 mb-6">
        <p className="text-sm text-foreground font-medium">
          {freeSoftware ? "This driver is free software." : "This driver contains third-party supplied components."}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Type: {driverType}
        </p>
      </div>

      <div className="mb-6 space-y-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Generic Instructions: </span>
          <a href="https://openprinting.github.io/cups-doc.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CUPS</a>
          {", "}
          <a href="https://openprinting.github.io/direct-doc.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">no spooler</a>
          {", "}
          <a href="https://openprinting.github.io/ppd-doc.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PPD aware applications/clients</a>
        </p>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Important for Windows clients: </span>
            The CUPS PostScript driver for Windows has a bug which makes it choking on PPD files
            which contain GUI texts longer than 39 characters. Therefore it is recommended to use
            Adobe&apos;s PostScript driver. If you still want to use the CUPS driver, please mark
            &ldquo;GUI texts limited to 39 characters&rdquo; to get an appropriate PPD file.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <DriverPpdTools
          driverId={driverId}
          driverName={name}
          printerSlugs={printerNames}
          executionPrototype={executionPrototype}
        />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
          Comments
        </h2>
        {commentsHtml ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline [&_b]:text-foreground [&_strong]:text-foreground [&_.ghostscript-app-holder]:rounded-lg [&_.ghostscript-app-holder]:border [&_.ghostscript-app-holder]:border-border/50 [&_.ghostscript-app-holder]:bg-muted/20 [&_.ghostscript-app-holder]:p-3 [&_.ghostscript-app-holder]:text-sm"
            dangerouslySetInnerHTML={{ __html: commentsHtml }}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No description available.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
          Printer list
        </h2>
        {printerNames.length > 0 ? (
          <ul className="space-y-1">
            {printerNames.map((p) => (
              <li key={p} className="text-sm">
                <Link
                  href={`/printer/${encodeURIComponent(p)}`}
                  className="text-primary hover:underline"
                >
                  {humanizePrinterSlug(p)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No supported printers listed.</p>
        )}
        {printerCount > 0 && (
          <p className="text-xs text-muted-foreground mt-4">
            {printerCount} printer{printerCount === 1 ? "" : "s"} supported
          </p>
        )}
      </section>
    </div>
  )
}
