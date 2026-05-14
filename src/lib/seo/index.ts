import { siteConfig } from '@config/site';

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

function absoluteUrl(pathOrUrl?: string): string | undefined {
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
    logo: absoluteUrl('/images/logo.png')
  };
}

export function stringifyJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
