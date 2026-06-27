# Cloudflare Rules

- Keep output static unless a feature requires Workers.
- Avoid server-only runtime assumptions in pages.
- Keep assets optimized and cache-friendly.
- Do not rely on paid Cloudflare features for core storefront behavior.
- Document any deployment-specific environment variables.
- Primary frontend hosting is Cloudflare Pages free tier.
- Use `npm run build` with `dist` as the Cloudflare Pages output directory.
- Do not add a Cloudflare adapter or Pages Functions unless the feature requires runtime code.
