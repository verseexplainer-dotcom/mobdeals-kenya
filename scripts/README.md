# Scripts

Project automation scripts belong here. Keep scripts small, repeatable, and safe for local development.

## Product Catalog Import

`scripts/import_mobdeals_products.py` generates the storefront catalog from the MobDeals SEO workbook.

Run after workbook updates:

```sh
python3 scripts/import_mobdeals_products.py path/to/mobdeals_seo_copy_340products.xlsx
```

Expected outputs:

- `src/data/products.ts` with typed category and product data.
- Product image references that point at optimized committed assets in `public/images`.

Local source inputs such as workbook exports and raw image drops should stay out of git unless they are intentionally promoted into a tracked import package. The current raw image drop directory is `product drop/`, which is ignored. Commit the optimized WebP storefront assets instead.

Optional flags:

- `--output`: override the generated TypeScript module path. Defaults to `src/data/products.ts`.
- `--images-dir`: override the image matching directory. Defaults to `public/images`.
