"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, PrinterIcon, FileText, Loader2 } from "lucide-react"
import { getBasePath } from "@/lib/utils"

function PPDViewContent() {
  const searchParams = useSearchParams()
  const printerId = searchParams.get("printer")
  const driverId = searchParams.get("driver")

  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ppdUrl =
    printerId && driverId ? `${getBasePath()}/ppd/${printerId}/${driverId}.ppd` : null

  useEffect(() => {
    if (!ppdUrl) {
      setError("Missing printer or driver parameter.")
      setLoading(false)
      return
    }

    async function fetchPPD() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(ppdUrl as string)
        if (!res.ok) {
          throw new Error(`PPD file not found (${res.status})`)
        }
        const text = await res.text()
        setContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PPD file")
      } finally {
        setLoading(false)
      }
    }

    fetchPPD()
  }, [ppdUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href={printerId ? `/printer/${printerId}` : "/"}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-gradient-card border-border/50 text-muted-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mr-3" />
            <span className="text-muted-foreground text-lg">Loading PPD file...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href={printerId ? `/printer/${printerId}` : "/"}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-gradient-card border-border/50 text-muted-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="py-20 text-center">
            <div className="p-6 rounded-full bg-destructive/10 border border-destructive/20 text-destructive w-24 h-24 mx-auto mb-8 flex items-center justify-center">
              <FileText className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">PPD File Not Found</h1>
            <p className="text-muted-foreground text-lg mb-8">
              {error || "The requested PPD file could not be loaded."}
            </p>
            <Link href={printerId ? `/printer/${printerId}` : "/"}>
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Printer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href={printerId ? `/printer/${printerId}` : "/"}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-gradient-card border-border/50 text-muted-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PrinterIcon className="h-4 w-4" />
              <span>OpenPrinting Database</span>
            </div>
          </div>

          {ppdUrl && (
            <a href={ppdUrl} download={`${printerId}-${driverId}.ppd`}>
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PPD
              </Button>
            </a>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {printerId} — {driverId}.ppd
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              PostScript Printer Description file
            </p>
          </div>
        </div>

        {/* PPD Content */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50">
            <span className="text-sm font-medium text-muted-foreground font-mono">
              {printerId}-{driverId}.ppd
            </span>
            <span className="text-xs text-muted-foreground">{content.split("\n").length} lines</span>
          </div>
          <pre className="p-4 overflow-auto text-sm font-mono text-foreground bg-muted/20 leading-relaxed whitespace-pre">
            {content}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function PPDViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mr-3" />
          <span className="text-muted-foreground text-lg">Loading...</span>
        </div>
      }
    >
      <PPDViewContent />
    </Suspense>
  )
}
