"use client"

import { useEffect, useState } from "react"
import type { PrinterSummary } from "@/lib/types"
import PrinterSearch from "@/components/PrinterSearch"
import Printers from "@/components/Printers"
import { Skeleton } from "@/components/ui/skeleton"
import { PrinterIcon, Database, Zap, Shield } from "lucide-react"

export default function HomePage() {
  const [printers, setPrinters] = useState<PrinterSummary[]>([])
  const [filteredPrinters, setFilteredPrinters] = useState<PrinterSummary[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManufacturer, setSelectedManufacturer] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Use process.env.NODE_ENV to determine the correct base path
        const basePath = process.env.NODE_ENV === 'production' ? '/foomatic-lookup-site' : ''
        const res = await fetch(`${basePath}/foomatic-db/printersMap.json`)
        const data = await res.json()
        setPrinters(data.printers)
        setFilteredPrinters(data.printers)

        const uniqueManufacturers = [...new Set(data.printers.map((p: PrinterSummary) => p.manufacturer))].sort()
        setManufacturers(uniqueManufacturers as string[])
      } catch (error) {
        console.error('Failed to load printer data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = printers

    if (selectedManufacturer !== "all") {
      result = result.filter((p) => p.manufacturer === selectedManufacturer)
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          (p.model ? String(p.model).toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
          (p.manufacturer ? String(p.manufacturer).toLowerCase().includes(searchQuery.toLowerCase()) : false),
      )
    }

    setFilteredPrinters(result)
    
    // Reset pagination when filters change
    setCurrentPage(1)
  }, [searchQuery, selectedManufacturer, printers])

  // Calculate pagination data
  const totalPages = Math.ceil(filteredPrinters.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedPrinters = filteredPrinters.slice(startIndex, endIndex)

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7 // Show up to 7 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 4) {
        // Show first pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ellipsis + last pages
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first page + ellipsis + current range + ellipsis + last page
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
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
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
          
          {/* Feature Highlights */}
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

        {/* Search Section */}
        <div className="mb-12">
          <PrinterSearch 
            manufacturers={manufacturers} 
            onSearch={setSearchQuery} 
            onFilter={setSelectedManufacturer} 
          />
        </div>

        {/* Results Section */}
        {loading ? (
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
            <Printers printers={displayedPrinters} />
            
            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="mt-12">
                {/* Results Summary */}
                <div className="text-center mb-6 text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredPrinters.length)} of {filteredPrinters.length} printers
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedManufacturer !== "all" && ` from ${selectedManufacturer}`}
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4">
                  {/* Previous Button */}
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
                  
                  {/* Page Numbers */}
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
                  
                  {/* Next Button */}
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
                
                {/* Page Info */}
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