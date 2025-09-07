import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
interface PrinterSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  resultCount: number;
  manufacturers: string[];
  connectivityOptions: string[];
  printerTypes: string[];
}

const PrinterSearch = ({ filters, onFiltersChange, resultCount, manufacturers, connectivityOptions, printerTypes }: PrinterSearchProps) => {
  const clearFilters = () => {
    onFiltersChange({
      query: '',
      manufacturer: '',
      connectivity: '',
      type: '',
      status: ''
    });
  };

  const hasActiveFilters = filters.manufacturer || filters.connectivity || filters.type || filters.status;

  const statusOptions = [
    { value: 'perfect', label: 'Perfect Support' },
    { value: 'good', label: 'Good Support' },
    { value: 'partial', label: 'Partial Support' },
    { value: 'unsupported', label: 'Not Supported' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by printer model, manufacturer, or features..."
          value={filters.query}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
          className="pl-10 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
        </div>
        
        <Select
          value={filters.manufacturer}
          onValueChange={(value) => onFiltersChange({ ...filters, manufacturer: value })}
        >
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="Manufacturer" />
          </SelectTrigger>
          <SelectContent>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer} value={manufacturer}>
                {manufacturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
        >
          <SelectTrigger className="w-40 bg-background/50">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {printerTypes.map((type) => (
              <SelectItem key={type} value={type}>
                <span className="capitalize">{type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.connectivity}
          onValueChange={(value) => onFiltersChange({ ...filters, connectivity: value })}
        >
          <SelectTrigger className="w-40 bg-background/50">
            <SelectValue placeholder="Connectivity" />
          </SelectTrigger>
          <SelectContent>
            {connectivityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="Support Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {resultCount} printer{resultCount !== 1 ? 's' : ''} found
        </div>
        
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.manufacturer && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.manufacturer}
                <button
                  onClick={() => onFiltersChange({ ...filters, manufacturer: '' })}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                {filters.type}
                <button
                  onClick={() => onFiltersChange({ ...filters, type: '' })}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.connectivity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.connectivity}
                <button
                  onClick={() => onFiltersChange({ ...filters, connectivity: '' })}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => onFiltersChange({ ...filters, status: '' })}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterSearch;