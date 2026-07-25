# Product System

- Product data should map to typed interfaces in `src/lib/products`.
- Product media may use committed `/images/...` WebP assets or Supabase Storage public URLs from the free-tier `products` bucket.
- Keep product rendering reusable across grids, detail pages, and recommendations.
- Prices should use locale-aware formatting.
- Stock and featured states should be explicit.
