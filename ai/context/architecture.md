# Architecture Context

Keep the project static-first. Pages are data-driven, component-based, and optimized for Cloudflare Pages free-tier static hosting.

Current implementation:

- Astro generates static routes for home, shop, categories, filtered categories, products, brands, search, cart, support, and content pages.
- `src/data/products.ts` is generated from `product drop/products_for_supabase.csv` and currently holds 241 product listings.
- Product media is served from Supabase Storage bucket `product-images`; raw source drops such as `product drop/` stay local and ignored.
- Supabase free tier remains available for public media and browser-readable data. Public browser code may read via the anon key only.
- The cart is client-side `localStorage` with WhatsApp checkout handoff. It is not a backend order system.

Primary source areas:

- `src/components`: reusable UI, product, navigation, home, and shared components
- `src/layouts`: Astro layouts
- `src/lib`: Supabase, SEO, product, analytics, and utility code
- `src/config`: typed site and design configuration
- `src/data`: generated catalog data and curated storefront content
- `src/content`: Astro content collections
- `public`: committed static assets
- `ai`: prompts, tasks, skills, and project context
