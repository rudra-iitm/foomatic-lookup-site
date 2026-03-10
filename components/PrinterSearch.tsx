"use client"

import { Input } from "@/components/ui/input"
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Search, X, Loader2 } from "lucide-react"
import { getSearchInstance, search, type SearchResult } from "@/lib/foomatic-search"

interface PrinterSearchProps {
  manufacturers: string[]
  driverTypes: string[]
  mechanismTypes: string[]
  supportLevels: string[]
  colorCapabilities: string[]
  onSearch: (query: string) => void
  onFilterManufacturer: (manufacturer: string) => void
  onFilterDriverType: (driverType: string) => void
  onFilterMechanismType: (mechanismType: string) => void
  onFilterSupportLevel: (supportLevel: string) => void
  onFilterColorCapability: (colorCapability: string) => void
  selectedManufacturer: string
  selectedDriverType: string
  selectedMechanismType: string
  selectedSupportLevel: string
  selectedColorCapability: string
  onReset: () => void
  onMiniSearchResults?: (results: SearchResult[] | null) => void
}

export default function PrinterSearch({
  manufacturers,
  driverTypes,
  mechanismTypes,
  supportLevels,
  colorCapabilities,
  onSearch,
  onFilterManufacturer,
  onFilterDriverType,
  onFilterMechanismType,
  onFilterSupportLevel,
  onFilterColorCapability,
  selectedManufacturer,
  selectedDriverType,
  selectedMechanismType,
  selectedSupportLevel,
  selectedColorCapability,
  onReset,
  onMiniSearchResults,
}: PrinterSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [indexLoading, setIndexLoading] = useState(true)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    getSearchInstance()
      .then(() => setIndexLoading(false))
      .catch((e) => {
        console.error("Failed to load search index:", e)
        setIndexLoading(false)
      })
  }, [])

  useEffect(() => {
    const trimmed = debouncedSearchQuery.trim()
    if (trimmed.length < 2) {
      onMiniSearchResults?.(null)
      onSearch("")
      return
    }
    getSearchInstance()
      .then((instance) => {
        const results = search(instance, trimmed)
        onMiniSearchResults?.(results)
        onSearch(debouncedSearchQuery)
      })
      .catch((e) => {
        console.error("MiniSearch error:", e)
        onMiniSearchResults?.(null)
        onSearch(debouncedSearchQuery)
      })
  }, [debouncedSearchQuery, onSearch, onMiniSearchResults])

  const hasActiveFilters = 
    selectedManufacturer !== "all" ||
    selectedDriverType !== "all" ||
    selectedMechanismType !== "all" ||
    selectedSupportLevel !== "all" ||
    selectedColorCapability !== "all" ||
    searchQuery !== ""

  return (
    <Card className="mb-8 bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground">Search and Filter</CardTitle>
          {hasActiveFilters && (
            <Button
              onClick={() => {
                setSearchQuery("")
                onReset()
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search by model or make..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 ${indexLoading ? "pr-10" : ""}`}
            />
            {indexLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SimpleSelect
              value={selectedManufacturer}
              onValueChange={onFilterManufacturer}
              placeholder="All Manufacturers"
              triggerClassName="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
            >
              <SimpleSelectItem value="all">All Manufacturers</SimpleSelectItem>
              {manufacturers.map((manufacturer) => (
                <SimpleSelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>

            <SimpleSelect
              value={selectedDriverType}
              onValueChange={onFilterDriverType}
              placeholder="Driver Type"
              triggerClassName="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
            >
              <SimpleSelectItem value="all">All Driver Types</SimpleSelectItem>
              {driverTypes.map((type) => (
                <SimpleSelectItem key={type} value={type}>
                  {type}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>

            <SimpleSelect
              value={selectedMechanismType}
              onValueChange={onFilterMechanismType}
              placeholder="Mechanism Type"
              triggerClassName="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
            >
              <SimpleSelectItem value="all">All Mechanism Types</SimpleSelectItem>
              {mechanismTypes.map((type) => (
                <SimpleSelectItem key={type} value={type}>
                  {type}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>

            <SimpleSelect
              value={selectedSupportLevel}
              onValueChange={onFilterSupportLevel}
              placeholder="Support Level"
              triggerClassName="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
            >
              <SimpleSelectItem value="all">All Support Levels</SimpleSelectItem>
              {supportLevels.map((level) => (
                <SimpleSelectItem key={level} value={level}>
                  {level}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>

            <SimpleSelect
              value={selectedColorCapability}
              onValueChange={onFilterColorCapability}
              placeholder="Color Capability"
              triggerClassName="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20"
            >
              <SimpleSelectItem value="all">All Color Capabilities</SimpleSelectItem>
              {colorCapabilities.map((capability) => (
                <SimpleSelectItem key={capability} value={capability}>
                  {capability}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
