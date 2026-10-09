# MobDeals Kenya working context

Use this file as the compact project brief. Do not load the whole `ai/` tree for a task; read only the one or two relevant files linked below.

## Current source of truth

- Astro 7 static site, TypeScript, Tailwind CSS v4.
- Production hosting: Cloudflare Pages, branch `main`, build `npm run build`, output `dist`.
- Catalog: 346 product records in `src/data/products.ts`; incoming drops merge through `scripts/import_product_batch.py`.
- Product media bucket: Supabase Storage `product-images`.
- Browser Supabase access uses public anon credentials only.
- Cart is browser-local and hands off to WhatsApp; there is no order, payment, or account backend.

## Before changing code

- Read `docs/architecture.md` for system shape.
- Read `docs/codex-context.md` for MCP and context rules.
- For a focused task, read the matching file under `ai/context/`, `ai/skills/`, or `ai/tasks/`; do not read unrelated planning files.

## Verification

Run the narrowest relevant check. For release-level changes use `npm run check`, `npm run lint`, and `npm run build`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
