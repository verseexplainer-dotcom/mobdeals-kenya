export interface BrandProfile {
  slug: string;
  name: string;
  summary: string;
  categories: string[];
}

export interface ServicePage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  points: string[];
}

export const brandProfiles: BrandProfile[] = [
  {
    slug: 'hp',
    name: 'HP',
    summary: 'Business laptops, EliteBook options, LaserJet printers, and dependable office hardware.',
    categories: ['Laptops', 'Printers', 'Office setups']
  },
  {
    slug: 'dell',
    name: 'Dell',
    summary: 'Latitude laptops and practical business machines for offices, students, and mobile teams.',
    categories: ['Laptops', 'Desktops', 'Business supply']
  },
  {
    slug: 'lenovo',
    name: 'Lenovo',
    summary: 'ThinkPad and ThinkCentre systems for reception desks, admin work, and school labs.',
    categories: ['Laptops', 'Desktops', 'Office bundles']
  },
  {
    slug: 'apple',
    name: 'Apple',
    summary: 'iPhone and MacBook buying support with attention to storage, battery, and condition.',
    categories: ['Smartphones', 'Laptops', 'Accessories']
  },
  {
    slug: 'samsung',
    name: 'Samsung',
    summary: 'Galaxy phones and everyday mobile accessories selected for practical Kenya use.',
    categories: ['Smartphones', 'Accessories']
  },
  {
    slug: 'epson',
    name: 'Epson',
    summary: 'EcoTank printers and refill-focused office printing options for lower running costs.',
    categories: ['Printers', 'Ink supply']
  },
  {
    slug: 'kingston',
    name: 'Kingston',
    summary: 'SSD and memory upgrades for faster laptops, desktops, and storage-heavy workflows.',
    categories: ['Storage', 'Upgrades']
  },
  {
    slug: 'sandisk',
    name: 'SanDisk',
    summary: 'Flash storage and portable file-transfer accessories for phones, laptops, and offices.',
    categories: ['Storage', 'Accessories']
  },
  {
    slug: 'asus',
    name: 'ASUS',
    summary: 'Creator, student, and performance laptop options can be quoted when supplier stock is available.',
    categories: ['Laptops', 'Creator tech', 'Accessories']
  }
];

export const servicePages: ServicePage[] = [
  {
    slug: 'delivery',
    title: 'Delivery Across Kenya',
    eyebrow: 'Dispatch and pickup',
    description: 'Confirm item availability, destination, and delivery timing before payment or pickup.',
    points: [
      'Nairobi pickup and rider dispatch can be arranged after stock confirmation.',
      'Upcountry delivery depends on item size, courier availability, and payment confirmation.',
      'Fragile products such as printers and desktops should be checked on receipt.'
    ]
  },
  {
    slug: 'warranty',
    title: 'Warranty and Condition Guidance',
    eyebrow: 'Before and after purchase',
    description: 'Warranty terms depend on product type, supplier batch, and whether the item is new or refurbished.',
    points: [
      'Refurbished laptops and desktops include shop warranty terms shown on the product page.',
      'New products may include manufacturer or supplier warranty where applicable.',
      'Battery health, cosmetic grade, accessories, and serial details should be confirmed before purchase.'
    ]
  },
  {
    slug: 'track-order',
    title: 'Track an Order',
    eyebrow: 'Order support',
    description: 'Use your order reference, phone number, or WhatsApp conversation to confirm order progress.',
    points: [
      'For pickup orders, confirm the item is reserved before visiting the Nairobi store.',
      'For delivery orders, request dispatch status and courier details from support.',
      'For business supply, quote and invoice references help the team identify the order faster.'
    ]
  }
];

export function getBrandBySlug(slug: string): BrandProfile | undefined {
  return brandProfiles.find((brand) => brand.slug === slug);
}
