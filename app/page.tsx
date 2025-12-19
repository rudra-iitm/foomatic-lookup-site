"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import type { PrinterSummary } from "@/lib/types"
import PrinterSearch from "@/components/PrinterSearch"
import Printers from "@/components/Printers"
import { Skeleton } from "@/components/ui/skeleton"
import { PrinterIcon, Database, Zap, Shield } from "lucide-react"
import { calculateAccurateStatus } from "@/lib/utils"

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100, 200, -1] as const
const STORAGE_KEYS = {
  SEARCH: 'printer_search',
  MANUFACTURER: 'printer_manufacturer',
  DRIVER_TYPE: 'printer_driver_type',
  MECHANISM_TYPE: 'printer_mechanism_type',
  SUPPORT_LEVEL: 'printer_support_level',
  COLOR_CAPABILITY: 'printer_color_capability',
  PAGE: 'printer_page',
  ITEMS_PER_PAGE: 'printer_items_per_page',
} as const

function PaginationControls({
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  startIndex,
  endIndex,
  filteredLength,
  totalPages,
}: {
  itemsPerPage: number
  setItemsPerPage: (n: number) => void
  setCurrentPage: (n: number) => void
  startIndex: number
  endIndex: number
  filteredLength: number
  totalPages: number
}) {
  const displayStart = filteredLength === 0 ? 0 : startIndex + 1
  const displayEnd = filteredLength === 0 ? 0 : endIndex

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
        Showing {displayStart}-{displayEnd} of {filteredLength} printers
      </div>
    </div>
  )
}

