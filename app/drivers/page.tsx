"use client"

import { useEffect, useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Code, Search } from "lucide-react"
import Link from "next/link"

interface Driver {
  id: string
  name: string
  license: string | null
  description: string
  url: string | null
  printerCount: number
  type: string | null
}

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100, -1] as const

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/foomatic-lookup-site') 
          ? '/foomatic-lookup-site' 
          : ''
        const res = await fetch(`${basePath}/foomatic-db/drivers.json`)
        
        if (!res.ok) {
          throw new Error(`Failed to load driver data: ${res.status}`)
        }
        
        const data = await res.json()
        
        const driversArray = Array.isArray(data) ? data : (data.drivers || [])
        setDrivers(driversArray)
      } catch (err) {
        console.error('Failed to load driver data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load driver data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredDrivers = useMemo(() => {
    if (!searchQuery.trim()) {
      return drivers
    }
    
    const query = searchQuery.toLowerCase().trim()
    return drivers.filter((driver) => {
      const nameMatch = (driver.name || '').toLowerCase().includes(query)
      const descMatch = (driver.description || '').toLowerCase().includes(query)
      const typeMatch = (driver.type || '').toLowerCase().includes(query)
      return nameMatch || descMatch || typeMatch
    })
  }, [searchQuery, drivers])

  const totalPages = useMemo(() => {
    if (itemsPerPage === -1) return 1
    return Math.ceil(filteredDrivers.length / itemsPerPage)
  }, [filteredDrivers.length, itemsPerPage])

  const displayedDrivers = useMemo(() => {
    if (itemsPerPage === -1) return filteredDrivers
    const start = (currentPage - 1) * itemsPerPage
    return filteredDrivers.slice(start, start + itemsPerPage)
  }, [filteredDrivers, currentPage, itemsPerPage])

  const startIndex = useMemo(() => {
    if (itemsPerPage === -1) return 0
    return (currentPage - 1) * itemsPerPage
  }, [currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    if (itemsPerPage === -1) return filteredDrivers.length
    return Math.min(startIndex + itemsPerPage, filteredDrivers.length)
  }, [startIndex, itemsPerPage, filteredDrivers.length])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const stripHtml = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }

  const getShortDescription = (description: string) => {
    const plain = stripHtml(description)
    if (plain.length <= 120) return plain
    return plain.substring(0, 120) + '...'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Code className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Failed to load driver data</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Printer Driver Listings</h1>
        <p className="text-muted-foreground">
          This is our list of {drivers.length} printer drivers for Linux and Unix.
          You may view information for any given driver and download available files by clicking the relevant links.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10)
              setItemsPerPage(value)
              setCurrentPage(1)
            }}
            className="px-3 py-1.5 rounded-md border border-border/50 bg-gradient-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option === -1 ? 'Show All' : option}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredDrivers.length === 0 ? 0 : startIndex + 1}-{endIndex} of {filteredDrivers.length} drivers
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No drivers found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Drivers listing">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Driver</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Printers</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {displayedDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {driver.name || 'N/A'}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                      {driver.type || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {driver.printerCount || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-md">
                      {driver.description ? getShortDescription(driver.description) : 'No description available.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {displayedDrivers.map((driver) => (
              <div
                key={driver.id}
                className="border border-border/50 rounded-lg p-4 bg-gradient-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="text-primary hover:underline font-semibold"
                  >
                    {driver.name || 'N/A'}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {driver.type || 'Unknown'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Printers: </span>
                    <span className="text-foreground">{driver.printerCount || 0}</span>
                  </div>
                  {driver.description && (
                    <p className="text-muted-foreground text-xs">
                      {getShortDescription(driver.description)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-8">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
