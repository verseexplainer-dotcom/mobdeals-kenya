export interface CategoryPresentation {
  eyebrow: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

const categoryPresentations: Record<string, CategoryPresentation> = {
  laptops: {
    eyebrow: 'Work, study and performance',
    description: 'Browse HP, Dell, Lenovo and Apple laptops by specifications, condition and price.',
    seoTitle: 'Laptops',
    seoDescription: 'Shop laptops from MobDeals Kenya with listed prices, specifications, condition and warranty information.'
  },
  tablets: {
    eyebrow: 'Portable touch devices',
    description: 'Browse tablets and detachable devices for work, study and everyday use.',
    seoTitle: 'Tablets',
    seoDescription: 'Shop tablets and detachable devices from MobDeals Kenya.'
  },
  printers: {
    eyebrow: 'Home and office printing',
    description: 'Browse HP, Epson and Kyocera printers for home, school and office use.',
    seoTitle: 'Printers',
    seoDescription: 'Shop printers from MobDeals Kenya with listed prices, specifications and warranty information.'
  },
  monitors: {
    eyebrow: 'Displays and workstations',
    description: 'Browse monitors for office desks, home workstations and display upgrades.',
    seoTitle: 'Computer Monitors',
    seoDescription: 'Shop computer monitors from MobDeals Kenya.'
  },
  projectors: {
    eyebrow: 'Meetings and presentations',
    description: 'Browse projectors for classrooms, meeting rooms and events.',
    seoTitle: 'Projectors',
    seoDescription: 'Shop projectors from MobDeals Kenya with listed specifications and prices.'
  },
  software: {
    eyebrow: 'Security licences',
    description: 'Browse software licences by product level and device coverage.',
    seoTitle: 'Software Licences',
    seoDescription: 'Shop software licences from MobDeals Kenya.'
  },
  ups: {
    eyebrow: 'Backup power and connectivity',
    description: 'Browse UPS systems, backup power and connectivity equipment.',
    seoTitle: 'UPS & Power',
    seoDescription: 'Shop UPS systems and backup power products from MobDeals Kenya.'
  }
};

export function getCategoryPresentation(slug: string): CategoryPresentation {
  return categoryPresentations[slug] ?? {
    eyebrow: 'Products',
    description: 'Browse available products by specifications, condition and price.',
    seoTitle: 'Products',
    seoDescription: 'Shop available products from MobDeals Kenya.'
  };
}
