import type { Product, ProductCategory } from '@lib/products';

export const productCategories: ProductCategory[] = [
  {
    slug: 'laptops',
    label: 'Laptops',
    eyebrow: 'Work, study, and creator machines',
    description: 'Business, student, creator, and performance laptops selected around condition, warranty, memory, storage, and real daily use.',
    seoTitle: 'Laptops in Nairobi',
    seoDescription: 'Shop HP, Dell, Lenovo, MacBook, and business laptops in Nairobi with clear specs, condition notes, warranty guidance, and Kenya delivery support.'
  },
  {
    slug: 'smartphones',
    label: 'Smartphones',
    eyebrow: 'Everyday devices and accessories',
    description: 'iPhones, Samsung Galaxy, Android phones, and phone essentials with practical guidance on storage, battery, warranty, and accessories.',
    seoTitle: 'Smartphones in Nairobi',
    seoDescription: 'Browse iPhone, Samsung, and Android smartphones in Nairobi with clear pricing, storage guidance, availability notes, and Kenya delivery support.'
  },
  {
    slug: 'desktops',
    label: 'Desktops',
    eyebrow: 'Reliable office setups',
    description: 'Office towers, mini PCs, all-in-one systems, and workstations for reception desks, admin teams, home offices, and business procurement.',
    seoTitle: 'Desktop Computers in Nairobi',
    seoDescription: 'Shop office desktops, mini PCs, all-in-one computers, and workstations in Nairobi for business and home office setups.'
  },
  {
    slug: 'printers',
    label: 'Printers',
    eyebrow: 'Home and business printing',
    description: 'Ink tank, laser, refill, toner, and office printers selected for running cost, workload, supplies, and dependable local support.',
    seoTitle: 'Printers in Nairobi',
    seoDescription: 'Shop HP, Epson, laser, and ink tank printers in Nairobi with practical guidance on supplies, print volume, warranty, and delivery.'
  },
  {
    slug: 'storage',
    label: 'Storage',
    eyebrow: 'Upgrade essentials',
    description: 'SSDs, hard drives, flash drives, RAM, and memory cards for laptop upgrades, backups, transfers, and office storage needs.',
    seoTitle: 'Computer Storage in Nairobi',
    seoDescription: 'Shop SSDs, hard drives, flash drives, RAM, and storage accessories in Nairobi with clear capacity and compatibility guidance.'
  }
];

