import type { ProductSummary } from '@lib/products';
import { getAllProducts } from '@data/products';
import { siteConfig } from '@config/site';
import { categoryImage as categoryFallback } from '@lib/products/images';
import { homeMedia } from './home-media';

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
    title: 'Ready for Your Next Chapter.',
    description: 'Find a laptop for lectures, assignments and everything after. Compare new and Ex-UK options with help from our Nairobi team.',
    image: {
      ...homeMedia.student,
      alt: 'Illustrative laptop study setup'
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
      ...homeMedia.office,
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
    eyebrow: 'MAKE ROOM FOR GOOD WORK',
    title: 'Your Desk. A Little More Capable.',
    description: 'Find monitors and everyday technology for a workspace that works for you. Compare the details and get help choosing.',
    image: {
      ...homeMedia.workstation,
      alt: 'Illustrative monitor and workstation setup'
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

const createHomeCategory = (
  category: string,
  label: string,
  description: string
): HomeCategory => ({
  label,
  href: `/category/${category}`,
  description,
  meta: categoryProductMeta(category),
  image: categoryFallback(category)
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
