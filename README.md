# MobDeals Kenya

Static Astro storefront for MobDeals Kenya, a premium electronics ecommerce experience for Nairobi and customers across Kenya.

## Project Overview

This is the canonical MobDeals Kenya storefront repository. It is built with Astro, Tailwind CSS, Supabase client utilities, and a static-first deployment model. It focuses on laptops, smartphones, printers, desktops, monitors, storage, projectors, internet hardware, and related technology buying flows.

The production target is intentionally lean:

- Frontend hosting: Cloudflare Pages on the Cloudflare free tier.
- Data and media: Supabase free tier, using public anon client access only where browser code needs it.
- Product media: committed optimized WebP assets in `public/images`, with Supabase Storage public bucket support named `products`.
- Runtime model: static Astro output in `dist`; no global SSR.
- Container package: GitHub Container Registry image for portable static serving, separate from the primary Cloudflare Pages frontend.

Current storefront status:

- Home, shop, category, filtered category, brand, search, cart, product detail, support, blog, and policy-style pages are implemented as static Astro routes.
- Product data is generated from the MobDeals SEO workbook into `src/data/products.ts`; the current catalog contains 340 listings.
- Product cards, galleries, specs tables, related products, navigation, footer, homepage sections, and shared UI primitives are implemented as reusable Astro components.
- SEO helpers generate page metadata plus product, breadcrumb, and item-list JSON-LD where applicable.
- Cart behavior is browser-local through `localStorage` and sends checkout inquiries to WhatsApp. There is no backend payment, account, or order system yet.

## Local Setup

Requirements:

- Node.js `>=22.12.0`
- npm

Install dependencies:

```sh
npm install
```

Start the local dev server:

```sh
npm run dev
```

Build production assets:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

The latest verified production build completed successfully and generated 399 static pages.

## Catalog And Assets

Regenerate catalog data after workbook updates:

```sh
python3 scripts/import_mobdeals_products.py path/to/mobdeals_seo_copy_340products.xlsx
```

The generated product module is `src/data/products.ts`. Keep source workbook files and raw source-image drops local unless a separate import package is intentionally needed. The `product drop/` directory is ignored; committed storefront images are optimized WebP files under `public/images`.

Supabase Storage remains available for public product media through `src/lib/supabase`, but browser code must only use public anon credentials.

## Repository And Deployment

Repository:

- GitHub: `git@github.com:verseexplainer-dotcom/mobdeals-kenya.git`
- Production branch: `main`
- Package name: `mobdeals-kenya`
- Container image: `ghcr.io/verseexplainer-dotcom/mobdeals-kenya`

Cloudflare Pages settings:

- Framework preset: Astro
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

Required public environment variables:

- `PUBLIC_SITE_URL`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Keep secrets such as Supabase service role keys out of Cloudflare Pages public environment variables and out of frontend code.

## Project Structure

```text
/
├── ai/          Project planning, prompts, and implementation notes
├── docs/        Architecture and design reference documentation
├── public/      Static assets served as-is
├── scripts/     Catalog import and project automation scripts
├── src/         Astro pages, components, config, styles, and data
├── supabase/    Supabase-related notes and assets
├── Dockerfile   Static build container served by nginx
└── package.json
```

## Release Package

Pushing `main` or a version tag runs the container publishing workflow. Version tags such as `v0.1.0` publish tagged images to GitHub Container Registry.
