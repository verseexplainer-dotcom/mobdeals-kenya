# MobDeals Kenya Architecture

MobDeals Kenya is structured as a static-first Astro ecommerce frontend optimized for Cloudflare Pages on the Cloudflare free tier.

- Product media should come from Supabase Storage public buckets on the Supabase free tier.
- Browser-side Supabase access must use public anon credentials only.
- Cloudflare Pages should build with `npm run build` and serve the generated `dist` directory from the `main` branch.
- Cloudflare Workers, Pages Functions, KV, D1, R2, and other paid or runtime features are not part of the core storefront unless a future feature explicitly justifies them.
- Product rendering should stay data-driven and component-based.
- Global SSR is intentionally not enabled.
- Tailwind v4 tokens live in `src/styles/global.css`.
- Shared UI primitives live in `src/components/ui`.
- Foundation utilities live in `src/lib/utils`.
- SEO metadata helpers live in `src/lib/seo`.
- AI project context and task instructions live in `ai/`.
