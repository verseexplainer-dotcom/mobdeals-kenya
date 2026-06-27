# Stack Context

- Framework: Astro
- Styling: Tailwind CSS v4 through `@tailwindcss/vite`
- Language: TypeScript
- Hosting target: Cloudflare Pages on the Cloudflare free tier
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Storage: Supabase Storage public bucket on the Supabase free tier
- Database/client: Supabase public anon client only where browser features need it
- Animations: lightweight CSS, GSAP only when the interaction justifies it

Avoid React unless there is a clear product need.
