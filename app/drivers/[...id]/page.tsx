import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Code, Cpu, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DriverPpdTools from "@/components/DriverPpdTools"
import fs from "node:fs/promises"
import path from "node:path"

type DriverIndexItem = {
  id: string
  name?: string
  license?: string | null
  description?: string
  printerCount?: number
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
  // ids look like "driver/bj10" → URL becomes `/drivers/driver/bj10`
  return index
    .filter((d) => typeof d.id === "string" && d.id.length > 0)
    .map((d) => ({ id: d.id.split("/") }))
}

function stripHtmlPreserveNewlines(html: string): string {
  if (!html) return ""

  // Drop embedded widgets (OpenPrinting embeds iframes in comments).
  const withoutIframes = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, "")

  // Preserve paragraph-ish breaks before stripping tags.
  const withBreaks = withoutIframes
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n")
    .replace(/<\s*p(\s+[^>]*)?>/gi, "\n")
    .replace(/<\s*\/\s*div\s*>/gi, "\n")

  // Strip tags; normalize whitespace but keep newlines meaningful.
  const stripped = withBreaks.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
  return stripped
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
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

function inferDriverType(driverData: unknown): string | null {
  const proto = extractExecutionPrototype(driverData)
  if (!proto) return null
  if (/\bgs\b/.test(proto) || /\bghostscript\b/i.test(proto)) return "Ghostscript built-in"
  return null
}

function extractGhostscriptDevice(driverData: unknown): string | null {
  const proto = extractExecutionPrototype(driverData)
  if (!proto) return null
  const m = proto.match(/-sDEVICE=([^\s]+)/)
  return m?.[1] ?? null
}

function humanizePrinterSlug(slug: string): string {
  // Turn "Canon-BJ-10v" -> "Canon BJ-10v", and replace underscores with spaces.
  return slug.replace("-", " ").replace(/_/g, " ")
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

  const license =
    (typeof driverObj?.["license"] === "string" ? (driverObj["license"] as string) : null) ??
    idx?.license ??
    null

  const description = stripHtmlPreserveNewlines(
    extractCommentsText(driverObj?.["comments"]) || idx?.description || ""
  )
  const printerIds = extractPrinterIds(driverData)
  const printerNames = printerIds.map((pid) => pid.replace(/^printer\//, ""))
  const driverType = inferDriverType(driverData)
  const gsDevice = extractGhostscriptDevice(driverData)
  const executionPrototype = extractExecutionPrototype(driverData)
  const thirdPartySuppliedRaw = driverObj?.["thirdpartysupplied"]
  const thirdPartySupplied =
    typeof thirdPartySuppliedRaw === "string"
      ? thirdPartySuppliedRaw.trim().length > 0
      : Boolean(thirdPartySuppliedRaw)

  const printerCount = printerNames.length || idx?.printerCount || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/drivers" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to drivers
          </Link>
        </Button>
        <div className="text-xs text-muted-foreground truncate">
          {driverId}
        </div>
      </div>

      <Card className="bg-gradient-card border-border/50 shadow-elegant mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-3xl sm:text-4xl text-foreground flex items-center gap-3">
                <Code className="h-6 w-6 text-primary shrink-0" />
                <span className="truncate">{name}</span>
              </CardTitle>
              <CardDescription className="mt-2">
                {printerCount} supported printer{printerCount === 1 ? "" : "s"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant={thirdPartySupplied ? "destructive" : "secondary"}>
                {thirdPartySupplied ? "Third-party" : "Free software"}
              </Badge>
              {driverType ? <Badge variant="outline">{driverType}</Badge> : null}
              {license ? <Badge variant="outline">License: {license}</Badge> : null}
              {gsDevice ? <Badge variant="outline">Device: {gsDevice}</Badge> : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Description</CardTitle>
              <CardDescription>Driver notes and upstream comments.</CardDescription>
            </CardHeader>
            <CardContent>
              {description ? (
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Supported printers</CardTitle>
              <CardDescription>
                Models known to work with this driver (from the database).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {printerNames.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
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
                <p className="text-muted-foreground">No supported printers listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Quick facts
              </CardTitle>
              <CardDescription>Details about this driver entry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Driver ID</span>
                <span className="text-foreground font-medium text-right break-all">{driverId}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Supported printers</span>
                <span className="text-foreground font-medium">{printerCount}</span>
              </div>
              {driverType ? (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground font-medium">{driverType}</span>
                </div>
              ) : null}
              {gsDevice ? (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Ghostscript device</span>
                  <span className="text-foreground font-medium">{gsDevice}</span>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Third-party supplied</span>
                <span className="text-foreground font-medium">{thirdPartySupplied ? "Yes" : "No"}</span>
              </div>

              {executionPrototype ? (
                <details className="mt-3 rounded-lg border border-border/50 bg-muted/30">
                  <summary className="cursor-pointer select-none px-3 py-2 text-sm text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Execution prototype
                  </summary>
                  <pre className="text-xs overflow-auto p-3 whitespace-pre-wrap">
                    {executionPrototype}
                  </pre>
                </details>
              ) : null}
            </CardContent>
          </Card>

          <DriverPpdTools
            driverId={driverId}
            driverName={name}
            printerSlugs={printerNames}
            executionPrototype={executionPrototype}
          />
        </div>
      </div>
    </div>
  )
}

