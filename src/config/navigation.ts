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
  { label: 'Tablets', href: '/category/tablets' },
  { label: 'Business Supply', href: '/business' },
  { label: 'Contact', href: '/contact' }
];

export const categoryNavigation: NavigationCategory[] = [
  {
    label: 'Laptops',
    href: '/category/laptops',
    featured: true,
    links: [
      { label: 'HP', href: '/category/laptops/hp' },
      { label: 'Dell', href: '/category/laptops/dell' },
      { label: 'Lenovo', href: '/category/laptops/lenovo' },
      { label: 'Apple MacBook', href: '/category/laptops/apple' },
      { label: 'Gaming Laptops', href: '/category/laptops/gaming' }
    ]
  },
  {
    label: 'Tablets',
    href: '/category/tablets',
    links: [
      { label: 'Lenovo Tablets', href: '/category/tablets/lenovo' },
      { label: 'Detachable Tablets', href: '/category/tablets/detachable' }
    ]
  },
  {
    label: 'Printers',
    href: '/category/printers',
    links: [
      { label: 'HP', href: '/category/printers/hp' },
      { label: 'Epson', href: '/category/printers/epson' },
      { label: 'Kyocera', href: '/category/printers/kyocera' }
    ]
  },
  {
    label: 'Monitors',
    href: '/category/monitors',
    links: [
      { label: 'HP Monitors', href: '/category/monitors/hp' },
      { label: 'All Monitors', href: '/category/monitors' }
    ]
  },
  {
    label: 'Projectors',
    href: '/category/projectors',
    links: [
      { label: 'Epson Projectors', href: '/category/projectors/epson' },
      { label: 'Full HD Projectors', href: '/category/projectors/full-hd' }
    ]
  },
  {
    label: 'Software',
    href: '/category/software',
    links: [
      { label: 'Kaspersky Standard', href: '/category/software/standard' },
      { label: 'Kaspersky Plus', href: '/category/software/plus' },
      { label: 'Kaspersky Premium', href: '/category/software/premium' }
    ]
  },
  {
    label: 'UPS & Power',
    href: '/category/ups',
    links: [
      { label: 'Lightwave UPS', href: '/category/ups/lightwave' },
      { label: 'Mercury UPS', href: '/category/ups/mercury' },
      { label: 'Connectivity', href: '/category/ups/starlink' }
    ]
  }
];

export const supportNavigation: NavigationLink[] = [
  { label: 'Warranty', href: '/warranty' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'Order Status', href: '/track-order' },
  { label: 'Cart', href: '/cart' }
];

export const quickNavigation: NavigationLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Business Supply', href: '/business' },
  { label: 'Nairobi Store', href: '/store' },
  { label: 'Contact', href: '/contact' }
];

export const footerNavigation = [
  {
    title: 'Shop',
    links: [
      { label: 'Laptops', href: '/category/laptops' },
      { label: 'Printers', href: '/category/printers' },
      { label: 'Monitors', href: '/category/monitors' },
      { label: 'Tablets', href: '/category/tablets' },
      { label: 'Projectors', href: '/category/projectors' },
      { label: 'Shop All', href: '/shop' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Warranty', href: '/warranty' },
      { label: 'Delivery', href: '/delivery' },
      { label: 'Order Status', href: '/track-order' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Nairobi Store', href: '/store' },
      { label: 'Business Supply', href: '/business' }
    ]
  }
] as const;
