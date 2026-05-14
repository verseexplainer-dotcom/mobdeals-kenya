# Architecture Context

Keep the project static-first. Pages should be data-driven, component-based, and optimized for Cloudflare static hosting.

Primary source areas:

- `src/components`: reusable UI, product, navigation, home, and shared components
- `src/layouts`: Astro layouts
- `src/lib`: Supabase, SEO, product, analytics, and utility code
- `src/config`: typed site and design configuration
- `src/data`: static product/content seed data
- `src/content`: Astro content collections
- `public`: static assets
- `ai`: prompts, tasks, skills, and project context