export const products: Product[] = [
  {
    id: 'hp-elitebook-840-g7',
    slug: 'hp-elitebook-840-g7-core-i5',
    name: 'HP EliteBook 840 G7 Core i5',
    brand: 'HP',
    category: 'laptops',
    price: { amount: 68000, currency: 'KES', compareAtAmount: 74500 },
    images: [],
    inStock: true,
    featured: true,
    description: 'A dependable business laptop for office work, study, remote meetings, and everyday productivity.',
    highlights: ['14-inch business class chassis', 'Core i5 performance for daily work', 'SSD storage for fast startup', 'Lightweight and travel friendly'],
    specs: [
      { label: 'Processor', value: 'Intel Core i5' },
      { label: 'Memory', value: '8GB RAM' },
      { label: 'Storage', value: '256GB SSD' },
      { label: 'Display', value: '14-inch Full HD' },
      { label: 'Use case', value: 'Office, study, remote work' }
    ],
    condition: 'Refurbished',
    warranty: '3-month shop warranty',
    availabilityNote: 'Available for Nairobi pickup or Kenya delivery.',
    relatedProductSlugs: ['dell-latitude-7420-core-i7', 'lenovo-thinkcentre-m720-office-desktop']
  },
  {
    id: 'dell-latitude-7420',
    slug: 'dell-latitude-7420-core-i7',
    name: 'Dell Latitude 7420 Core i7',
    brand: 'Dell',
    category: 'laptops',
    price: { amount: 88500, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true,
    description: 'A premium business laptop for buyers who need stronger multitasking and a compact professional machine.',
    highlights: ['Core i7 class performance', 'Premium Latitude build', 'Fast SSD storage', 'Good fit for managers and power users'],
    specs: [
      { label: 'Processor', value: 'Intel Core i7' },
      { label: 'Memory', value: '16GB RAM' },
      { label: 'Storage', value: '512GB SSD' },
      { label: 'Display', value: '14-inch Full HD' },
      { label: 'Use case', value: 'Business, multitasking, travel' }
    ],
    condition: 'Refurbished',
    warranty: '3-month shop warranty',
    availabilityNote: 'Limited units. Confirm current condition and battery health before purchase.',
    relatedProductSlugs: ['hp-elitebook-840-g7-core-i5', 'samsung-galaxy-a55-5g']
  },
  {
    id: 'samsung-galaxy-a55',
    slug: 'samsung-galaxy-a55-5g',
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    category: 'smartphones',
    price: { amount: 52500, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true,
    description: 'A balanced Android smartphone for daily use, social media, photography, and reliable battery life.',
    highlights: ['5G-ready Galaxy device', 'Strong everyday camera setup', 'Smooth display experience', 'Good storage for apps and media'],
    specs: [
      { label: 'Storage', value: '256GB' },
      { label: 'Memory', value: '8GB RAM' },
      { label: 'Network', value: '5G' },
      { label: 'Battery', value: 'All-day class' },
      { label: 'Use case', value: 'Daily smartphone, camera, media' }
    ],
    condition: 'New',
    warranty: 'Manufacturer warranty where applicable',
    availabilityNote: 'Confirm color and storage availability before checkout.',
    relatedProductSlugs: ['iphone-13-128gb-refurbished', 'sandisk-ultra-dual-drive-128gb']
  },
  {
    id: 'iphone-13-128gb',
    slug: 'iphone-13-128gb-refurbished',
    name: 'iPhone 13 128GB',
    brand: 'Apple',
    category: 'smartphones',
    price: { amount: 64500, currency: 'KES', compareAtAmount: 70000 },
    images: [],
    inStock: true,
    description: 'A clean iPhone option for buyers who want dependable performance, camera quality, and long software support.',
    highlights: ['128GB storage', 'Strong camera and video quality', 'iOS ecosystem support', 'Compact daily carry size'],
    specs: [
      { label: 'Storage', value: '128GB' },
      { label: 'Display', value: '6.1-inch Super Retina XDR' },
      { label: 'Camera', value: 'Dual rear camera' },
      { label: 'Security', value: 'Face ID' },
      { label: 'Use case', value: 'Daily iPhone, camera, social media' }
    ],
    condition: 'Refurbished',
    warranty: 'Shop warranty after inspection',
    availabilityNote: 'Battery health and cosmetic grade should be confirmed per unit.',
    relatedProductSlugs: ['samsung-galaxy-a55-5g', 'hp-elitebook-840-g7-core-i5']
  },
  {
    id: 'lenovo-thinkcentre-m720',
    slug: 'lenovo-thinkcentre-m720-office-desktop',
    name: 'Lenovo ThinkCentre M720 Office Desktop',
    brand: 'Lenovo',
    category: 'desktops',
    price: { amount: 42000, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true,
    description: 'A compact office desktop for reception desks, accounts teams, admin stations, and school computer labs.',
    highlights: ['Compact office footprint', 'Stable business desktop platform', 'SSD-ready configuration', 'Good for bundled office setups'],
    specs: [
      { label: 'Processor', value: 'Intel Core i5' },
      { label: 'Memory', value: '8GB RAM' },
      { label: 'Storage', value: '256GB SSD' },
      { label: 'Form factor', value: 'Small form factor desktop' },
      { label: 'Use case', value: 'Office, reception, admin work' }
    ],
    condition: 'Refurbished',
    warranty: '3-month shop warranty',
    availabilityNote: 'Monitor, keyboard, and mouse bundles can be quoted on request.',
    relatedProductSlugs: ['epson-ecotank-l3250-printer', 'hp-elitebook-840-g7-core-i5']
  },
  {
    id: 'epson-ecotank-l3250',
    slug: 'epson-ecotank-l3250-printer',
    name: 'Epson EcoTank L3250 Printer',
    brand: 'Epson',
    category: 'printers',
    price: { amount: 29500, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true,
    description: 'A practical ink tank printer for home offices, school work, and small business printing with lower running costs.',
    highlights: ['Ink tank running cost advantage', 'Print, scan, and copy support', 'Wireless printing support', 'Good fit for home and small office use'],
    specs: [
      { label: 'Printer type', value: 'Ink tank all-in-one' },
      { label: 'Functions', value: 'Print, scan, copy' },
      { label: 'Connectivity', value: 'USB and Wi-Fi' },
      { label: 'Supplies', value: 'Refill ink bottles' },
      { label: 'Use case', value: 'Home office, school, small business' }
    ],
    condition: 'New',
    warranty: 'Manufacturer warranty where applicable',
    availabilityNote: 'Ink availability and setup support can be confirmed before purchase.',
    relatedProductSlugs: ['hp-laserjet-pro-m404dn', 'lenovo-thinkcentre-m720-office-desktop']
  },
  {
    id: 'hp-laserjet-pro-m404dn',
    slug: 'hp-laserjet-pro-m404dn',
    name: 'HP LaserJet Pro M404dn',
    brand: 'HP',
    category: 'printers',
    price: { amount: 38500, currency: 'KES' },
    images: [],
    inStock: false,
    description: 'A focused monochrome laser printer for teams that need sharper text, faster output, and predictable toner use.',
    highlights: ['Monochrome laser printing', 'Business document workload', 'Duplex printing support', 'Good fit for offices and front desks'],
    specs: [
      { label: 'Printer type', value: 'Monochrome laser' },
      { label: 'Functions', value: 'Print only' },
      { label: 'Duplex', value: 'Automatic duplex' },
      { label: 'Connectivity', value: 'USB and Ethernet' },
      { label: 'Use case', value: 'Office documents and invoices' }
    ],
    condition: 'New',
    warranty: 'Warranty confirmed per supplier batch',
    availabilityNote: 'Check availability before visiting or placing an order.',
    relatedProductSlugs: ['epson-ecotank-l3250-printer', 'kingston-nv2-1tb-nvme-ssd']
  },
  {
    id: 'kingston-nv2-1tb',
    slug: 'kingston-nv2-1tb-nvme-ssd',
    name: 'Kingston NV2 1TB NVMe SSD',
    brand: 'Kingston',
    category: 'storage',
    price: { amount: 9800, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true,
    description: 'A fast internal SSD upgrade for laptops and desktops that support NVMe storage.',
    highlights: ['1TB upgrade capacity', 'NVMe performance', 'Good for OS and apps', 'Useful for laptop and desktop upgrades'],
    specs: [
      { label: 'Capacity', value: '1TB' },
      { label: 'Interface', value: 'NVMe PCIe' },
      { label: 'Form factor', value: 'M.2 2280' },
      { label: 'Compatibility', value: 'NVMe-ready laptops and desktops' },
      { label: 'Use case', value: 'Storage upgrade and faster boot' }
    ],
    condition: 'New',
    warranty: 'Supplier warranty where applicable',
    availabilityNote: 'Compatibility check recommended before installation.',
    relatedProductSlugs: ['sandisk-ultra-dual-drive-128gb', 'hp-elitebook-840-g7-core-i5']
  },
  {
    id: 'sandisk-ultra-dual-128gb',
    slug: 'sandisk-ultra-dual-drive-128gb',
    name: 'SanDisk Ultra Dual Drive 128GB',
    brand: 'SanDisk',
    category: 'storage',
    price: { amount: 2200, currency: 'KES' },
    images: [],
    inStock: true,
    description: 'A compact storage accessory for moving files between compatible phones, laptops, and office devices.',
    highlights: ['128GB portable storage', 'Useful for file transfers', 'Compact daily carry accessory', 'Good add-on with phones and laptops'],
    specs: [
      { label: 'Capacity', value: '128GB' },
      { label: 'Type', value: 'Dual interface flash drive' },
      { label: 'Use case', value: 'Phone and laptop file transfer' },
      { label: 'Portability', value: 'Pocket-size accessory' },
      { label: 'Compatibility', value: 'Confirm port support before purchase' }
    ],
    condition: 'New',
    warranty: 'Supplier warranty where applicable',
    availabilityNote: 'Available as an add-on for phone and laptop buyers.',
    relatedProductSlugs: ['samsung-galaxy-a55-5g', 'kingston-nv2-1tb-nvme-ssd']
  }
];

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((product) => product.category === categorySlug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const explicitRelated = product.relatedProductSlugs
    ?.map((slug) => getProductBySlug(slug))
    .filter((relatedProduct): relatedProduct is Product => Boolean(relatedProduct)) ?? [];
  const categoryFallback = products.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      candidate.category === product.category &&
      !explicitRelated.some((relatedProduct) => relatedProduct.slug === candidate.slug)
  );
  const broaderFallback = products.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      candidate.category !== product.category &&
      !explicitRelated.some((relatedProduct) => relatedProduct.slug === candidate.slug)
  );

  return [...explicitRelated, ...categoryFallback, ...broaderFallback].slice(0, limit);
}
