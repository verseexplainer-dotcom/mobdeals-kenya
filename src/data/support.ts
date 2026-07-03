import { getAllProducts, productCategories } from '@data/products';

export interface BrandProfile {
  slug: string;
  name: string;
  summary: string;
  categories: string[];
}

export interface ServicePage {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  points: string[];
}

const categoryLabelBySlug = new Map(productCategories.map((category) => [category.slug, category.label]));
const productsByBrand = getAllProducts().reduce((brands, product) => {
  if (!product.brand) {
    return brands;
  }

  const current = brands.get(product.brand) ?? [];
  current.push(product);
  brands.set(product.brand, current);
  return brands;
}, new Map<string, ReturnType<typeof getAllProducts>>());

export const brandProfiles: BrandProfile[] = Array.from(productsByBrand.entries())
  .map(([name, products]) => {
    const categories = Array.from(new Set(products.map((product) => categoryLabelBySlug.get(product.category) ?? product.category))).sort();
    const categorySummary = categories.slice(0, 3).join(', ');

    return {
      slug: name.toLowerCase(),
      name,
      summary: `${name} currently has ${products.length} product${products.length === 1 ? '' : 's'} listed across ${categorySummary}. Compare source-sheet prices, condition, specs, and availability before purchase.`,
      categories
    };
  })
  .sort((first, second) => {
    const firstCount = productsByBrand.get(first.name)?.length ?? 0;
    const secondCount = productsByBrand.get(second.name)?.length ?? 0;
    return secondCount - firstCount || first.name.localeCompare(second.name);
  });

export const servicePages: ServicePage[] = [
  {
    slug: 'delivery',
    title: 'Delivery Across Kenya',
    eyebrow: 'Dispatch and pickup',
    description: 'Confirm item availability, destination, and delivery timing before payment or pickup.',
    points: [
      'Nairobi pickup and rider dispatch can be arranged after stock confirmation.',
      'Upcountry delivery depends on item size, courier availability, and payment confirmation.',
      'Fragile products such as printers and desktops should be checked on receipt.'
    ]
  },
  {
    slug: 'warranty',
    title: 'Warranty and Condition Guidance',
    eyebrow: 'Before and after purchase',
    description: 'Warranty terms depend on product type, supplier batch, and whether the item is new or refurbished.',
    points: [
      'Refurbished laptops and desktops include shop warranty terms shown on the product page.',
      'New products may include manufacturer or supplier warranty where applicable.',
      'Battery health, cosmetic grade, accessories, and serial details should be confirmed before purchase.'
    ]
  },
  {
    slug: 'track-order',
    title: 'Track an Order',
    eyebrow: 'Order support',
    description: 'Use your order reference, phone number, or WhatsApp conversation to confirm order progress.',
    points: [
      'For pickup orders, confirm the item is reserved before visiting the Nairobi store.',
      'For delivery orders, request dispatch status and courier details from support.',
      'For business supply, quote and invoice references help the team identify the order faster.'
    ]
  }
];

export function getBrandBySlug(slug: string): BrandProfile | undefined {
  return brandProfiles.find((brand) => brand.slug === slug);
}
