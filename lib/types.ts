
export interface Driver {
  id: string;
  name: string;
  url: string;
  comments: string;
  execution: {
    ghostscript: null | object; // More specific than any
    prototype: string;
  };
}

export interface Printer {
  id: string;
  manufacturer: string;
  model: string;
  series: string;
  connectivity: string[];
  recommended_driver: string;
  drivers: Driver[];
  type: string;
  status: string;
  notes: string;
}
