# Stack Context

- Framework: Astro
- Styling: Tailwind CSS v4 through `@tailwindcss/vite`
- Language: TypeScript
- Hosting target: Cloudflare Pages on the Cloudflare free tier
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Product data: generated static TypeScript module in `src/data/products.ts`
- Product media: Supabase Storage public bucket `product-images`; `public/images` contains branding and homepage assets
- Database/client: Supabase public anon client only where browser features need it
- Animations: lightweight CSS, GSAP only when the interaction justifies it
- Cart: browser `localStorage` with WhatsApp checkout handoff

Avoid React unless there is a clear product need.
