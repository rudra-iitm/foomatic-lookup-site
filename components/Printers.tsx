'use client';

import { useState, useMemo } from 'react';
import { Printer } from '@/data/printers';
import PrinterCard from '@/components/PrinterCard';
import PrinterSearch, { SearchFilters } from '@/components/PrinterSearch';
import { Printer as PrinterIcon, Globe, Database } from 'lucide-react';

interface PrintersProps {
  printers: Printer[];
  manufacturers: string[];
  connectivityOptions: string[];
  printerTypes: string[];
}

const Printers = ({ printers, manufacturers, connectivityOptions, printerTypes }: PrintersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    manufacturer: '',
    connectivity: '',
    type: '',
    status: ''
  });

  const filteredPrinters = useMemo(() => {
    return printers.filter((printer: Printer) => {
      // Search query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          printer.manufacturer,
          printer.model,
          printer.series || '',
          ...printer.features,
          printer.driverSupport.driverName || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      if (filters.manufacturer && printer.manufacturer !== filters.manufacturer) {
        return false;
      }

      if (filters.type && printer.type !== filters.type) {
        return false;
      }

      if (filters.connectivity && !printer.connectivity.includes(filters.connectivity)) {
        return false;
      }

      if (filters.status && printer.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters, printers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                <PrinterIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Foomatic Lookup Page</h1>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <PrinterSearch 
            filters={filters} 
            onFiltersChange={setFilters}
            resultCount={filteredPrinters.length}
            manufacturers={manufacturers}
            connectivityOptions={connectivityOptions}
            printerTypes={printerTypes}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrinters.map((printer) => (
            <PrinterCard key={printer.id} printer={printer} />
          ))}
        </div>

        {filteredPrinters.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <PrinterIcon className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No printers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing the filters.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Static version of the Foomatic printer database • No external API calls • Perfect for GitHub Pages
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <span>✓ Embedded JSON Data</span>
              <span>✓ Client-side Search</span>
              <span>✓ Responsive Design</span>
              <span>✓ Offline Compatible</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Printers;
