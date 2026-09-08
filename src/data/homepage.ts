import type { ProductSummary } from '@lib/products';
import { getAllProducts } from '@data/products';
import { siteConfig } from '@config/site';

const products = getAllProducts();
const featuredCategoryOrder = ['laptops', 'printers', 'monitors', 'tablets'] as const;
const featuredCatalogProducts = featuredCategoryOrder
  .flatMap((category) => {
    const product = products.find((candidate) => candidate.category === category);
    return product ? [product] : [];
  });
const categoryProductMeta = (category: string) => {
  const count = products.filter((product) => product.category === category).length;
  return `${count} product${count === 1 ? '' : 's'}`;
};

export interface HomeCta {
  label: string;
  href: string;
}

export interface HeroSlide {
  eyebrow: string;
  title: string;
  description: string;
  image: {
    desktopSrc: string;
    mobileSrc: string;
    alt: string;
  };
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  backdrop: 'ink' | 'blue' | 'light';
}

export interface TrustItem {
  label: string;
  title: string;
  description: string;
}

export interface HomeCategory {
  label: string;
  href: string;
  description: string;
  meta: string;
  image: {
    src: string;
    alt: string;
  };
}

export interface BrandItem {
  name: string;
  href: string;
  note: string;
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'MOBDEALS KENYA',
    title: 'Tech You Can Buy With Confidence.',
    description: 'Shop laptops, printers, monitors, tablets and other electronics from our Nairobi store, with warranty support and countrywide delivery.',
    image: {
      desktopSrc: '/images/home/home-hero-laptops-desktop.webp',
      mobileSrc: '/images/home/home-hero-laptops-mobile.webp',
      alt: 'Laptop display at MobDeals Kenya'
    },
    primaryCta: { label: 'SHOP NOW', href: '/shop' },
    secondaryCta: {
      label: 'ORDER ON WHATSAPP',
      href: `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hello MobDeals Kenya, I would like to order a product.')}`
    },
    backdrop: 'ink'
  },
  {
    eyebrow: 'BUSINESS & OFFICE SUPPLY',
    title: 'Build a Better-Equipped Workplace.',
    description: 'Source laptops, printers, monitors, projectors and supporting equipment for your team—with quotations and direct help from our Nairobi store.',
    image: {
      desktopSrc: '/images/home/home-hero-office-tech-desktop.webp',
      mobileSrc: '/images/home/home-hero-office-tech-mobile.webp',
      alt: 'Office printer and workplace technology'
    },
    primaryCta: { label: 'REQUEST A QUOTE', href: '/business' },
    secondaryCta: {
      label: 'CHAT WITH OUR TEAM',
      href: `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hello MobDeals Kenya, I need a quotation for office technology.')}`
    },
    backdrop: 'ink'
  },
  {
    eyebrow: 'TECH FOR EVERYDAY LIFE',
    title: 'The Right Device Changes Your Day.',
    description: 'Compare practical technology for work, study and staying connected, with clear product details and support before you order.',
    image: {
      desktopSrc: '/images/home/home-hero-smartphones-desktop.webp',
      mobileSrc: '/images/home/home-hero-smartphones-mobile.webp',
      alt: 'Smartphones and connected technology accessories'
    },
    primaryCta: { label: 'EXPLORE THE CATALOGUE', href: '/shop' },
    secondaryCta: {
      label: 'HELP ME CHOOSE',
      href: `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hello MobDeals Kenya, please help me choose the right device.')}`
    },
    backdrop: 'ink'
  }
];

export const trustItems: TrustItem[] = [
  { label: 'Store', title: 'Nairobi CBD Store', description: 'Shop online or visit us in Nairobi.' },
  { label: 'Support', title: 'Warranty Support', description: 'Warranty information is provided before purchase.' },
  { label: 'Delivery', title: 'Countrywide Delivery', description: 'Delivery options available across Kenya.' },
  { label: 'Contact', title: 'Call & WhatsApp Support', description: 'Talk directly to our team when you need help.' }
];

const categoryImage = (category: string, label: string): HomeCategory['image'] => {
  const product = products.find((candidate) => candidate.category === category && candidate.images[0]);

  return product?.images[0] ?? {
    src: '/images/og-default.jpg',
    alt: `${label} available from MobDeals Kenya`
  };
};

const createHomeCategory = (
  category: string,
  label: string,
  description: string
): HomeCategory => ({
  label,
  href: `/category/${category}`,
  description,
  meta: categoryProductMeta(category),
  image: categoryImage(category, label)
});

export const homeCategories: HomeCategory[] = [
  createHomeCategory('laptops', 'Laptops', 'For work, school, design and gaming.'),
  createHomeCategory('tablets', 'Tablets', 'Portable touch devices and detachables.'),
  createHomeCategory('printers', 'Printers', 'Printing options for home and office.'),
  createHomeCategory('monitors', 'Monitors', 'Displays for desks and workstations.'),
  createHomeCategory('projectors', 'Projectors', 'For classrooms, meetings and events.'),
  createHomeCategory('software', 'Software', 'Security licences for your devices.'),
  createHomeCategory('ups', 'UPS & Power', 'Backup power and connectivity equipment.')
];

export const featuredProducts: ProductSummary[] = featuredCatalogProducts;

export const featuredBrands: BrandItem[] = [
  { name: 'HP', href: '/brands/hp', note: 'Laptops, printers and monitors' },
  { name: 'Lenovo', href: '/brands/lenovo', note: 'Laptops and tablets' },
  { name: 'Dell', href: '/brands/dell', note: 'Business and performance laptops' },
  { name: 'Epson', href: '/brands/epson', note: 'Printers and projectors' },
  { name: 'Kyocera', href: '/brands/kyocera', note: 'Office printers' }
];
