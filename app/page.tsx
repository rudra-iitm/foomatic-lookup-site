
'use client';

import { useEffect, useState } from 'react';
import { Printer } from '@/lib/types';
import PrinterSearch from '@/components/PrinterSearch';
import Printers from '@/components/Printers';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filteredPrinters, setFilteredPrinters] = useState<Printer[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch('/foomatic-db/printers.json');
      const data = await res.json();
      setPrinters(data.printers);
      setFilteredPrinters(data.printers);

      const uniqueManufacturers = [...new Set(data.printers.map((p: Printer) => p.manufacturer))].sort();
      setManufacturers(uniqueManufacturers as string[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = printers;

    if (selectedManufacturer !== 'all') {
      result = result.filter((p) => p.manufacturer === selectedManufacturer);
    }

    if (searchQuery) {
      result = result.filter((p) =>
        p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrinters(result);
  }, [searchQuery, selectedManufacturer, printers]);

  return (
    <div className="container mx-auto p-4">
      <div className="text-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Foomatic Printer Lookup
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Search for printers and drivers from the Foomatic database.
        </p>
      </div>
      <PrinterSearch
        manufacturers={manufacturers}
        onSearch={setSearchQuery}
        onFilter={setSelectedManufacturer}
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPrinters.length > 0 ? (
        <Printers printers={filteredPrinters} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Printers Found</h2>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
