"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Search, Filter } from "lucide-react"

interface PrinterSearchProps {
  manufacturers: string[]
  onSearch: (query: string) => void
  onFilter: (manufacturer: string) => void
}

export default function PrinterSearch({ manufacturers, onSearch, onFilter }: PrinterSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  return (
    <Card className="mb-8 bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">Search and Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search by model or make..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
          <div className="relative w-full md:w-[280px]">
            <Select onValueChange={onFilter}>
              <SelectTrigger className="h-12 bg-muted/50 border-border/50 text-foreground focus:border-primary/50 focus:ring-primary/20">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by manufacturer" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-900 border border-border/50 shadow-lg rounded-lg z-[100] text-foreground max-h-64 overflow-y-auto">
                <SelectItem value="all" className="text-foreground hover:bg-muted/50">
                  All Manufacturers
                </SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer} value={manufacturer} className="text-foreground hover:bg-muted/50">
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
