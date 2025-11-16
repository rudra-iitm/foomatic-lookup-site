"use client"

import { Input } from "@/components/ui/input"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Search, Filter, X, RotateCcw } from "lucide-react"

interface PrinterSearchProps {
  manufacturers: string[]
  onSearch: (query: string) => void
  searchQuery: string
  selectedManufacturer: string
  selectedType: string
  selectedStatus: string
  selectedDriverFilter: string
  itemsPerPage: number
  onManufacturerFilter: (manufacturer: string) => void
  onTypeFilter: (type: string) => void
  onStatusFilter: (status: string) => void
  onDriverFilter: (driverFilter: string) => void
  onItemsPerPageChange: (value: string) => void
  onResetFilters: () => void
}

export default function PrinterSearch({ 
  manufacturers, 
  onSearch,
  searchQuery: externalSearchQuery,
  selectedManufacturer,
  selectedType,
  selectedStatus,
  selectedDriverFilter,
  itemsPerPage,
  onManufacturerFilter,
  onTypeFilter,
  onStatusFilter,
  onDriverFilter,
  onItemsPerPageChange,
  onResetFilters
}: PrinterSearchProps) {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Sync external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery)
  }, [externalSearchQuery])

  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  // Check if any filters are active
  const hasActiveFilters = 
    searchQuery !== "" ||
    selectedManufacturer !== "all" ||
    selectedType !== "all" ||
    selectedStatus !== "all" ||
    selectedDriverFilter !== "all"

  return (
    <Card className="mb-8 bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground">Search and Filter</CardTitle>
          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Items per page:</span>
              <SimpleSelect
                value={itemsPerPage.toString()}
                onValueChange={onItemsPerPageChange}
                triggerClassName="w-[100px] sm:w-[120px] h-9"
              >
                <SimpleSelect.Trigger />
                <SimpleSelect.Content className="bg-popover/95 backdrop-blur-sm border-border shadow-lg">
                  <SimpleSelect.Item value="20">20</SimpleSelect.Item>
                  <SimpleSelect.Item value="50">50</SimpleSelect.Item>
                  <SimpleSelect.Item value="100">100</SimpleSelect.Item>
                  <SimpleSelect.Item value="200">200</SimpleSelect.Item>
                </SimpleSelect.Content>
              </SimpleSelect>
            </div>
            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                onClick={onResetFilters}
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-muted/50 border-border/50 text-foreground hover:bg-muted/80"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search by model or manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manufacturer Filter */}
            <div className="relative">
              <SimpleSelect
                value={selectedManufacturer}
                onValueChange={onManufacturerFilter}
                placeholder="Manufacturer"
                triggerClassName="h-12"
              >
                <SimpleSelect.Trigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span>All Manufacturers</span>
                  </div>
                </SimpleSelect.Trigger>
                <SimpleSelect.Content className="bg-popover/95 backdrop-blur-sm border-border shadow-lg">
                  <SimpleSelect.Item value="all">All Manufacturers</SimpleSelect.Item>
                  {manufacturers.map((manufacturer) => (
                    <SimpleSelect.Item key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SimpleSelect.Item>
                  ))}
                </SimpleSelect.Content>
              </SimpleSelect>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <SimpleSelect
                value={selectedType}
                onValueChange={onTypeFilter}
                placeholder="Printer Type"
                triggerClassName="h-12"
              >
                <SimpleSelect.Trigger />
                <SimpleSelect.Content className="bg-popover/95 backdrop-blur-sm border-border shadow-lg">
                  <SimpleSelect.Item value="all">All Types</SimpleSelect.Item>
                  <SimpleSelect.Item value="laser">Laser</SimpleSelect.Item>
                  <SimpleSelect.Item value="inkjet">Inkjet</SimpleSelect.Item>
                  <SimpleSelect.Item value="dot-matrix">Dot Matrix</SimpleSelect.Item>
                  <SimpleSelect.Item value="unknown">Unknown</SimpleSelect.Item>
                </SimpleSelect.Content>
              </SimpleSelect>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <SimpleSelect
                value={selectedStatus}
                onValueChange={onStatusFilter}
                placeholder="Status"
                triggerClassName="h-12"
              >
                <SimpleSelect.Trigger />
                <SimpleSelect.Content className="bg-popover/95 backdrop-blur-sm border-border shadow-lg">
                  <SimpleSelect.Item value="all">All Status</SimpleSelect.Item>
                  <SimpleSelect.Item value="perfect">Perfect</SimpleSelect.Item>
                  <SimpleSelect.Item value="good">Good</SimpleSelect.Item>
                  <SimpleSelect.Item value="partial">Partial</SimpleSelect.Item>
                  <SimpleSelect.Item value="unsupported">Unsupported</SimpleSelect.Item>
                  <SimpleSelect.Item value="deprecated">Deprecated</SimpleSelect.Item>
                  <SimpleSelect.Item value="unknown">Unknown</SimpleSelect.Item>
                </SimpleSelect.Content>
              </SimpleSelect>
            </div>

            {/* Driver Availability Filter */}
            <div className="relative">
              <SimpleSelect
                value={selectedDriverFilter}
                onValueChange={onDriverFilter}
                placeholder="Driver Support"
                triggerClassName="h-12"
              >
                <SimpleSelect.Trigger />
                <SimpleSelect.Content className="bg-popover/95 backdrop-blur-sm border-border shadow-lg">
                  <SimpleSelect.Item value="all">All Printers</SimpleSelect.Item>
                  <SimpleSelect.Item value="has_drivers">Has Drivers</SimpleSelect.Item>
                  <SimpleSelect.Item value="no_drivers">No Drivers</SimpleSelect.Item>
                </SimpleSelect.Content>
              </SimpleSelect>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
