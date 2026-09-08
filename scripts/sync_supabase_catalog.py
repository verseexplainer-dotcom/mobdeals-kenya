#!/usr/bin/env python3
"""Validate and upsert the reviewed MobDeals product catalog into Supabase."""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from import_mobdeals_products import (
    CATEGORY_DEFINITIONS,
    CATEGORY_ORDER,
    DEFAULT_SOURCE,
    ascii_text,
    normalize_condition,
    parse_boolean,
    parse_integer,
    product_specs,
    read_catalog_rows,
)


DEFAULT_MAPPING = Path("output/logs/product-drop-image-mapping.csv")
DEFAULT_REPORT = Path("output/logs/supabase-catalog-sync-report.json")
DEFAULT_BUCKET = "product-images"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'").strip('"'))


def public_image_url(base_url: str, bucket: str, storage_key: str) -> str:
    bucket_part = urllib.parse.quote(bucket, safe="")
    key_part = urllib.parse.quote(storage_key, safe="/")
    return f"{base_url.rstrip('/')}/storage/v1/object/public/{bucket_part}/{key_part}"


def read_mapping(path: Path) -> tuple[dict[str, list[str]], dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    mapping: dict[str, list[str]] = {}
    categories: dict[str, str] = {}
    for row_number, row in enumerate(rows, start=2):
        slug = ascii_text(row.get("product_slug"))
        keys = [ascii_text(value) for value in (row.get("storage_keys") or "").split(" | ") if ascii_text(value)]
        if not slug or not keys:
            raise ValueError(f"Mapping row {row_number} is missing a product slug or storage key")
        if slug in mapping:
            raise ValueError(f"Mapping contains duplicate product slug: {slug}")
        mapping[slug] = keys
        categories[slug] = ascii_text(row.get("catalog_category"))
    return mapping, categories


def spec_value(row: dict[str, str], label: str) -> str | None:
    return next((spec["value"] for spec in product_specs(row) if spec["label"] == label), None)


def tag_values(value: str) -> list[str]:
    return [item for item in (ascii_text(part) for part in re.split(r"[,;|]", value)) if item]


def build_payloads(
    rows: list[dict[str, str]],
    mapping: dict[str, list[str]],
    mapping_categories: dict[str, str],
    base_url: str,
    bucket: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    source_slugs = {ascii_text(row["slug"]) for row in rows}
    if set(mapping) != source_slugs:
        missing = sorted(source_slugs - set(mapping))
        extra = sorted(set(mapping) - source_slugs)
        raise ValueError(f"Catalog/mapping mismatch. Missing={missing[:5]}, extra={extra[:5]}")

    categories_present: set[str] = set()
    products: list[dict[str, Any]] = []
    image_rows: list[dict[str, Any]] = []

    featured_categories: set[str] = set()
    for index, row in enumerate(rows):
        slug = ascii_text(row["slug"])
        title = ascii_text(row["title"])
        keys = mapping[slug]
        category = mapping_categories[slug]
        categories_present.add(category)
        price = parse_integer(row["price_kes"], "price_kes", index + 2)
        compare_at = parse_integer(row["compare_at_price"], "compare_at_price", index + 2)
        in_stock = parse_boolean(row["is_available"]) and ascii_text(row["stock_status"]).casefold() == "in stock"
        featured = index < 4 or category not in featured_categories
        if featured:
            featured_categories.add(category)
        image_url = public_image_url(base_url, bucket, keys[0])
        product = {
            "source_row": int(ascii_text(row.get("source_row_number")) or index + 2),
            "slug": slug,
            "title": title,
            "product_name": ascii_text(row.get("product_name")) or title,
            "brand": ascii_text(row["brand"]),
            "category": category,
            "condition": normalize_condition(row["condition"]),
            "price_kes": price,
            "compare_at_price": compare_at if compare_at > price else None,
            "short_specs": ascii_text(row.get("short_specs")),
            "ram": spec_value(row, "Memory"),
            "storage": spec_value(row, "Storage"),
            "generation": spec_value(row, "Generation"),
            "seo_title": ascii_text(row["meta_title"]),
            "meta_description": ascii_text(row["meta_description"]),
            "short_description": ascii_text(row["short_description"]),
            "long_description": row["description_html"].strip(),
            "description_html": row["description_html"].strip(),
            "focus_keyword": ascii_text(row.get("focus_keyword")) or None,
            "search_keywords": ascii_text(row.get("search_keywords")) or None,
            "warranty": ascii_text(row["warranty"]),
            "stock_status": ascii_text(row["stock_status"]),
            "sku": ascii_text(row["sku"]),
            "availability": ascii_text(row.get("availability")) or None,
            "is_available": in_stock,
            "is_active": True,
            "featured": featured,
            "tags": tag_values(row.get("tags", "")),
            "json_ld": json.loads(row["product_schema_json"]),
            "image_key": keys[0],
            "image_url": image_url,
            "source_id": ascii_text(row.get("source_id")) or None,
            "source_kind": ascii_text(row.get("source_kind")) or None,
            "source_sheet": ascii_text(row.get("source_sheet")) or None,
            "source_section": ascii_text(row.get("source_section")) or None,
        }
        products.append(product)
        for position, storage_key in enumerate(keys, start=1):
            image_rows.append(
                {
                    "product_slug": slug,
                    "position": position,
                    "storage_key": storage_key,
                    "image_url": public_image_url(base_url, bucket, storage_key),
                    "alt_text": title if position == 1 else f"{title} - image {position}",
                }
            )

    categories = [
        {
            "slug": slug,
            "label": CATEGORY_DEFINITIONS[slug]["label"],
            "eyebrow": CATEGORY_DEFINITIONS[slug]["eyebrow"],
            "description": CATEGORY_DEFINITIONS[slug]["description"],
            "seo_title": CATEGORY_DEFINITIONS[slug]["seoTitle"],
            "seo_description": CATEGORY_DEFINITIONS[slug]["seoDescription"],
            "sort_order": (CATEGORY_ORDER.index(slug) + 1) * 10,
            "is_active": True,
        }
        for slug in CATEGORY_ORDER
        if slug in categories_present
    ]
    return categories, products, image_rows


class SupabaseRest:
    def __init__(self, base_url: str, service_key: str, timeout: int) -> None:
        self.endpoint = base_url.rstrip("/") + "/rest/v1"
        self.timeout = timeout
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }

    def request(self, method: str, path: str, payload: Any | None = None, prefer: str | None = None) -> Any:
        headers = dict(self.headers)
        if prefer:
            headers["Prefer"] = prefer
        data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(self.endpoint + path, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read()
                return json.loads(body) if body else None
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase request failed ({error.code}) for {method} {path}: {detail}") from error

    def upsert(self, table: str, rows: list[dict[str, Any]], conflict: str, batch_size: int) -> list[dict[str, Any]]:
        returned: list[dict[str, Any]] = []
        query = urllib.parse.urlencode({"on_conflict": conflict})
        for batch in batched(rows, batch_size):
            result = self.request(
                "POST",
                f"/{table}?{query}",
                batch,
                "resolution=merge-duplicates,return=representation",
            )
            returned.extend(result or [])
        return returned


def batched(rows: list[dict[str, Any]], size: int) -> Iterable[list[dict[str, Any]]]:
    for index in range(0, len(rows), size):
        yield rows[index : index + size]


def write_report(path: Path, report: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, nargs="?", default=DEFAULT_SOURCE)
    parser.add_argument("--mapping", type=Path, default=DEFAULT_MAPPING)
    parser.add_argument("--bucket", default=DEFAULT_BUCKET)
    parser.add_argument("--expected-count", type=int, default=241)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--apply", action="store_true", help="Write the validated catalog to the linked Supabase project.")
    args = parser.parse_args()

    load_env_file(Path(".env"))
    load_env_file(Path(".env.local"))
    base_url = os.environ.get("PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base_url:
        raise SystemExit("Missing PUBLIC_SUPABASE_URL in the environment or .env files.")

    rows = read_catalog_rows(args.source, args.expected_count)
    mapping, mapping_categories = read_mapping(args.mapping)
    categories, products, images = build_payloads(rows, mapping, mapping_categories, base_url, args.bucket)
    report: dict[str, Any] = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "source": str(args.source),
        "mapping": str(args.mapping),
        "bucket": args.bucket,
        "category_count": len(categories),
        "product_count": len(products),
        "product_image_row_count": len(images),
        "unique_storage_object_count": len({image["storage_key"] for image in images}),
        "apply_requested": args.apply,
        "upserted_categories": 0,
        "upserted_products": 0,
        "upserted_product_images": 0,
    }

    if args.apply:
        if not service_key:
            raise SystemExit("SUPABASE_SERVICE_ROLE_KEY is required for --apply.")
        client = SupabaseRest(base_url, service_key, args.timeout)
        returned_categories = client.upsert("product_categories", categories, "slug", args.batch_size)
        returned_products = client.upsert("products", products, "slug", args.batch_size)
        product_ids = {row["slug"]: row["id"] for row in returned_products}
        if len(product_ids) != len(products):
            raise RuntimeError("Supabase did not return every upserted product id")
        image_payloads = [
            {key: value for key, value in image.items() if key != "product_slug"}
            | {"product_id": product_ids[image["product_slug"]]}
            for image in images
        ]
        returned_images = client.upsert("product_images", image_payloads, "product_id,position", args.batch_size)
        report.update(
            {
                "upserted_categories": len(returned_categories),
                "upserted_products": len(returned_products),
                "upserted_product_images": len(returned_images),
            }
        )

    write_report(args.report, report)
    action = "Upserted" if args.apply else "Validated"
    print(f"{action} {len(products)} products, {len(images)} product-image rows, and {len(categories)} categories.")
    print(f"Report: {args.report}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
