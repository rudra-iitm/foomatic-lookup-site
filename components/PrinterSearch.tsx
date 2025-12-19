"use client"

import { Input } from "@/components/ui/input"
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Search, X } from "lucide-react"

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
}: PrinterSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

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
              className="pl-10 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
            />
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
