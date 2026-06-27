# MobDeals Kenya

Static Astro storefront for MobDeals Kenya, a premium electronics ecommerce experience for Nairobi and customers across Kenya.

## Project Overview

This project is built with Astro, Tailwind CSS, Supabase client utilities, and a static-first deployment model. It focuses on laptops, smartphones, printers, desktops, storage, accessories, and related technology buying flows.

## Local Setup

Requirements:

- Node.js `>=22.12.0`
- npm

Install dependencies:

```sh
npm install
```

Start the local dev server:

```sh
npm run dev
```

Build production assets:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Repository And Deployment Notes

This project is prepared to live as its own MobDeals Kenya repository with an independent Docker image.

Current status:

- Git remote currently points to `git@github.com:sesict/Ses_ict_hub.git`.
- Recommended GitHub repo target is `github.com/<owner>/mobdeals-kenya`.
- Recommended local folder name is `mobdeals-kenya`.
- Container workflow image target is `ghcr.io/<owner>/mobdeals-kenya`, derived from the GitHub repository owner.
- Current branch remains `master`.

After the GitHub repository exists, update the local remote with:

```sh
git remote set-url origin git@github.com:<owner>/mobdeals-kenya.git
git remote -v
```

If the local folder should match the repo slug:

```sh
cd /home/paulaflare/projects
mv ses-next-gen mobdeals-kenya
cd mobdeals-kenya
```

## Project Structure

```text
/
├── ai/          Project planning, prompts, and implementation notes
├── public/      Static assets served as-is
├── src/         Astro pages, components, config, styles, and data
├── supabase/    Supabase-related notes and assets
├── Dockerfile   Static build container served by nginx
└── package.json
```

## Final Handover Step

When the GitHub account/repository is provided, set the new remote, commit the prepared changes, and push. The container workflow will publish the Docker image to GitHub Container Registry for that owner.
