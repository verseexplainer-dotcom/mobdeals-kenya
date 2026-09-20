# MobDeals Kenya Architecture

MobDeals Kenya is a static-first Astro ecommerce frontend optimized for Cloudflare Pages on the Cloudflare free tier.

## Runtime Model

- Astro builds the storefront as static HTML in `dist`; global SSR is intentionally not enabled.
- Cloudflare Pages should build from `main` with `npm run build` and serve `dist`.
- Cloudflare Workers, Pages Functions, KV, D1, R2, and other paid or runtime services are outside the core storefront unless a future feature explicitly justifies them.
- The current cart is a client-side `localStorage` cart that prepares WhatsApp checkout messages. It is not an order, payment, auth, or inventory backend.

## Data And Media

- Product data is generated into `src/data/products.ts` from `product drop/products_for_supabase.csv` by `scripts/import_mobdeals_products.py`.
- The current generated catalog contains 241 listings across laptops, tablets, printers, monitors, projectors, software, UPS, and related hardware.
- Committed files under `public/images` are branding and homepage assets; product media is served from Supabase Storage.
- Raw source-image drops such as `product drop/` stay local and ignored.
- Supabase Storage remains available for product media through the free-tier `product-images` bucket.
- Browser-side Supabase access must use public anon credentials only. Service role keys and privileged credentials must not reach frontend code or public Cloudflare Pages variables.

## Application Shape

- Product rendering is data-driven and component-based across `/shop`, `/category/[slug]`, `/category/[slug]/[filter]`, `/products/[slug]`, brands, search, and homepage sections.
- Tailwind v4 tokens live in `src/styles/global.css`.
- The shared palette uses deep teal surfaces, orange shopping actions and warm light text.
- The separate apex marketing site lives in `marketing/src`, builds with `npm run build:marketing` into `dist-marketing`, and links to the storefront. See `docs/marketing-site.md` for media and domain setup.
- Shared UI primitives live in `src/components/ui`.
- Navigation, home, and product components live under `src/components`.
- Foundation utilities live in `src/lib/utils`, product helpers in `src/lib/products`, Supabase helpers in `src/lib/supabase`, and SEO helpers in `src/lib/seo`.
- AI project context and task instructions live in `ai/`.
