export interface NavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationCategory extends NavigationLink {
  featured?: boolean;
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
    description: 'Business, student, gaming, and creator laptops.',
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
    description: 'Android phones, iPhones, and accessories.',
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
    description: 'Office towers, all-in-ones, and workstations.',
    links: [
      { label: 'Office Desktops', href: '/category/desktops/office' },
      { label: 'All-in-One PCs', href: '/category/desktops/all-in-one' },
      { label: 'Workstations', href: '/category/desktops/workstations' }
    ]
  },
  {
    label: 'Printers',
    href: '/category/printers',
    description: 'Inkjet, laser, refill, and office printers.',
    links: [
      { label: 'HP Printers', href: '/category/printers/hp' },
      { label: 'Epson Printers', href: '/category/printers/epson' },
      { label: 'Laser Printers', href: '/category/printers/laser' }
    ]
  },
  {
    label: 'Storage',
    href: '/category/storage',
    description: 'SSDs, hard drives, flash drives, and memory cards.',
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

export const footerNavigation = [
  {
    title: 'Shop',
    links: primaryNavigation
  },
  {
    title: 'Support',
    links: supportNavigation
  },
  {
    title: 'Company',
    links: [
      { label: 'About SES NEXT GEN', href: '/about' },
      { label: 'Nairobi Store', href: '/store' },
      { label: 'Business Supply', href: '/business' }
    ]
  }
] as const;
