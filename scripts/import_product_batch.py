#!/usr/bin/env python3
"""Merge a flat WebP product batch into the storefront and Supabase catalog."""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from generate_product_catalog_template import CATEGORY_MAP
from import_mobdeals_products import (
    CATEGORY_DEFINITIONS,
    CATEGORY_ORDER,
    ImageGroup,
    ProductImageMatch,
    ascii_text,
    build_products,
    normalize_condition,
    parse_integer,
    read_catalog_rows,
    render_products_ts,
)


ROOT = Path("product drop")
SOURCE = ROOT / "products_for_supabase.csv"
IMAGE_ROOT = ROOT / "product_images_webp"
RENAME_MAP = IMAGE_ROOT / "_rename_mapping.csv"
CATALOG = Path("src/data/products.ts")
OUT = Path("output/logs")
BUCKET = "product-images"
BRANDS = set("hp dell lenovo microsoft apple huawei samsung acer asus msi canon epson kyocera infinix tecno starlink lightwave mercury mecer onn unomat phomemo".split())
SERIES = set("thinkpad elitebook probook latitude vostro xps ideapad thinkbook yoga thinkcentre optiplex prodesk elitedesk dragonfly omen victus pavilion zbook inspiron precision surface macbook chromebook".split())
NON_MODEL = set("touch touchscreen non hdmi usb wifi bluetooth fhd hd ips full high definition intel amd core processor ram memory gb tb ssd hdd nvme storage gen generation brand new refurbished used ex uk".split())


def load_env() -> None:
    for path in (Path(".env"), Path(".env.local")):
        if not path.exists():
            continue
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            if line.startswith("export "):
                line = line[7:].strip()
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def model_key(title: str) -> tuple[str, ...]:
    value = title.lower().split("|")[0].replace("_", " ").replace("-", " ")
    value = re.split(r"\b(?:intel|amd|core\s*i[3579]|corei[3579]|ryzen\s*[3579]|ryzen[3579]|celeron|pentium|\d+\s*gb|\d+\s*tb|used|refurbished|ex\s*uk|brand new)\b", value)[0]
    value = re.sub(r"\b\d+(?:st|nd|rd|th)\s*(?:gen|generation)\b", " ", value)
    return tuple(token for token in re.findall(r"[a-z0-9]+", value) if token not in BRANDS | SERIES | NON_MODEL)


def product_signature(row: dict[str, str]) -> dict[str, Any]:
    value = (row.get("title", "") + ";" + row.get("short_specs", "")).lower()
    value = value.replace("-", " ").replace("_", " ")
    value = value.replace("corei", "core i").replace("ryzen5", "ryzen 5").replace("ryzen7", "ryzen 7")
    cpu = re.search(r"\b(core\s+i[3579]|ryzen\s*[3579]|celeron|pentium)\b", value)
    generation = re.search(r"\b(\d+)(?:st|nd|rd|th)?\s*(?:gen|generation)\b", value)
    ram = re.search(r"\b(\d+)\s*gb\s*(?:ram|memory)\b", value)
    storage = re.search(r"\b(\d+(?:\.\d+)?)\s*(gb|tb)\s*(ssd|hdd|nvme|storage)\b", value)
    capacities = re.findall(r"\b(\d+(?:\.\d+)?)\s*(gb|tb)\b", value)
    if not ram and len(capacities) > 1:
        ram_value = capacities[0][0]
    else:
        ram_value = ram.group(1) if ram else ""
    if not storage and len(capacities) > 1:
        storage_value = (capacities[1][0], capacities[1][1])
    else:
        storage_value = (storage.group(1), storage.group(2)) if storage else ()
    touch: bool | None = False if re.search(r"\bnon[ -]?touch\b", value) else True if re.search(r"\btouch(?:screen)?\b|x360", value) else None
    graphics = re.search(r"\b(rtx\s*\d+|gtx\s*\d+|nvidia|intel\s+iris\s+xe|intel\s+uhd|radeon|\d+gb\s+graphics)\b", value)
    condition = ascii_text(row.get("condition", "")).casefold()
    condition = "new" if condition in {"new", "brand new"} else "open box" if condition in {"open box", "open-box"} else "refurbished"
    return {
        "cpu": re.sub(r"\s+", " ", cpu.group(1)) if cpu else "",
        "generation": generation.group(1) if generation else "",
        "ram": ram_value,
        "storage": storage_value,
        "storage_type": storage.group(3) if storage else "",
        "touch": touch,
        "graphics": re.sub(r"\s+", " ", graphics.group(1)) if graphics else "",
        "condition": condition,
    }


