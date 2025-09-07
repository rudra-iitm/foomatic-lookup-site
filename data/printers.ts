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

export const printers: Printer[] = [
  {
    id: 'hp-laserjet-pro-400-m404n',
    manufacturer: 'HP',
    model: 'LaserJet Pro 400 M404n',
    series: 'LaserJet Pro 400',
    connectivity: ['USB', 'Ethernet'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'hplip',
      driverUrl: 'https://developers.hp.com/hp-linux-imaging-and-printing'
    },
    features: ['Duplex', 'PCL6', 'PostScript'],
    type: 'laser',
    status: 'perfect',
    notes: 'Fully supported with HPLIP driver'
  },
  {
    id: 'canon-pixma-ts8350',
    manufacturer: 'Canon',
    model: 'PIXMA TS8350',
    series: 'PIXMA TS',
    connectivity: ['USB', 'WiFi', 'Ethernet'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'gutenprint',
      driverUrl: 'http://gimp-print.sourceforge.net/'
    },
    features: ['Color', 'Photo Printing', 'Scanning', 'Duplex'],
    type: 'multifunction',
    status: 'good',
    notes: 'Good support via Gutenprint driver'
  },
  {
    id: 'brother-hl-l2350dw',
    manufacturer: 'Brother',
    model: 'HL-L2350DW',
    series: 'HL-L2000',
    connectivity: ['USB', 'WiFi', 'Ethernet'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'brlaser',
      driverUrl: 'https://github.com/pdewacht/brlaser'
    },
    features: ['Duplex', 'Mobile Printing', 'PCL6'],
    type: 'laser',
    status: 'perfect',
    notes: 'Excellent Linux support'
  },
  {
    id: 'epson-wf-3820',
    manufacturer: 'Epson',
    model: 'WorkForce WF-3820',
    series: 'WorkForce',
    connectivity: ['USB', 'WiFi', 'Ethernet'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'epson-inkjet-printer-escpr',
      driverUrl: 'https://download.ebz.epson.net/dsc/search/01/search/'
    },
    features: ['Color', 'Scanning', 'Fax', 'ADF', 'Duplex'],
    type: 'multifunction',
    status: 'good',
    notes: 'Official Epson driver available'
  },
  {
    id: 'hp-officejet-pro-9015e',
    manufacturer: 'HP',
    model: 'OfficeJet Pro 9015e',
    series: 'OfficeJet Pro 9000',
    connectivity: ['USB', 'WiFi', 'Ethernet'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'hplip',
      driverUrl: 'https://developers.hp.com/hp-linux-imaging-and-printing'
    },
    features: ['Color', 'Duplex', 'Scanning', 'Fax', 'ADF'],
    type: 'multifunction',
    status: 'perfect',
    notes: 'Full functionality with HPLIP'
  },
  {
    id: 'samsung-xpress-m2020w',
    manufacturer: 'Samsung',
    model: 'Xpress M2020W',
    series: 'Xpress',
    connectivity: ['USB', 'WiFi'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: true,
      driverName: 'splix',
      driverUrl: 'http://splix.ap2c.org/'
    },
    features: ['Mobile Printing', 'SPL'],
    type: 'laser',
    status: 'good',
    notes: 'Good support with SPLiX driver'
  },
  {
    id: 'xerox-phaser-3020',
    manufacturer: 'Xerox',
    model: 'Phaser 3020',
    series: 'Phaser 3000',
    connectivity: ['USB', 'WiFi'],
    driverSupport: {
      linux: false,
      cups: false,
      foomatic: false
    },
    features: ['Compact Design'],
    type: 'laser',
    status: 'unsupported',
    notes: 'Not supported on Linux'
  },
  {
    id: 'canon-lbp6030w',
    manufacturer: 'Canon',
    model: 'LBP6030w',
    series: 'LBP6000',
    connectivity: ['USB', 'WiFi'],
    driverSupport: {
      linux: true,
      cups: true,
      foomatic: false,
      driverName: 'captdriver',
      driverUrl: 'https://www.canon.com/support/'
    },
    features: ['Compact', 'CAPT Protocol'],
    type: 'laser',
    status: 'partial',
    notes: 'Limited support with proprietary driver'
  }
];

export const manufacturers = Array.from(new Set(printers.map(p => p.manufacturer))).sort();

export const connectivityOptions = Array.from(
  new Set(printers.flatMap(p => p.connectivity))
).sort();

export const printerTypes = Array.from(new Set(printers.map(p => p.type))).sort();