export default function HomePage() {
  const [printers, setPrinters] = useState<PrinterSummary[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManufacturer, setSelectedManufacturer] = useState("all")
  const [selectedDriverType, setSelectedDriverType] = useState("all")
  const [selectedMechanismType, setSelectedMechanismType] = useState("all")
  const [selectedSupportLevel, setSelectedSupportLevel] = useState("all")
  const [selectedColorCapability, setSelectedColorCapability] = useState("all")
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearch = localStorage.getItem(STORAGE_KEYS.SEARCH)
      const savedManufacturer = localStorage.getItem(STORAGE_KEYS.MANUFACTURER)
      const savedDriverType = localStorage.getItem(STORAGE_KEYS.DRIVER_TYPE)
      const savedMechanismType = localStorage.getItem(STORAGE_KEYS.MECHANISM_TYPE)
      const savedSupportLevel = localStorage.getItem(STORAGE_KEYS.SUPPORT_LEVEL)
      const savedColorCapability = localStorage.getItem(STORAGE_KEYS.COLOR_CAPABILITY)
      const savedPage = localStorage.getItem(STORAGE_KEYS.PAGE)
      const savedItemsPerPage = localStorage.getItem(STORAGE_KEYS.ITEMS_PER_PAGE)
      
      if (savedSearch) setSearchQuery(String(savedSearch))
      if (savedManufacturer) setSelectedManufacturer(String(savedManufacturer))
      if (savedDriverType) setSelectedDriverType(String(savedDriverType))
      if (savedMechanismType) setSelectedMechanismType(String(savedMechanismType))
      if (savedSupportLevel) setSelectedSupportLevel(String(savedSupportLevel))
      if (savedColorCapability) setSelectedColorCapability(String(savedColorCapability))
      if (savedPage) {
        const p = parseInt(savedPage, 10)
        setCurrentPage(Number.isFinite(p) && p > 0 ? p : 1)
      }
      if (savedItemsPerPage) {
        const ip = parseInt(savedItemsPerPage, 10)
        setItemsPerPage(Number.isFinite(ip) ? ip : 20)
      }
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/foomatic-lookup-site') 
          ? '/foomatic-lookup-site' 
          : ''
        const res = await fetch(`${basePath}/foomatic-db/printersMap.json`)
        
        if (!res.ok) {
          throw new Error(`Failed to load printer data: ${res.status}`)
        }
        
        const data = await res.json()
        
        const printersWithStatus: PrinterSummary[] = []
        const manufacturerSet = new Set<string>()
        
        for (const p of data.printers) {
          // Normalize data-provided status values and map legacy 'Partial' to 'Mostly'
          let status = (p.status || calculateAccurateStatus(p)) as string
          if (typeof status === 'string' && status.toLowerCase() === 'partial') {
            status = 'Mostly'
          }
          const printer = {
            ...p,
            status,
          }
          printersWithStatus.push(printer)
          if (p.manufacturer) {
            manufacturerSet.add(p.manufacturer)
          }
        }
        
        setPrinters(printersWithStatus)
        setManufacturers(Array.from(manufacturerSet).sort())
      } catch (err) {
        console.error('Failed to load printer data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load printer data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const driverTypes = useMemo(() => {
    const types = new Set<string>()
    printers.forEach(p => {
      if (p.driverCount && p.driverCount > 0) {
        types.add('Has Drivers')
      } else {
        types.add('No Drivers')
      }
    })
    return Array.from(types).sort()
  }, [printers])

  const mechanismTypes = useMemo(() => {
    const types = new Set<string>()
    printers.forEach(p => {
      if (p.type) {
        types.add(p.type)
      }
    })
    return Array.from(types).sort()
  }, [printers])

  const supportLevels = useMemo(() => {
    return ['Perfect', 'Mostly', 'Unsupported', 'Unknown']
  }, [])

  const colorCapabilities = useMemo(() => {
    return ['color', 'monochrome', 'unknown']
  }, [])

  const filteredPrinters = useMemo(() => {
    let result = printers

    if (selectedManufacturer !== "all") {
      result = result.filter((p) => p.manufacturer === selectedManufacturer)
    }

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          (p.model && String(p.model).toLowerCase().includes(queryLower)) ||
          (p.manufacturer && String(p.manufacturer).toLowerCase().includes(queryLower)),
      )
    }

    if (selectedDriverType !== "all") {
      if (selectedDriverType === 'Has Drivers') {
        result = result.filter((p) => (p.driverCount ?? 0) > 0)
      } else if (selectedDriverType === 'No Drivers') {
        result = result.filter((p) => (p.driverCount ?? 0) === 0)
      }
    }

    if (selectedMechanismType !== "all") {
      result = result.filter((p) => p.type === selectedMechanismType)
    }

    if (selectedSupportLevel !== "all") {
      result = result.filter((p) => p.status === selectedSupportLevel)
    }

    if (selectedColorCapability !== "all") {
      result = result.filter((p) => {
        const type = p.type?.toLowerCase() || ''
        const model = typeof p.model === "string" ? p.model.toLowerCase() : ""
        if (selectedColorCapability === 'color') {
          return type.includes('color') || model.includes('color')
        } else if (selectedColorCapability === 'monochrome') {
          return type.includes('mono') || type.includes('dot-matrix') || model.includes('mono')
        }
        return true
      })
    }

    return result
  }, [searchQuery, selectedManufacturer, selectedDriverType, selectedMechanismType, selectedSupportLevel, selectedColorCapability, printers])

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredPrinters])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(STORAGE_KEYS.SEARCH, String(searchQuery).trim())
    localStorage.setItem(STORAGE_KEYS.MANUFACTURER, selectedManufacturer)
    localStorage.setItem(STORAGE_KEYS.DRIVER_TYPE, selectedDriverType)
    localStorage.setItem(STORAGE_KEYS.MECHANISM_TYPE, selectedMechanismType)
    localStorage.setItem(STORAGE_KEYS.SUPPORT_LEVEL, selectedSupportLevel)
    localStorage.setItem(STORAGE_KEYS.COLOR_CAPABILITY, selectedColorCapability)
    localStorage.setItem(STORAGE_KEYS.PAGE, currentPage.toString())
    localStorage.setItem(STORAGE_KEYS.ITEMS_PER_PAGE, itemsPerPage.toString())
  }, [searchQuery, selectedManufacturer, selectedDriverType, selectedMechanismType, selectedSupportLevel, selectedColorCapability, currentPage, itemsPerPage])

  const resetFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedManufacturer("all")
    setSelectedDriverType("all")
    setSelectedMechanismType("all")
    setSelectedSupportLevel("all")
    setSelectedColorCapability("all")
    setCurrentPage(1)
    setItemsPerPage(20)
    
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }, [])

  const totalPages = useMemo(() => {
    if (itemsPerPage === -1) return 1
    return Math.ceil(filteredPrinters.length / itemsPerPage)
  }, [filteredPrinters.length, itemsPerPage])

  const displayedPrinters = useMemo(() => {
    if (itemsPerPage === -1) return filteredPrinters
    const startIndex = Math.max(0, (currentPage - 1) * itemsPerPage)
    const endIndex = startIndex + itemsPerPage
    return filteredPrinters.slice(startIndex, endIndex)
  }, [filteredPrinters, currentPage, itemsPerPage])

  const startIndex = useMemo(() => (itemsPerPage === -1 ? 0 : Math.max(0, (currentPage - 1) * itemsPerPage)), [currentPage, itemsPerPage])
  const endIndex = useMemo(() => (itemsPerPage === -1 ? filteredPrinters.length : Math.min(startIndex + itemsPerPage, filteredPrinters.length)), [startIndex, itemsPerPage, filteredPrinters.length])

  useEffect(() => {
    if (itemsPerPage === -1) {
      setCurrentPage(1)
      return
    }
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [totalPages, itemsPerPage, currentPage])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [totalPages, currentPage])

  

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 mb-16 animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-card border border-border/50 shadow-card backdrop-blur-sm mb-8">
              <PrinterIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground tracking-wide">OpenPrinting Project</span>
            </div>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Foomatic
            </span>
            <br />
            <span className="text-4xl lg:text-5xl text-muted-foreground font-light tracking-wide">
              Printer Database
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12 font-light">
            Discover and explore printers from the comprehensive Foomatic database maintained by the OpenPrinting
            community. Find drivers, specifications, and compatibility information for seamless Linux printing.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-card border border-border/30 shadow-card backdrop-blur-sm">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">Open Source Drivers</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-card border border-border/30 shadow-card backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">Linux Compatible</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-card border border-border/30 shadow-card backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">Community Maintained</span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <PrinterSearch 
            manufacturers={manufacturers}
            driverTypes={driverTypes}
            mechanismTypes={mechanismTypes}
            supportLevels={supportLevels}
            colorCapabilities={colorCapabilities}
            onSearch={setSearchQuery}
            onFilterManufacturer={setSelectedManufacturer}
            onFilterDriverType={setSelectedDriverType}
            onFilterMechanismType={setSelectedMechanismType}
            onFilterSupportLevel={setSelectedSupportLevel}
            onFilterColorCapability={setSelectedColorCapability}
            selectedManufacturer={selectedManufacturer}
            selectedDriverType={selectedDriverType}
            selectedMechanismType={selectedMechanismType}
            selectedSupportLevel={selectedSupportLevel}
            selectedColorCapability={selectedColorCapability}
            onReset={resetFilters}
          />
        </div>

        {error ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/50 shadow-elegant backdrop-blur-sm w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <PrinterIcon className="h-16 w-16 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Failed to load printer data</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card backdrop-blur-sm"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-12 w-12 rounded-xl bg-muted/50" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-3/4 bg-muted/50" />
                    <Skeleton className="h-4 w-1/2 bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-md bg-muted/50" />
                    <Skeleton className="h-6 w-24 rounded-md bg-muted/50" />
                  </div>
                  <Skeleton className="h-4 w-full bg-muted/50" />
                  <Skeleton className="h-4 w-2/3 bg-muted/50" />
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-10 flex-1 rounded-lg bg-muted/50" />
                    <Skeleton className="h-10 w-12 rounded-lg bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPrinters.length > 0 ? (
          <div className="animate-fade-in">
            <PaginationControls
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
              startIndex={startIndex}
              endIndex={endIndex}
              filteredLength={filteredPrinters.length}
              totalPages={totalPages}
            />
            <Printers printers={displayedPrinters} />
            
            {totalPages > 1 && (
              <div className="mt-12">
                
                <div className="text-center mb-6 text-sm text-muted-foreground">
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedManufacturer !== "all" && ` from ${selectedManufacturer}`}
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-gradient-card text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary text-primary-foreground shadow-lg cursor-pointer'
                            : page === '...'
                            ? 'text-muted-foreground cursor-default'
                            : 'text-foreground hover:bg-muted/50 border border-border/30 cursor-pointer'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-gradient-card text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-center mt-4 text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 animate-fade-in">
            <div className="p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-elegant backdrop-blur-sm w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <PrinterIcon className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">No Printers Found</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Try adjusting your search terms or filter criteria to find the printer you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
