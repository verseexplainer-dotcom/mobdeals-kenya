# Scripts

Project automation scripts belong here. Keep scripts repeatable and safe for local development.

## Product Catalog Import

The current catalog source is `product drop/products_for_supabase.csv`. Product images live in the categorized folders beside that CSV. The entire `product drop/` directory remains ignored because it is a local import package rather than a deployment artifact.

Generate the storefront catalog, mapping report, and Supabase upload manifest:

```sh
python3 scripts/import_mobdeals_products.py
```

The importer:

- Validates all 241 product rows, prices, SKUs, descriptions, and product schema JSON.
- Groups numbered WebP files as gallery images.
- Preserves source category folders in Storage keys such as `laptop/hp-victus-15-fa2787nr-laptop/01.webp`.
- Uses the mapped image folder as the storefront category when the supplied sheet category is inconsistent.
- Generates `src/data/products.ts` as the project catalog used by Astro.
- Writes review artifacts under `output/logs/`, including the exact source-to-product image mapping.

Optional flags:

- `--expected-count`: require an exact product-row count. Defaults to `241`.
- `--images`: override the categorized image root. Defaults to `product drop/`.
- `--output`: override the generated TypeScript module path. Defaults to `src/data/products.ts`.
- `--mapping`, `--manifest`, and `--report`: override generated review artifact paths.

The importer refuses missing or unsafe product data and low-confidence image matches. Explicit approximate mappings remain visible in `output/logs/product-drop-import-report.json`.

## Supabase Media Sync

Check whether every image used by the generated catalog exists in the public `product-images` bucket:

```sh
python3 scripts/sync_supabase_products.py
```

Upload missing images and rerun the all-or-nothing storage gate:

```sh
SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/sync_supabase_products.py --upload
```

The service role key is required only for uploads and must never be committed or exposed to Astro client code. The sync does not delete old bucket objects; unused previous images can be pruned separately after the replacement catalog is verified in production.

## Image-Only Template

Generate a review CSV containing every image group in the drop, including groups that have no row in the supplied product sheet:

```sh
python3 scripts/generate_product_catalog_template.py
```

This writes `output/spreadsheet/new_product_catalog_template.csv` and is useful for identifying unused images or preparing future catalog rows.
