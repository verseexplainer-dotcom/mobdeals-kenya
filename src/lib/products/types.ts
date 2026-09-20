export interface ProductImage {
  representative?: boolean;
  src: string;
  alt: string;
  storageKey?: string;
  width?: number;
  height?: number;
}

export interface ProductPrice {
  amount: number;
  currency: 'KES' | 'USD';
  compareAtAmount?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type ProductCondition = 'New' | 'Refurbished' | 'Pre-owned' | 'Open box';

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  price: ProductPrice;
  images: ProductImage[];
  inStock: boolean;
  featured?: boolean;
  condition?: ProductCondition;
  description?: string;
  specs?: ProductSpec[];
}

export interface Product extends ProductSummary {
  description: string;
  descriptionHtml?: string;
  longDescription?: string;
  highlights: string[];
  specs: ProductSpec[];
  condition: ProductCondition;
  warranty: string;
  availabilityNote: string;
  relatedProductSlugs?: string[];
  seoTitle?: string;
  seoDescription?: string;
  sourceJsonLd?: Record<string, unknown>;
}

export interface ProductCategory {
  slug: string;
  label: string;
  eyebrow: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}
