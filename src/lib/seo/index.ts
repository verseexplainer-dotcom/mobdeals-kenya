import { siteConfig } from '@config/site';
import { formatProductPrice, getProductDisplaySummary, type Product, type ProductCategory } from '@lib/products';

export interface SeoInput {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  canonical?: string;
  noIndex?: boolean;
  type?: 'website' | 'product';
}

export interface SeoMeta {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  noIndex: boolean;
  type: 'website' | 'product';
  locale: string;
  siteName: string;
  themeColor: string;
}

export function absoluteUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) {
    return undefined;
  }

  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (!siteConfig.siteUrl) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, siteConfig.siteUrl).toString();
}

export function createSeoMeta(input: SeoInput = {}): SeoMeta {
  const title = input.title
    ? input.title.includes(siteConfig.name)
      ? input.title
      : `${input.title} | ${siteConfig.name}`
    : siteConfig.defaultTitle;
  const canonical = input.canonical ?? absoluteUrl(input.pathname);

  return {
    title,
    description: input.description ?? siteConfig.defaultDescription,
    image: absoluteUrl(input.image ?? siteConfig.defaultImage),
    canonical,
    noIndex: input.noIndex ?? false,
    type: input.type ?? 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    themeColor: siteConfig.themeColor
  };
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl || undefined,
    logo: absoluteUrl(siteConfig.logo),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Moi Avenue',
      addressLocality: 'Nairobi',
      addressCountry: 'KE'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      email: siteConfig.email,
      contactType: 'customer support',
      availableLanguage: 'English'
    }
  };
}

export function createCategorySeo(category: ProductCategory, productCount: number): SeoInput {
  return {
    title: category.seoTitle,
    description:
      productCount > 0
        ? `${category.seoDescription} ${productCount} options currently listed.`
        : category.seoDescription,
    pathname: `/category/${category.slug}`
  };
}

function productHasVariantValue(product: Product, value: string): boolean {
  const normalizedValue = value.trim().toLowerCase();

  return product.condition.toLowerCase() === normalizedValue
    || product.specs.some((spec) => spec.value.trim().toLowerCase() === normalizedValue);
}

function getProductTitleBase(product: Product): string {
  const title = product.seoTitle ?? `${product.name} Price in Kenya`;
  return title.replace(/\s*\|\s*Mobdeals(?: Kenya)?\s*$/i, '').trim();
}

function getProductTitle(product: Product, catalog: Product[]): string {
  const baseTitle = getProductTitleBase(product);
  const sameTitleProducts = catalog.filter((candidate) => getProductTitleBase(candidate) === baseTitle);
  let variantLabel: string | undefined;

  if (sameTitleProducts.length > 1) {
    const candidates = [
      product.condition,
      ...product.specs
        .filter((spec) => ['Graphics', 'Touchscreen', 'Feature', 'Display', 'Processor', 'Memory', 'Storage'].includes(spec.label))
        .map((spec) => spec.value.trim())
    ].filter((value, index, values) => value.length > 0 && values.indexOf(value) === index);

    variantLabel = candidates.find((value) =>
      sameTitleProducts.every(
        (candidate) => candidate.slug === product.slug || !productHasVariantValue(candidate, value)
      )
    );

    if (!variantLabel) {
      const price = formatProductPrice(product.price);
      const priceIsUnique = sameTitleProducts.every(
        (candidate) => candidate.slug === product.slug || formatProductPrice(candidate.price) !== price
      );
      variantLabel = priceIsUnique ? price : product.slug;
    }
  }

  return `${baseTitle}${variantLabel ? ` – ${variantLabel}` : ''}`;
}

export function createProductSeo(product: Product, catalog: Product[] = [product]): SeoInput {
  return {
    title: getProductTitle(product, catalog),
    description: `${product.name}. ${getProductDisplaySummary(product)} Price: ${formatProductPrice(product.price)}.`,
    image: product.images[0]?.src,
    pathname: `/products/${product.slug}`,
    type: 'product'
  };
}

function createProductConditionSchemaUrl(product: Product): string {
  switch (product.condition) {
    case 'New':
      return 'https://schema.org/NewCondition';
    case 'Refurbished':
      return 'https://schema.org/RefurbishedCondition';
    case 'Pre-owned':
    case 'Open box':
      return 'https://schema.org/UsedCondition';
  }
}

export function createProductSchema(product: Product) {
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const imageUrls = product.images.map((image) => absoluteUrl(image.src)).filter(Boolean);
  const itemCondition = createProductConditionSchemaUrl(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    description: product.description,
    sku: product.id,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand
        }
      : undefined,
    category: product.category,
    itemCondition,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition
    }
  };
}

export interface BreadcrumbSchemaItem {
  label: string;
  href: string;
}

export function createBreadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href)
    }))
  };
}

export function createItemListSchema(products: Product[], pathname: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: absoluteUrl(pathname),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name
    }))
  };
}

export function stringifyJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
