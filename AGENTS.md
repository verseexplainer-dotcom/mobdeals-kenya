# MobDeals Kenya working context

Use this file as the compact project brief. Do not load the whole `ai/` tree for a task; read only the one or two relevant files linked below.

## Current source of truth

- Astro 7 static site, TypeScript, Tailwind CSS v4.
- Production hosting: Cloudflare Pages, branch `main`, build `npm run build`, output `dist`.
- Catalog: 241 generated product records in `src/data/products.ts`.
- Product media bucket: Supabase Storage `product-images`.
- Browser Supabase access uses public anon credentials only.
- Cart is browser-local and hands off to WhatsApp; there is no order, payment, or account backend.

## Before changing code

- Read `docs/architecture.md` for system shape.
- Read `docs/codex-context.md` for MCP and context rules.
- For a focused task, read the matching file under `ai/context/`, `ai/skills/`, or `ai/tasks/`; do not read unrelated planning files.

## Verification

Run the narrowest relevant check. For release-level changes use `npm run check`, `npm run lint`, and `npm run build`.

