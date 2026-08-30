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
  { label: 'Printers', href: '/category/printers' },
  { label: 'Monitors', href: '/category/monitors' },
  { label: 'Projectors', href: '/category/projectors' },
  { label: 'Tablets', href: '/category/tablets' }
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
    label: 'Tablets',
    href: '/category/tablets',
    eyebrow: 'Portable touch devices',
    description: 'Lenovo tablets and detachable devices from the current catalog.',
    links: [
      { label: 'Lenovo Tablets', href: '/category/tablets/lenovo' },
      { label: 'Detachable Tablets', href: '/category/tablets/detachable' }
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
    description: 'HP monitors for desk setups and office workstations.',
    links: [
      { label: 'HP Monitors', href: '/category/monitors/hp' }
    ]
  },
  {
    label: 'Projectors',
    href: '/category/projectors',
    eyebrow: 'Presentation displays',
    description: 'Epson projectors for office, classroom, and event setups.',
    links: [
      { label: 'Epson Projectors', href: '/category/projectors/epson' },
      { label: 'Full HD Projectors', href: '/category/projectors/full-hd' }
    ]
  },
  {
    label: 'Software',
    href: '/category/software',
    eyebrow: 'Security licences',
    description: 'Kaspersky software for one, three, and five devices.',
    links: [
      { label: 'Kaspersky Standard', href: '/category/software/standard' },
      { label: 'Kaspersky Plus', href: '/category/software/plus' },
      { label: 'Kaspersky Premium', href: '/category/software/premium' }
    ]
  },
  {
    label: 'UPS & Power',
    href: '/category/ups',
    eyebrow: 'Backup power',
    description: 'UPS and related connectivity hardware from the current sheet.',
    links: [
      { label: 'Lightwave UPS', href: '/category/ups/lightwave' },
      { label: 'Mercury UPS', href: '/category/ups/mercury' },
      { label: 'Starlink Mini', href: '/category/ups/starlink' }
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
