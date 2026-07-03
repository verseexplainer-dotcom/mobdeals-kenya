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
  { label: 'Desktops', href: '/category/desktops' },
  { label: 'Printers', href: '/category/printers' },
  { label: 'Monitors', href: '/category/monitors' },
  { label: 'Storage', href: '/category/storage' }
];

export const categoryNavigation: NavigationCategory[] = [
  {
    label: 'Laptops',
    href: '/category/laptops',
    eyebrow: 'Work and study',
    description: 'HP, Dell, Lenovo, Microsoft, and Apple laptops from the current catalog.',
    featured: true,
    links: [
      { label: 'HP Laptops', href: '/category/laptops/hp' },
      { label: 'Dell Laptops', href: '/category/laptops/dell' },
      { label: 'Lenovo Laptops', href: '/category/laptops/lenovo' },
      { label: 'Microsoft Surface', href: '/category/laptops/microsoft' }
    ]
  },
  {
    label: 'Desktops',
    href: '/category/desktops',
    eyebrow: 'Office setups',
    description: 'All-in-ones, ProDesk, EliteDesk, OptiPlex, ThinkCentre, and workstations.',
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
    description: 'HP, Epson, and Kyocera printer listings from the current sheet.',
    links: [
      { label: 'HP Printers', href: '/category/printers/hp' },
      { label: 'Epson Printers', href: '/category/printers/epson' },
      { label: 'Kyocera Printers', href: '/category/printers/kyocera' }
    ]
  },
  {
    label: 'Monitors',
    href: '/category/monitors',
    eyebrow: 'Display upgrades',
    description: 'HP and Dell monitors for desk setups and office workstations.',
    links: [
      { label: 'HP Monitors', href: '/category/monitors/hp' },
      { label: 'Dell Monitors', href: '/category/monitors/dell' },
      { label: '24 inch monitors', href: '/category/monitors/24-inch' }
    ]
  },
  {
    label: 'Storage',
    href: '/category/storage',
    eyebrow: 'Upgrade essentials',
    description: 'External hard drives and storage options from the current catalog.',
    links: [
      { label: 'External drives', href: '/category/storage/external' },
      { label: '1TB storage', href: '/category/storage/1tb' },
      { label: '2TB storage', href: '/category/storage/2tb' }
    ]
  },
  {
    label: 'Smartphones',
    href: '/category/smartphones',
    eyebrow: 'Mobile devices',
    description: 'Samsung and Apple phone listings with source-sheet pricing.',
    links: [
      { label: 'Samsung phones', href: '/category/smartphones/samsung' },
      { label: 'Apple phones', href: '/category/smartphones/apple' }
    ]
  },
  {
    label: 'Projectors',
    href: '/category/projectors',
    eyebrow: 'Presentation displays',
    description: 'Projector listings for office, classroom, and event setups.',
    links: [
      { label: 'Epson Projectors', href: '/category/projectors/epson' },
      { label: 'Presentation setups', href: '/category/projectors/presentation' }
    ]
  },
  {
    label: 'Internet',
    href: '/category/internet',
    eyebrow: 'Connectivity hardware',
    description: 'Starlink and internet hardware listings for connectivity planning.',
    links: [
      { label: 'Starlink', href: '/category/internet/starlink' }
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
