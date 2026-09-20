# Product System

- Product data should map to typed interfaces in `src/lib/products`.
- Product media uses Supabase Storage public URLs from the free-tier `product-images` bucket; committed `/images/...` assets are for branding and homepage visuals.
- Keep product rendering reusable across grids, detail pages, and recommendations.
- Prices should use locale-aware formatting.
- Stock and featured states should be explicit.
