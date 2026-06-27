# Product System

- Product data should map to typed interfaces in `src/lib/products`.
- Product media should use Supabase Storage public URLs from the free-tier `products` bucket or local placeholders.
- Keep product rendering reusable across grids, detail pages, and recommendations.
- Prices should use locale-aware formatting.
- Stock and featured states should be explicit.
