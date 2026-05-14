export interface ProductImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductPrice {
  amount: number;
  currency: 'KES' | 'USD';
  compareAtAmount?: number;
}

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
}
