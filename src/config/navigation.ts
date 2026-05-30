export interface NavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationCategory extends NavigationLink {
  featured?: boolean;
  eyebrow?: string;
  links?: NavigationLink[];
}

export const primaryNavigation: NavigationLink[] = [
  { label: 'Laptops', href: '/category/laptops' },
  { label: 'Smartphones', href: '/category/smartphones' },
  { label: 'Desktops', href: '/category/desktops' },
  { label: 'Printers', href: '/category/printers' },
  { label: 'Storage', href: '/category/storage' }
];

export const categoryNavigation: NavigationCategory[] = [
  {
    label: 'Laptops',
    href: '/category/laptops',
    eyebrow: 'Work and study',
    description: 'Business, student, gaming, and creator laptops for Kenya.',
    featured: true,
    links: [
      { label: 'HP Laptops', href: '/category/laptops/hp' },
      { label: 'Dell Laptops', href: '/category/laptops/dell' },
      { label: 'Lenovo Laptops', href: '/category/laptops/lenovo' },
      { label: 'MacBooks', href: '/category/laptops/macbook' }
    ]
  },
  {
    label: 'Smartphones',
    href: '/category/smartphones',
    eyebrow: 'New and refurbished',
    description: 'Android phones, iPhones, chargers, cases, and accessories.',
    links: [
      { label: 'Samsung', href: '/category/smartphones/samsung' },
      { label: 'iPhone', href: '/category/smartphones/iphone' },
      { label: 'Tecno', href: '/category/smartphones/tecno' },
      { label: 'Xiaomi', href: '/category/smartphones/xiaomi' }
    ]
  },
  {
    label: 'Desktops',
    href: '/category/desktops',
    eyebrow: 'Office setups',
    description: 'Office towers, all-in-ones, mini PCs, and workstations.',
    links: [
      { label: 'Office Desktops', href: '/category/desktops/office' },
      { label: 'All-in-One PCs', href: '/category/desktops/all-in-one' },
      { label: 'Workstations', href: '/category/desktops/workstations' }
    ]
  },
  {
    label: 'Printers',
    href: '/category/printers',
    eyebrow: 'Home and business',
    description: 'Inkjet, laser, refill, and office printers with supplies.',
    links: [
      { label: 'HP Printers', href: '/category/printers/hp' },
      { label: 'Epson Printers', href: '/category/printers/epson' },
      { label: 'Laser Printers', href: '/category/printers/laser' }
    ]
  },
  {
    label: 'Storage',
    href: '/category/storage',
    eyebrow: 'Upgrade essentials',
    description: 'SSDs, hard drives, flash drives, memory cards, and RAM.',
    links: [
      { label: 'SSDs', href: '/category/storage/ssd' },
      { label: 'Hard Drives', href: '/category/storage/hard-drives' },
      { label: 'Flash Drives', href: '/category/storage/flash-drives' }
    ]
  }
];

export const supportNavigation: NavigationLink[] = [
  { label: 'Track Order', href: '/track-order' },
  { label: 'Warranty', href: '/warranty' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'Contact', href: '/contact' }
];

export const quickNavigation: NavigationLink[] = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Business supply', href: '/business' },
  { label: 'Nairobi store', href: '/store' },
  { label: 'Contact', href: '/contact' }
];

export const accountNavigation: NavigationLink[] = [
  { label: 'Account', href: '/account', description: 'Placeholder account link' },
  { label: 'Cart', href: '/cart', description: 'Placeholder cart link' }
];

export const socialNavigation: NavigationLink[] = [
  { label: 'Instagram', href: '/social/instagram' },
  { label: 'Facebook', href: '/social/facebook' },
  { label: 'TikTok', href: '/social/tiktok' }
];

export const footerNavigation = [
  {
    title: 'Categories',
    links: categoryNavigation.map(({ label, href }) => ({ label, href }))
  },
  {
    title: 'Support',
    links: supportNavigation
  },
  {
    title: 'Company',
    links: quickNavigation
  }
] as const;
