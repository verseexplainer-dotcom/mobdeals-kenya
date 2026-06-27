import type { ProductSummary } from '@lib/products';

export interface HomeCta {
  label: string;
  href: string;
}

export interface HeroSlide {
  eyebrow: string;
  title: string;
  description: string;
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
  icon: 'laptop' | 'phone' | 'desktop' | 'printer' | 'storage';
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
      'Premium laptops, smartphones, printers, and desktop setups for Kenya shoppers who want clear specs before they spend.',
    primaryCta: { label: 'Shop products', href: '/shop' },
    secondaryCta: { label: 'Talk to support', href: '/contact' },
    productKicker: 'Business laptops',
    productName: 'Work-ready machines',
    productSpec: 'HP, Dell, Lenovo, MacBook guidance',
    visual: 'laptop',
    backdrop: 'ink',
    metrics: [
      { label: 'Categories', value: '5' },
      { label: 'Focus', value: 'Kenya' }
    ]
  },
  {
    eyebrow: 'Smartphone essentials',
    title: 'Devices that fit the way Nairobi moves.',
    description:
      'Compare iPhone, Samsung, and everyday Android options with practical advice on storage, battery, warranty, and accessories.',
    primaryCta: { label: 'Browse smartphones', href: '/category/smartphones' },
    secondaryCta: { label: 'Compare options', href: '/contact' },
    productKicker: 'Phones and accessories',
    productName: 'Daily carry tech',
    productSpec: 'Chargers, cases, power, and storage',
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
      'Build dependable setups for reception desks, admin teams, home offices, and small businesses across Kenya.',
    primaryCta: { label: 'Explore office tech', href: '/category/printers' },
    secondaryCta: { label: 'Business supply', href: '/business' },
    productKicker: 'Office systems',
    productName: 'Practical procurement',
    productSpec: 'Printers, desktops, SSDs, and supplies',
    visual: 'printer',
    backdrop: 'light',
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
    description: 'Human support for laptops, phones, printers, desktops, storage, and accessories.'
  }
];

export const homeCategories: HomeCategory[] = [
  {
    label: 'Laptops',
    href: '/category/laptops',
    description: 'Business, student, creator, and performance laptops.',
    meta: 'HP, Dell, Lenovo, MacBook',
    icon: 'laptop'
  },
  {
    label: 'Smartphones',
    href: '/category/smartphones',
    description: 'iPhones, Samsung Galaxy, Android phones, and accessories.',
    meta: 'iPhone, Samsung, Tecno, Xiaomi',
    icon: 'phone'
  },
  {
    label: 'Desktops',
    href: '/category/desktops',
    description: 'Office towers, all-in-ones, mini PCs, and workstations.',
    meta: 'Office, AIO, Mini PC',
    icon: 'desktop'
  },
  {
    label: 'Printers',
    href: '/category/printers',
    description: 'Ink tank, laser, refill, toner, and office printers.',
    meta: 'HP, Epson, Laser, Ink tank',
    icon: 'printer'
  },
  {
    label: 'Storage',
    href: '/category/storage',
    description: 'SSDs, hard drives, flash drives, RAM, and memory cards.',
    meta: 'SSD, HDD, RAM, Flash',
    icon: 'storage'
  }
];

export const featuredProducts: ProductSummary[] = [
  {
    id: 'preview-hp-elitebook',
    slug: 'hp-elitebook-business-laptop-preview',
    name: 'HP EliteBook Business Laptop',
    brand: 'HP',
    category: 'laptops',
    price: { amount: 68000, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true
  },
  {
    id: 'preview-galaxy-smartphone',
    slug: 'samsung-galaxy-smartphone-preview',
    name: 'Samsung Galaxy Smartphone',
    brand: 'Samsung',
    category: 'smartphones',
    price: { amount: 32500, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true
  },
  {
    id: 'preview-epson-ecotank',
    slug: 'epson-ecotank-printer-preview',
    name: 'Epson EcoTank Printer',
    brand: 'Epson',
    category: 'printers',
    price: { amount: 29500, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true
  },
  {
    id: 'preview-lenovo-thinkcentre',
    slug: 'lenovo-thinkcentre-desktop-preview',
    name: 'Lenovo ThinkCentre Desktop',
    brand: 'Lenovo',
    category: 'desktops',
    price: { amount: 42000, currency: 'KES' },
    images: [],
    inStock: true,
    featured: true
  }
];

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
    eyebrow: 'Power and accessories',
    title: 'The small parts that keep devices useful.',
    description:
      'Chargers, storage, cases, and office essentials arranged around everyday reliability instead of clutter.',
    href: '/category/storage',
    ctaLabel: 'Browse essentials',
    visual: 'phone',
    tone: 'light'
  }
];

export const featuredBrands: BrandItem[] = [
  { name: 'HP', href: '/brands/hp', note: 'Business laptops and printers' },
  { name: 'Dell', href: '/brands/dell', note: 'Workstations and office PCs' },
  { name: 'Lenovo', href: '/brands/lenovo', note: 'ThinkPad and ThinkCentre' },
  { name: 'Apple', href: '/brands/apple', note: 'MacBook and iPhone' },
  { name: 'ASUS', href: '/brands/asus', note: 'Creator and performance tech' }
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
    description: 'From one laptop to office printers and desktops, the catalog structure supports repeat buying.'
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
    quote: 'The phone buying advice was clear on storage, battery, accessories, and delivery options.',
    name: 'Returning customer',
    detail: 'Personal tech upgrade'
  }
];
