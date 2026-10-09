# Codex and MCP context policy

This project does not require an MCP server for ordinary source edits. `supabase`, `openaiDeveloperDocs`, and `playwright` are enabled in the project config for availability; invoke them only when the user requests them or the task needs their external capability.

## Keep available, use deliberately

- `supabase`: use only for live Supabase schema, catalog, storage, migration, or remote debugging work. Prefer local migrations and repository scripts for routine changes.
- `openaiDeveloperDocs`: use only for OpenAI/Codex product or API questions. It is not needed for normal Astro, TypeScript, CSS, or Supabase implementation work.
- `playwright`: use for browser smoke tests or visual QA only.
- `node_repl` / `cua_repl`: use only for browser or interactive computer work. They are not needed for ordinary code, tests, or builds.

## Keep disabled unless a task explicitly needs them

- `@21st-dev/magic` and `21st`: not part of the current storefront workflow; keep disabled.
- Deployment MCPs or design MCPs: use only for a task that actually deploys or imports design data. Cloudflare deployment is already covered by the repository script and `wrangler`.

## Context-minimising rules

- Prefer repository files, `rg`, package scripts, and local checks before MCP calls.
- Never read all of `ai/`; select the relevant context file by task.
- Keep task plans and historical notes out of the root `AGENTS.md`; stale or verbose instructions are loaded automatically.
- Treat `README.md`, `docs/architecture.md`, and source code as the current project facts. Update `ai/` notes when a fact changes, but do not make them default-loaded context.
- Configuration changes may require restarting Codex before a server becomes available in the active session.

## Current verified facts

- `src/data/products.ts`: 346 product records after the September 2026 batch merge.
- Supabase bucket: `product-images`.
- `npm run build`: 407 static pages verified on 2026-09-27.
