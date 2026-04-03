"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { withBasePath } from "@/lib/base-path"

function isValidPpdPath(path: string | null) {
  return Boolean(path && (path.startsWith("/ppd/") || path.startsWith("/ppds/")) && !path.includes(".."))
}

function getDownloadName(path: string) {
  const fileName = path.split("/").pop() ?? "printer.ppd"
  return fileName.endsWith(".ppd") ? fileName : `${fileName}.ppd`
}

export default function PpdViewerClient() {
  const searchParams = useSearchParams()
  const requestedPath = searchParams.get("path")
  const normalizedPath = useMemo(
    () => (isValidPpdPath(requestedPath) ? requestedPath : null),
    [requestedPath]
  )

  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPpd() {
      if (!normalizedPath) {
        setError("Invalid PPD path. Only files under /ppd/ can be viewed.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(withBasePath(normalizedPath))
        if (!response.ok) {
          throw new Error(`Failed to load PPD file: ${response.status}`)
        }

        const text = await response.text()
        setContent(text)
      } catch (err) {
        console.error("Failed to load PPD file:", err)
        setError(err instanceof Error ? err.message : "Failed to load PPD file.")
      } finally {
        setLoading(false)
      }
    }

    loadPpd()
  }, [normalizedPath])

  const downloadHref = normalizedPath ? withBasePath(normalizedPath) : "#"

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-gradient-card border-border/50 text-muted-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        {normalizedPath && !loading && !error && (
          <Button asChild className="gap-2">
            <a href={downloadHref} download={getDownloadName(normalizedPath)}>
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        )}
      </div>

      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            PPD Viewer
          </CardTitle>
          <CardDescription className="break-all text-muted-foreground">
            {normalizedPath ?? requestedPath ?? "No file selected"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading PPD file...</span>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <pre className="max-h-[70vh] overflow-auto rounded-lg border border-border/50 bg-muted p-4 text-sm leading-6 text-foreground">
              {content}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
