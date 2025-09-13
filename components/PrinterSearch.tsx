
'use client';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface PrinterSearchProps {
  manufacturers: string[];
  onSearch: (query: string) => void;
  onFilter: (manufacturer: string) => void;
}

export default function PrinterSearch({ manufacturers, onSearch, onFilter }: PrinterSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Search and Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="search"
            placeholder="Search by model or make..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Select onValueChange={onFilter}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Filter by manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