def row_key(row: dict[str, str], include_price: bool) -> tuple[Any, ...]:
    signature = product_signature(row)
    identity = (
        ascii_text(row.get("brand")).casefold(),
        ascii_text(row.get("category")).casefold(),
        model_key(row.get("title", "")),
        signature["cpu"], signature["generation"], signature["ram"], signature["storage"],
        signature["touch"], signature["graphics"], signature["condition"],
    )
    return identity + ((ascii_text(row.get("price_kes")),) if include_price else ())


def read_rename_map() -> dict[str, dict[str, str]]:
    with RENAME_MAP.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    result: dict[str, dict[str, str]] = {}
    for index, row in enumerate(rows):
        original = ascii_text(row.get("original_whatsapp_filename")).casefold()
        key = original or f"@{ascii_text(row.get('final_webp_filename')).casefold()}:{index}"
        result[key] = row
    return result


def get_json(base_url: str, key: str, table: str, select: str) -> list[dict[str, Any]]:
    query = urllib.parse.urlencode({"select": select, "limit": "2000"})
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/rest/v1/{table}?{query}",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def stored_media_key(image: dict[str, Any]) -> str:
    key = ascii_text(image.get("storage_key"))
    if key:
        return key
    url = ascii_text(image.get("image_url"))
    marker = f"/storage/v1/object/public/{BUCKET}/"
    return urllib.parse.unquote(url.split(marker, 1)[1]) if marker in url else ""


def duplicate_match(batch: dict[str, str], existing: dict[str, Any]) -> bool:
    if ascii_text(batch.get("sku")) and ascii_text(batch.get("sku")) == ascii_text(existing.get("sku")):
        return True
    if ascii_text(batch.get("brand")).casefold() != ascii_text(existing.get("brand")).casefold():
        return False
    batch_model = model_key(batch.get("title", ""))
    if not batch_model or batch_model != model_key(existing.get("title", "")):
        return False
    a, b = product_signature(batch), product_signature({**existing, "condition": existing.get("condition", "")})
    if not all(a[field] and b[field] and a[field] == b[field] for field in ("cpu", "generation", "ram", "storage")):
        return False
    if a["storage_type"] not in {"", "storage"} and b["storage_type"] not in {"", "storage"} and a["storage_type"] != b["storage_type"]:
        return False
    if a["touch"] is not None and b["touch"] is not None and a["touch"] != b["touch"]:
        return False
    if a["graphics"] and b["graphics"] and a["graphics"] != b["graphics"]:
        return False
    return a["condition"] == b["condition"]


