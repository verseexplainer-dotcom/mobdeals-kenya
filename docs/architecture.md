# SES NEXT GEN Architecture

SES NEXT GEN is structured as a static-first Astro ecommerce frontend optimized for Cloudflare free tier hosting.

- Product media should come from Supabase Storage public buckets.
- Product rendering should stay data-driven and component-based.
- Global SSR is intentionally not enabled.
- Tailwind v4 tokens live in `src/styles/global.css`.
- Shared UI primitives live in `src/components/ui`.
- Foundation utilities live in `src/lib/utils`.
- SEO metadata helpers live in `src/lib/seo`.
- AI project context and task instructions live in `ai/`.
