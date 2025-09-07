export interface Printer {
  id: string;
  manufacturer: string;
  model: string;
  series?: string;
  connectivity: string[];
  driverSupport: {
    linux: boolean;
    cups: boolean;
    foomatic: boolean;
    driverName?: string;
    driverUrl?: string;
  };
  features: string[];
  type: 'laser' | 'inkjet' | 'matrix' | 'thermal' | 'multifunction';
  status: 'perfect' | 'good' | 'partial' | 'unsupported';
  notes?: string;
}