def fetch_live(base_url: str, key: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    products = get_json(base_url, key, "products", "id,slug,title,sku,brand,category,condition,short_specs,image_key,image_url,is_active,source_row")
    images = get_json(base_url, key, "product_images", "product_id,position,storage_key,image_url")
    return products, images


def source_image(row: dict[str, str], rename: dict[str, dict[str, str]]) -> str:
    mapped = rename.get(ascii_text(row.get("source_id")).casefold())
    if not mapped:
        raise ValueError(f"No renamed WebP image for source id {row.get('source_id')} ({row.get('slug')})")
    path = IMAGE_ROOT / mapped["final_webp_filename"]
    if not path.is_file():
        raise ValueError(f"Missing source image: {path}")
    return path.relative_to(ROOT).as_posix()


def make_match(row: dict[str, str], rename: dict[str, dict[str, str]]) -> ProductImageMatch:
    category_folder = {"desktop": "desktop", "laptop": "laptop", "monitor": "monitor", "smartphone": "smartphone"}[ascii_text(row["category"]).casefold()]
    slug = ascii_text(row["slug"])
    return ProductImageMatch(
        product_slug=slug,
        source_category=ascii_text(row["category"]).casefold(),
        group=ImageGroup(
            folder=category_folder,
            category=CATEGORY_MAP[category_folder],
            slug=slug,
            name=ascii_text(row["title"]),
            source_paths=(source_image(row, rename),),
            storage_keys=(f"{category_folder}/{slug}/01.webp",),
        ),
        score=1.0,
        gap=1.0,
        status="matched",
    )


def public_url(base_url: str, storage_key: str) -> str:
    return f"{base_url.rstrip('/')}/storage/v1/object/public/{BUCKET}/{urllib.parse.quote(storage_key, safe='/')}"


def upload_image(base_url: str, key: str, source_path: str, storage_key: str) -> dict[str, Any]:
    source = ROOT / source_path
    encoded = urllib.parse.quote(storage_key, safe="/")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/storage/v1/object/{BUCKET}/{encoded}",
        data=source.read_bytes(),
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "image/webp",
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return {"source_path": source_path, "storage_key": storage_key, "uploaded": response.status in {200, 201}, "status": response.status}
    except urllib.error.HTTPError as error:
        return {"source_path": source_path, "storage_key": storage_key, "uploaded": False, "status": error.code, "error": error.read().decode("utf-8", errors="replace")}


def build(args: argparse.Namespace) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    load_env()
    base_url = os.environ.get("PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base_url or not service_key:
        raise ValueError("PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to compare the live catalog.")

    rows = read_catalog_rows(SOURCE, expected_count=None)
    rename = read_rename_map()
    original_count = len(rows)
    by_signature: dict[tuple[Any, ...], list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        by_signature[row_key(row, include_price=True)].append(row)

    winners: list[dict[str, str]] = []
    duplicate_rows: list[dict[str, str]] = []
    for candidates in by_signature.values():
        ordered = sorted(candidates, key=lambda item: (ascii_text(item.get("updated_at")), int(ascii_text(item.get("source_row_number")) or "0")))
        winner = ordered[-1]
        winners.append(winner)
        duplicate_rows.extend(row for row in candidates if row is not winner)
    winners.sort(key=lambda item: int(ascii_text(item.get("source_row_number")) or "0"))

    live_products, live_images = fetch_live(base_url, service_key)
    max_source_row = max((int(product["source_row"]) for product in live_products if product.get("source_row") is not None), default=0)
    for index, row in enumerate(winners, start=1):
        row["source_row_number_original"] = ascii_text(row.get("source_row_number"))
        row["source_row_number"] = str(max_source_row + index)
    images_by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for image in live_images:
        images_by_product[image["product_id"]].append(image)
    active = [product for product in live_products if product.get("is_active")]
    replaced_by_slug: dict[str, list[dict[str, Any]]] = defaultdict(list)
    replaced_products: dict[str, dict[str, Any]] = {}
    matched_rows: list[dict[str, Any]] = []
    for row in winners:
        matches = [product for product in active if duplicate_match(row, product)]
        if not matches:
            continue
        row_keys: list[str] = []
        for product in sorted(matches, key=lambda item: (item["slug"], item["id"])):
            replaced_products[product["id"]] = product
            for image in sorted(images_by_product[product["id"]], key=lambda item: int(item.get("position", 0))):
                storage_key = stored_media_key(image)
                if storage_key and storage_key not in row_keys:
                    row_keys.append(storage_key)
            if not images_by_product[product["id"]]:
                storage_key = ascii_text(product.get("image_key"))
                if storage_key and storage_key not in row_keys:
                    row_keys.append(storage_key)
        replaced_by_slug[row["slug"]] = [{"storage_key": item} for item in row_keys]
        matched_rows.extend({"new_slug": row["slug"], "old_slug": product["slug"], "old_id": product["id"], "old_images": [stored_media_key(image) for image in sorted(images_by_product[product["id"]], key=lambda item: int(item.get("position", 0))) if stored_media_key(image)]} for product in matches)

    manifest: list[dict[str, Any]] = []
    mapping_rows: list[dict[str, str]] = []
    products, _ = build_products(
        winners,
        [make_match(row, rename) for row in winners],
    )
    # Existing Supabase media stays at position two. Duplicate source rows from this
    # batch become further gallery images, after the existing store image.
    products_by_slug = {item["slug"]: item for item in products}
    duplicate_assets: dict[str, list[str]] = defaultdict(list)
    for duplicate in duplicate_rows:
        duplicate_assets[ascii_text(duplicate["slug"])].append(source_image(duplicate, rename))
    for row in winners:
        slug = ascii_text(row["slug"])
        product = products_by_slug[slug]
        image_entries = [product["images"][0]]
        old_images = replaced_by_slug.get(slug, [])
        for old_image in old_images:
            image_entries.append({"src": "", "storageKey": old_image["storage_key"], "alt": f"{product['name']} - image {len(image_entries) + 1}"})
        physical_paths = [source_image(row, rename)]
        for duplicate_slug, paths in duplicate_assets.items():
            duplicate = next((item for item in duplicate_rows if ascii_text(item["slug"]) == duplicate_slug), None)
            if duplicate and row_key(duplicate, True) == row_key(row, True):
                for path in paths:
                    if path not in physical_paths:
                        physical_paths.append(path)
        for path in physical_paths[1:]:
            pos = len(image_entries) + 1
            key_path = f"{path.split('/', 1)[0]}/{slug}/{pos:02d}.webp"
            image_entries.append({"src": "", "storageKey": key_path, "alt": f"{product['name']} - image {pos}"})
        # Rewrite the primary generated key to the canonical batch path.
        category_folder = {"desktop": "desktop", "laptop": "laptop", "monitor": "monitor", "smartphone": "smartphone"}[ascii_text(row["category"]).casefold()]
        image_entries[0]["storageKey"] = f"{category_folder}/{slug}/01.webp"
        product["images"] = image_entries

        storage_keys = [item["storageKey"] for item in image_entries]
        mapping_rows.append({
            "product_slug": slug,
            "product_title": ascii_text(row["title"]),
            "source_category": ascii_text(row["category"]).casefold(),
            "catalog_category": CATEGORY_MAP[category_folder],
            "mapping_status": "exact-source-id",
            "match_score": "1.000",
            "score_gap": "1.000",
            "image_group": slug,
            "source_images": " | ".join(physical_paths),
            "storage_keys": " | ".join(storage_keys),
        })
        for path, storage_key in zip(physical_paths, [storage_keys[0], *storage_keys[len(storage_keys) - (len(physical_paths) - 1):]] if len(physical_paths) > 1 else [storage_keys[0]]):
            manifest.append({"source_path": path, "storage_key": storage_key, "product_slugs": [slug]})

    # Include additional, unclaimed photos only when model and core configuration
    # identify one unambiguous new listing.
    assigned = {item["source_path"].split("/", 1)[-1] for item in manifest}
    extra_assets: list[dict[str, Any]] = []
    winners_by_slug = {ascii_text(row["slug"]): row for row in winners}
    for rename_row in rename.values():
        filename = ascii_text(rename_row["final_webp_filename"])
        if filename in assigned or not (IMAGE_ROOT / filename).is_file():
            continue
        stem = re.sub(r"-ksh\d+(?:-\d+)?$", "", Path(ascii_text(rename_row.get("source_filename"))).stem, flags=re.I)
        stem = re.sub(r"-\d+$", "", stem)
        stem = re.sub(r"[-_ ]+additional[-_ ]+photo$", "", stem, flags=re.I)
        image_sig = product_signature({"title": stem, "short_specs": ""})
        image_model = model_key(stem)
        if not image_model:
            continue
        candidates = []
        for row in winners:
            if model_key(row["title"]) != image_model:
                continue
            row_sig = product_signature(row)
            if any(image_sig[field] and image_sig[field] != row_sig[field] for field in ("cpu", "generation", "ram", "storage")):
                continue
            if image_sig["touch"] is not None and row_sig["touch"] is not None and image_sig["touch"] != row_sig["touch"]:
                continue
            candidates.append(row)
        unique = {ascii_text(row["slug"]): row for row in candidates}
        if len(unique) == 1:
            target = next(iter(unique.values()))
            extra_assets.append({"filename": filename, "slug": ascii_text(target["slug"]), "source_path": (IMAGE_ROOT / filename).relative_to(ROOT).as_posix()})

    for extra in extra_assets:
        product = products_by_slug[extra["slug"]]
        pos = len(product["images"]) + 1
        category_folder = ascii_text(product["category"]).removesuffix("s")
        if product["category"] == "smartphones":
            category_folder = "smartphone"
        storage_key = f"{category_folder}/{extra['slug']}/{pos:02d}.webp"
        product["images"].append({"src": "", "storageKey": storage_key, "alt": f"{product['name']} - image {pos}"})
        manifest.append({"source_path": extra["source_path"], "storage_key": storage_key, "product_slugs": [extra["slug"]]})
        for mapping in mapping_rows:
            if mapping["product_slug"] == extra["slug"]:
                mapping["storage_keys"] += f" | {storage_key}"
                mapping["source_images"] += f" | {extra['source_path']}"
                break

    categories = json.loads(CATALOG.read_text(encoding="utf-8").split("export const productCategories: ProductCategory[] = ", 1)[1].split(";\n\nconst catalogProducts", 1)[0])
    new_category_slugs = sorted({item["category"] for item in products})
    current_category_slugs = {item["slug"] for item in categories}
    for slug in new_category_slugs:
        if slug in current_category_slugs:
            continue
        definition = CATEGORY_DEFINITIONS[slug]
        categories.append({"slug": slug, **definition})
    categories.sort(key=lambda item: CATEGORY_ORDER.index(item["slug"]) if item["slug"] in CATEGORY_ORDER else len(CATEGORY_ORDER))

    catalog_text = CATALOG.read_text(encoding="utf-8")
    old_literal = catalog_text.split("const catalogProducts: Product[] = ", 1)[1].split("\n];", 1)[0] + "]"
    current_products = json.loads(old_literal)
    replaced_slugs = {item["slug"] for item in replaced_products.values()}
    winners_by_slug = {item["slug"]: item for item in products}
    merged = list(products) + [item for item in current_products if item["slug"] not in replaced_slugs and item["slug"] not in winners_by_slug]
    CATALOG.write_text(render_products_ts(categories, merged, SOURCE), encoding="utf-8")

    final_csv = OUT / "product-batch-final.csv"
    final_csv.parent.mkdir(parents=True, exist_ok=True)
    with final_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(winners[0]))
        writer.writeheader()
        writer.writerows(winners)
    mapping_path = OUT / "product-batch-image-mapping.csv"
    with mapping_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(mapping_rows[0]))
        writer.writeheader()
        writer.writerows(mapping_rows)
    manifest_path = OUT / "product-batch-upload-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    stale_match_slugs = sorted(replaced_slugs)
    assigned_files = {Path(item["source_path"]).name for item in manifest}
    unmatched_photos = sorted(path.name for path in IMAGE_ROOT.glob("*.webp") if path.name not in assigned_files)
    report = {
        "source_rows": original_count,
        "duplicate_rows_collapsed": len(duplicate_rows),
        "final_batch_products": len(products),
        "existing_active_products": len(active),
        "existing_products_replaced": len(replaced_products),
        "existing_slugs_deactivated": stale_match_slugs,
        "replacement_matches": matched_rows,
        "batch_duplicate_rows": [{"slug": row["slug"], "title": row["title"]} for row in duplicate_rows],
        "additional_drop_photos_attached": extra_assets,
        "unmatched_drop_photo_count": len(unmatched_photos),
        "unmatched_drop_photos": unmatched_photos,
        "upload_image_count": len(manifest),
        "merged_storefront_count": len(merged),
        "files": {"catalog": str(CATALOG), "final_csv": str(final_csv), "mapping": str(mapping_path), "manifest": str(manifest_path)},
    }
    report_path = OUT / "product-batch-import-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"report": report, "base_url": base_url, "service_key": service_key, "final_csv": final_csv, "mapping": mapping_path, "manifest": manifest_path}, manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Upload media, upsert the final catalog, and deactivate replaced rows in Supabase.")
    args = parser.parse_args()
    prepared, manifest = build(args)
    report = prepared["report"]
    if args.apply:
        base_url, key = prepared["base_url"], prepared["service_key"]
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(upload_image, base_url, key, item["source_path"], item["storage_key"]) for item in manifest]
            results = [future.result() for future in as_completed(futures)]
        failed = [item for item in results if not item["uploaded"]]
        if failed:
            raise RuntimeError(f"Image upload failed for {len(failed)} of {len(results)} images; see the raised output for details.")
        sync_command = [
            sys.executable, "scripts/sync_supabase_catalog.py", str(prepared["final_csv"]),
            "--mapping", str(prepared["mapping"]), "--expected-count", str(report["final_batch_products"]), "--apply",
            "--report", str(OUT / "product-batch-supabase-sync-report.json"),
        ]
        subprocess.run(sync_command, check=True)
        old_ids = [row["old_id"] for row in report["replacement_matches"]]
        for old_id in old_ids:
            url = f"{base_url.rstrip('/')}/rest/v1/products?id=eq.{urllib.parse.quote(old_id, safe='')}"
            body = json.dumps({"is_active": False, "is_available": False}).encode("utf-8")
            request = urllib.request.Request(url, data=body, method="PATCH", headers={
                "apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "return=minimal",
            })
            with urllib.request.urlopen(request, timeout=45):
                pass
        report["uploaded_images"] = len(results)
        report["deactivated_existing_rows"] = len(old_ids)
        (OUT / "product-batch-import-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in {"replacement_matches", "batch_duplicate_rows", "additional_drop_photos_attached"}}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, urllib.error.URLError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
