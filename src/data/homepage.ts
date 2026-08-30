import type { ProductSummary } from '@lib/products';
import { getAllProducts } from '@data/products';
import { siteConfig } from '@config/site';

const products = getAllProducts();
const featuredCategoryOrder = ['laptops', 'printers', 'monitors', 'tablets'] as const;
const featuredCatalogProducts = featuredCategoryOrder
  .map((category) => products.find((product) => product.category === category))
  .filter((product): product is ProductSummary => Boolean(product));
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
  icon: 'laptop' | 'phone' | 'desktop' | 'printer' | 'storage' | 'monitor' | 'projector' | 'internet';
}

export interface PromoBanner {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  secondaryCta?: HomeCta;
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
  }
];

export const trustItems: TrustItem[] = [
  { label: 'Store', title: 'Nairobi CBD Store', description: 'Shop online or visit us in Nairobi.' },
  { label: 'Support', title: 'Warranty Support', description: 'Warranty information is provided before purchase.' },
  { label: 'Delivery', title: 'Countrywide Delivery', description: 'Delivery options available across Kenya.' },
  { label: 'Contact', title: 'Call & WhatsApp Support', description: 'Talk directly to our team when you need help.' }
];

export const homeCategories: HomeCategory[] = [
  { label: 'Laptops', href: '/category/laptops', description: 'For work, school, design and gaming.', meta: categoryProductMeta('laptops'), icon: 'laptop' },
  { label: 'Tablets', href: '/category/tablets', description: 'Portable touch devices and detachables.', meta: categoryProductMeta('tablets'), icon: 'phone' },
  { label: 'Printers', href: '/category/printers', description: 'Printing options for home and office.', meta: categoryProductMeta('printers'), icon: 'printer' },
  { label: 'Monitors', href: '/category/monitors', description: 'Displays for desks and workstations.', meta: categoryProductMeta('monitors'), icon: 'monitor' },
  { label: 'Projectors', href: '/category/projectors', description: 'For classrooms, meetings and events.', meta: categoryProductMeta('projectors'), icon: 'projector' },
  { label: 'Software', href: '/category/software', description: 'Security licences for your devices.', meta: categoryProductMeta('software'), icon: 'storage' },
  { label: 'UPS & Power', href: '/category/ups', description: 'Backup power and connectivity equipment.', meta: categoryProductMeta('ups'), icon: 'internet' }
];

export const featuredProducts: ProductSummary[] = featuredCatalogProducts;

export const promoBanners: PromoBanner[] = [
  {
    eyebrow: 'Laptops',
    title: 'Find the Right Laptop',
    description: 'Need a laptop for work, school, software development, design or gaming? Browse by brand, specifications and budget.',
    href: '/category/laptops',
    ctaLabel: 'SHOP LAPTOPS',
    secondaryCta: { label: 'GET HELP CHOOSING', href: '/contact' },
    visual: 'laptop',
    tone: 'dark'
  },
  {
    eyebrow: 'Business Supply',
    title: 'Equip Your Office',
    description: 'Laptops, printers, monitors, projectors and other equipment for businesses, schools and organisations.',
    href: '/shop',
    ctaLabel: 'SHOP OFFICE TECH',
    secondaryCta: { label: 'REQUEST A QUOTE', href: '/business' },
    visual: 'printer',
    tone: 'light'
  }
];

export const featuredBrands: BrandItem[] = [
  { name: 'HP', href: '/brands/hp', note: 'Laptops, printers and monitors' },
  { name: 'Lenovo', href: '/brands/lenovo', note: 'Laptops and tablets' },
  { name: 'Dell', href: '/brands/dell', note: 'Business and performance laptops' },
  { name: 'Epson', href: '/brands/epson', note: 'Printers and projectors' },
  { name: 'Kyocera', href: '/brands/kyocera', note: 'Office printers' }
];

export const whyChooseItems: WhyChooseItem[] = [
  { label: 'Store', title: 'Visit Our Nairobi Store', description: 'Buy online or speak to our team at our Nairobi CBD store.' },
  { label: 'Details', title: 'Product Information', description: 'See the key specifications, condition and price before ordering.' },
  { label: 'Warranty', title: 'Warranty Support', description: 'Applicable warranty information is provided before purchase.' },
  { label: 'Delivery', title: 'Countrywide Delivery', description: 'Nairobi delivery, store pickup and upcountry delivery options are available.' },
  { label: 'Business', title: 'Business Supply', description: 'Request quotations for multiple laptops, printers, monitors and other office equipment.' }
];
