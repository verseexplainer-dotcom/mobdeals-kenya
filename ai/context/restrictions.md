# MobDeals Kenya Restrictions

- Keep Astro static-first
- Use generated static data for the current catalog
- Use Supabase free tier only for public browser-readable data and media when needed
- Use public anon Supabase credentials only in browser code
- Do not use Cloudinary
- Avoid unnecessary hydration
- Optimize for Cloudflare Pages free tier
- Do not add Cloudflare paid services to core storefront behavior
- Do not introduce backend checkout, auth, or order persistence without a separate feature decision
- Keep raw source asset drops out of git unless explicitly requested
- Keep components modular
- Use Tailwind only
- Mobile-first responsive design
- Keep SEO optimized
- Avoid unnecessary dependencies
- Do not use SSR globally
- Use Astro islands minimally
- Prioritize performance
