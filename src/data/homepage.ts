import type { ProductSummary } from '@lib/products';
import { getAllProducts, productCategories } from '@data/products';

const catalogProducts = getAllProducts();
const catalogProductCount = catalogProducts.length;
const catalogCategoryCount = productCategories.length;
const featuredCategoryOrder = ['laptops', 'desktops', 'printers', 'monitors'] as const;
const featuredCatalogProducts = featuredCategoryOrder
  .map((category) => catalogProducts.find((product) => product.category === category))
  .filter((product): product is ProductSummary => Boolean(product));

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
  productKicker: string;
  productName: string;
  productSpec: string;
  visual: 'laptop' | 'phone' | 'printer';
  backdrop: 'ink' | 'blue' | 'light';
  metrics: Array<{
    label: string;
    value: string;
  }>;
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
  icon: 'laptop' | 'phone' | 'desktop' | 'printer' | 'storage' | 'monitor' | 'projector' | 'internet';
}

export interface PromoBanner {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  visual: 'laptop' | 'phone' | 'printer';
  tone: 'dark' | 'light';
}

export interface BrandItem {
  name: string;
  href: string;
  note: string;
}

export interface WhyChooseItem {
  label: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  detail: string;
}

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'Nairobi electronics store',
    title: 'MobDeals Kenya',
    description:
      'Current laptops, desktops, printers, monitors, storage, phones, projectors, and internet hardware for Kenya shoppers who want clear specs before they spend.',
    image: {
      desktopSrc: '/images/home/home-hero-laptops-desktop.webp',
      mobileSrc: '/images/home/home-hero-laptops-mobile.webp',
      alt: 'Premium business laptop setup in a dark electronics retail studio'
    },
    primaryCta: { label: 'Shop products', href: '/shop' },
    secondaryCta: { label: 'Talk to support', href: '/contact' },
    productKicker: 'Business laptops',
    productName: '340 listed products',
    productSpec: 'HP, Lenovo, Dell, Epson, Samsung, and more',
    visual: 'laptop',
    backdrop: 'ink',
    metrics: [
      { label: 'Categories', value: String(catalogCategoryCount) },
      { label: 'Products', value: String(catalogProductCount) }
    ]
  },
  {
    eyebrow: 'Device catalog',
    title: 'Devices that fit the way Nairobi works.',
    description:
      'Compare laptops, desktops, monitors, printers, storage, and phones with practical notes on price, condition, warranty, and availability.',
    image: {
      desktopSrc: '/images/home/home-hero-smartphones-desktop.webp',
      mobileSrc: '/images/home/home-hero-smartphones-mobile.webp',
      alt: 'Modern smartphones and accessories arranged in a premium electronics store scene'
    },
    primaryCta: { label: 'Browse monitors', href: '/category/monitors' },
    secondaryCta: { label: 'Compare options', href: '/contact' },
    productKicker: 'Office displays',
    productName: 'Monitors and setups',
    productSpec: 'HP, Dell, desktops, and productivity hardware',
    visual: 'phone',
    backdrop: 'blue',
    metrics: [
      { label: 'Buying path', value: 'Simple' },
      { label: 'Support', value: 'Human' }
    ]
  },
  {
    eyebrow: 'Office supply ready',
    title: 'Printers, storage, and desktops for teams.',
    description:
      'Build dependable setups for reception desks, admin teams, home offices, schools, and small businesses across Kenya.',
    image: {
      desktopSrc: '/images/home/home-hero-office-tech-desktop.webp',
      mobileSrc: '/images/home/home-hero-office-tech-mobile.webp',
      alt: 'Office printer, desktop, storage, and accessories arranged for business procurement'
    },
    primaryCta: { label: 'Explore office tech', href: '/category/printers' },
    secondaryCta: { label: 'Business supply', href: '/business' },
    productKicker: 'Office systems',
    productName: 'Practical procurement',
    productSpec: 'Printers, desktops, monitors, projectors, and internet hardware',
    visual: 'printer',
    backdrop: 'ink',
    metrics: [
      { label: 'Use cases', value: 'Home + office' },
      { label: 'Delivery', value: 'Kenya' }
    ]
  }
];

export const trustItems: TrustItem[] = [
  {
    label: '01',
    title: 'Delivery across Kenya',
    description: 'Nairobi-first dispatch with practical delivery guidance for shoppers and offices.'
  },
  {
    label: '02',
    title: 'Tested device guidance',
    description: 'Clear buying advice around condition, specs, compatibility, and warranty expectations.'
  },
  {
    label: '03',
    title: 'Customer trust built in',
    description: 'Human support for laptops, desktops, printers, monitors, phones, storage, projectors, and internet hardware.'
  }
];

