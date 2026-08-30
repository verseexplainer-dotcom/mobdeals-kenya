import { getAllProducts, productCategories } from '@data/products';

export interface BrandProfile {
  slug: string;
  name: string;
  summary: string;
  categories: string[];
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
      summary: `${name} products are available across ${categorySummary}. Compare listed prices, condition and key specifications, or contact our team for help.`,
      categories
    };
  })
  .sort((first, second) => {
    const firstCount = productsByBrand.get(first.name)?.length ?? 0;
    const secondCount = productsByBrand.get(second.name)?.length ?? 0;
    return secondCount - firstCount || first.name.localeCompare(second.name);
  });

export function getBrandBySlug(slug: string): BrandProfile | undefined {
  return brandProfiles.find((brand) => brand.slug === slug);
}
