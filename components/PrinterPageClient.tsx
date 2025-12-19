"use client"

import { useEffect, useState } from "react"
import type { Printer } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, PrinterIcon, ExternalLink, Code, Info, Loader2 } from "lucide-react"
import { calculateAccurateStatus } from "@/lib/utils"

interface PrinterPageClientProps {
  printerId: string;
}

export default function PrinterPageClient({
  printerId,
}: PrinterPageClientProps) {
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const basePath =
    process.env.NODE_ENV === "production" ? "/foomatic-lookup-site" : "";

  const getStatusStyling = (status: string) => {
    switch (status.toLowerCase()) {
      case "perfect":
        return {
          variant: "default" as const,
          className: "bg-green-500/20 text-green-300 border-green-400/30",
        }
      case "mostly":
      case "partial":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
        }
      case "unsupported":
        return {
          variant: "secondary" as const,
          className: "bg-red-500/20 text-red-300 border-red-400/30",
        }
      case "unknown":
        return {
          variant: "secondary" as const,
          className: "bg-gray-500/20 text-gray-300 border-gray-400/30",
        }
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500/20 text-gray-300 border-gray-400/30",
        }
    }
  };

  useEffect(() => {
    async function fetchPrinter() {
      try {
        setLoading(true)
        setError(null)

        const basePath =
          typeof window !== "undefined" && window.location.pathname.startsWith("/foomatic-lookup-site")
            ? "/foomatic-lookup-site"
            : ""

        const res = await fetch(`${basePath}/foomatic-db/printers/${printerId}.json`)

        if (!res.ok) {
          throw new Error(`Failed to load printer: ${res.status}`);
        }

        const data = await res.json()
        setPrinter(data)
      } catch (err) {
        console.error("Failed to load printer:", err)
        setError(err instanceof Error ? err.message : "Failed to load printer")
      } finally {
        setLoading(false);
      }
    }

    fetchPrinter();
  }, [printerId, basePath]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
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
          <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
            <PrinterIcon className="h-4 w-4" />
            <span>OpenPrinting Database</span>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-5 w-20" />
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <Skeleton className="h-8 w-48" />
            </div>

            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50 shadow-card">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !printer) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-20">
          <div className="p-6 rounded-full bg-destructive/10 border border-destructive/20 text-destructive w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <PrinterIcon className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Printer not found</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {error || "This printer may have been removed or doesn't exist in the OpenPrinting database."}
          </p>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to all printers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
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

        <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
          <PrinterIcon className="h-4 w-4" />
          <span>OpenPrinting Database</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex items-start gap-4 mb-8">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
          <PrinterIcon className="h-8 w-8 text-primary" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{printer.model}</h1>
          <p className="text-xl text-muted-foreground">{printer.manufacturer}</p>

          <div className="flex items-center gap-3 mt-3">
            {(() => {
              const accurateStatus = calculateAccurateStatus(printer)
              const style = getStatusStyling(accurateStatus)
              return <Badge variant={style.variant} className={style.className}>{accurateStatus}</Badge>
            })()}

            <Badge variant="outline" className="border-border bg-muted/50 text-muted-foreground">
              {printer.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CARD */}
        <div>
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Printer Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">{printer.manufacturer}</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
              <p className="text-foreground">{printer.type}</p>

              <Separator className="my-4 bg-border" />

              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              {(() => {
                const accurateStatus = calculateAccurateStatus(printer)
                const style = getStatusStyling(accurateStatus)
                return <Badge variant={style.variant} className={style.className}>{accurateStatus}</Badge>
              })()}

              {printer.notes && (
                <>
                  <Separator className="my-4 bg-border" />
                  <h3 className="font-semibold mb-2 text-foreground">Notes</h3>
                  <div
                    className="prose prose-sm prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: printer.notes }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION — DRIVERS */}
        <div className="lg:col-span-2">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <Code className="h-7 w-7 text-primary" />
              Available Drivers
            </h2>
            <div className="space-y-6">
              {(printer.drivers ?? [])
                .sort((a, b) => {
                  // Put recommended driver first
                  if (a.id === printer.recommended_driver) return -1;
                  if (b.id === printer.recommended_driver) return 1;
                  return 0;
                })
                .map((driver) => (
                  <Card
                    key={driver.id}
                    className="bg-gradient-card border-border/50 shadow-card"
                  >
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-foreground">
                          {driver.name}
                        </CardTitle>
                        {driver.url && (
                          <Link
                            href={driver.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/90 hover:underline flex items-center gap-1 mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {driver.url}
                          </Link>
                        )}
                      </div>
                      {driver.id === printer.recommended_driver && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                          Recommended
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Comments
                          </h4>
                          <div
                            className="prose prose-sm prose-invert max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html:
                                driver.comments || "No comments available.",
                            }}
                          />
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          {(() => {

                            const cleanPrinterId = printer.id.replace(
                              "printer/",
                              ""
                            );


                            const cleanDriverId = driver.id.replace(
                              "driver/",
                              ""
                            );


                            const ppdName = `${cleanPrinterId}-${cleanDriverId}`;

                            return (
                              <div className="flex flex-wrap gap-3">
                                {/* View Button */}
                                <Link
                                  href={`${basePath}/view/${ppdName}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary/50 border border-border rounded-md hover:bg-secondary/80 transition-colors"
                                >
                                  <Code className="h-4 w-4" />
                                  View PPD Source
                                </Link>

                                {/* Download Button */}
                                <a
                                  href={`${basePath}/ppds/${ppdName}.ppd`}
                                  download
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Download PPD
                                </a>
                              </div>
                            );
                          })()}
                        </div>
                        {/* --- END NEW BUTTONS --- */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
