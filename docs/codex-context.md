# Codex and MCP context policy

This project does not require an MCP server for ordinary source edits. MCP servers add tool schemas and instructions to the available context, so keep them disabled unless the task needs their external capability.

## Keep available, use deliberately

- `supabase`: use only for live Supabase schema, catalog, storage, migration, or remote debugging work. Prefer local migrations and repository scripts for routine changes.
- `openaiDeveloperDocs`: use only for OpenAI/Codex product or API questions. It is not needed for normal Astro, TypeScript, CSS, or Supabase implementation work.
- `node_repl` / `cua_repl`: use only for browser or interactive computer work. They are not needed for ordinary code, tests, or builds.

## Keep disabled unless a task explicitly needs them

- `playwright`: enable for browser smoke tests or visual QA only.
- `@21st-dev/magic` and `21st`: not part of the current storefront workflow; keep disabled.
- Deployment MCPs or design MCPs: use only for a task that actually deploys or imports design data. Cloudflare deployment is already covered by the repository script and `wrangler`.

## Context-minimising rules

- Prefer repository files, `rg`, package scripts, and local checks before MCP calls.
- Never read all of `ai/`; select the relevant context file by task.
- Keep task plans and historical notes out of the root `AGENTS.md`; stale or verbose instructions are loaded automatically.
- Treat `README.md`, `docs/architecture.md`, and source code as the current project facts. Update `ai/` notes when a fact changes, but do not make them default-loaded context.
- If a server is needed briefly, disable it again after the task and restart Codex so configuration changes take effect.

## Current verified facts

- `src/data/products.ts`: 241 product records.
- Supabase bucket: `product-images`.
- `npm run build`: 298 static pages verified on 2026-09-20.

