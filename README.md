# MobDeals Kenya

Static Astro storefront for MobDeals Kenya, a premium electronics ecommerce experience for Nairobi and customers across Kenya.

## Project Overview

This is the canonical MobDeals Kenya storefront repository. It is built with Astro, Tailwind CSS, Supabase client utilities, and a static-first deployment model. It focuses on laptops, smartphones, printers, desktops, storage, accessories, and related technology buying flows.

The production target is intentionally lean:

- Frontend hosting: Cloudflare Pages on the Cloudflare free tier.
- Data and media: Supabase free tier, using public anon client access only where browser code needs it.
- Product media: Supabase Storage public bucket named `products`.
- Runtime model: static Astro output in `dist`; no global SSR.
- Container package: GitHub Container Registry image for portable static serving, separate from the primary Cloudflare Pages frontend.

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
├── public/      Static assets served as-is
├── src/         Astro pages, components, config, styles, and data
├── supabase/    Supabase-related notes and assets
├── Dockerfile   Static build container served by nginx
└── package.json
```

## Release Package

Pushing `main` or a version tag runs the container publishing workflow. Version tags such as `v0.1.0` publish tagged images to GitHub Container Registry.