export const homeCategories: HomeCategory[] = [
  {
    label: 'Laptops',
    href: '/category/laptops',
    description: 'HP, Dell, Lenovo, Microsoft, and Apple laptop listings.',
    meta: '280 products',
    icon: 'laptop'
  },
  {
    label: 'Desktops',
    href: '/category/desktops',
    description: 'All-in-ones, office PCs, mini PCs, and workstations.',
    meta: '41 products',
    icon: 'desktop'
  },
  {
    label: 'Printers',
    href: '/category/printers',
    description: 'HP, Epson, and Kyocera printer listings.',
    meta: '6 products',
    icon: 'printer'
  },
  {
    label: 'Monitors',
    href: '/category/monitors',
    description: 'HP and Dell displays for desk and office setups.',
    meta: '7 products',
    icon: 'monitor'
  },
  {
    label: 'Storage',
    href: '/category/storage',
    description: 'External hard drive and storage listings.',
    meta: '2 products',
    icon: 'storage'
  },
  {
    label: 'Smartphones',
    href: '/category/smartphones',
    description: 'Samsung and Apple phone listings from the sheet.',
    meta: '2 products',
    icon: 'phone'
  },
  {
    label: 'Projectors',
    href: '/category/projectors',
    description: 'Presentation display hardware for rooms and events.',
    meta: '1 product',
    icon: 'projector'
  },
  {
    label: 'Internet',
    href: '/category/internet',
    description: 'Connectivity hardware including Starlink listings.',
    meta: '1 product',
    icon: 'internet'
  }
];

export const featuredProducts: ProductSummary[] = featuredCatalogProducts;

export const promoBanners: PromoBanner[] = [
  {
    eyebrow: 'Laptop buying path',
    title: 'Choose a machine around the work, not the hype.',
    description:
      'A calmer way to compare processor class, memory, storage, condition, warranty, and upgrade room before purchase.',
    href: '/category/laptops',
    ctaLabel: 'Shop laptops',
    visual: 'laptop',
    tone: 'dark'
  },
  {
    eyebrow: 'Displays and connectivity',
    title: 'The supporting hardware that keeps work moving.',
    description:
      'Monitors, storage, projectors, and internet hardware arranged around everyday reliability instead of clutter.',
    href: '/category/monitors',
    ctaLabel: 'Browse monitors',
    visual: 'phone',
    tone: 'light'
  }
];

export const featuredBrands: BrandItem[] = [
  { name: 'HP', href: '/brands/hp', note: 'Laptops, desktops, printers, and monitors' },
  { name: 'Lenovo', href: '/brands/lenovo', note: 'ThinkPad, IdeaPad, and ThinkCentre listings' },
  { name: 'Dell', href: '/brands/dell', note: 'Latitude, OptiPlex, Precision, and monitors' },
  { name: 'Epson', href: '/brands/epson', note: 'Printers and projector listings' },
  { name: 'Starlink', href: '/brands/starlink', note: 'Internet hardware' }
];

export const whyChooseItems: WhyChooseItem[] = [
  {
    label: 'Spec clarity',
    title: 'Plain advice before purchase',
    description: 'We frame each recommendation around performance, condition, warranty, and total value.'
  },
  {
    label: 'Kenya context',
    title: 'Built for local buying decisions',
    description: 'Delivery, support, and stock messaging are written for Nairobi and Kenya ecommerce needs.'
  },
  {
    label: 'Business ready',
    title: 'Useful for teams and individuals',
    description: 'From one laptop to office printers, desktops, monitors, projectors, and internet hardware, the catalog structure supports repeat buying.'
  }
];

export const testimonials: TestimonialItem[] = [
  {
    quote: 'The team helped us compare laptops by warranty, condition, and actual office use instead of just price.',
    name: 'Procurement lead',
    detail: 'Nairobi creative studio'
  },
  {
    quote: 'We needed printer and desktop guidance fast. The recommendations were practical and easy to approve.',
    name: 'Operations manager',
    detail: 'SME office buyer'
  },
  {
    quote: 'The catalog made it easier to compare the actual listed price, condition, and specs before asking about availability.',
    name: 'Returning customer',
    detail: 'Personal tech upgrade'
  }
];
