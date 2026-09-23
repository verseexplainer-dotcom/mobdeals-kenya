#!/usr/bin/env python3
"""Generate the storefront catalog from the product-drop CSV and images."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from generate_product_catalog_template import CATEGORY_MAP, build_rows


DEFAULT_SOURCE = Path("product drop/products_for_supabase.csv")
DEFAULT_IMAGE_ROOT = Path("product drop")
DEFAULT_OUTPUT = Path("src/data/products.ts")
DEFAULT_REPORT = Path("output/logs/product-drop-import-report.json")
DEFAULT_MAPPING = Path("output/logs/product-drop-image-mapping.csv")
DEFAULT_MANIFEST = Path("output/logs/product-drop-upload-manifest.json")
DEFAULT_ADDITIONAL_IMAGES = Path("scripts/additional-product-images.json")

REQUIRED_COLUMNS = {
    "title",
    "slug",
    "category",
    "brand",
    "price_kes",
    "compare_at_price",
    "short_specs",
    "short_description",
    "description_html",
    "meta_title",
    "meta_description",
    "condition",
    "warranty",
    "stock_status",
    "sku",
    "is_available",
    "product_schema_json",
}

SOURCE_CATEGORY_FOLDERS = {
    "desktop": "desktop",
    "laptop": "laptop",
    "monitor": "monitor",
    "printer": "printer",
    "projector": "projector",
    "smartphone": "smartphone",
    "software": "software_box",
    "tablet": "tablet",
    "ups": "ups",
}

CATEGORY_DEFINITIONS = {
    "laptops": {
        "label": "Laptops",
        "eyebrow": "Work, study, and creator machines",
        "description": "Current HP, Dell, Lenovo, Microsoft, and Apple laptops with sheet-backed prices, specifications, condition, and warranty details.",
        "seoTitle": "Laptops in Nairobi",
        "seoDescription": "Shop current MobDeals laptops in Nairobi with visible prices, specifications, condition, warranty, and delivery support across Kenya.",
    },
    "tablets": {
        "label": "Tablets",
        "eyebrow": "Portable touch devices",
        "description": "Portable tablets and detachable devices for mobile work, study, browsing, and communication.",
        "seoTitle": "Tablets in Nairobi",
        "seoDescription": "Browse MobDeals tablets in Nairobi with current prices, specifications, warranty details, and Kenya delivery support.",
    },
    "monitors": {
        "label": "Monitors",
        "eyebrow": "Display upgrades",
        "description": "Current monitor options for office desks, home workstations, and display replacement needs.",
        "seoTitle": "Computer Monitors in Nairobi",
        "seoDescription": "Browse MobDeals computer monitors in Nairobi with current prices and delivery support across Kenya.",
    },
    "printers": {
        "label": "Printers",
        "eyebrow": "Office and home printing",
        "description": "Current Epson, HP, and Kyocera printers for home, school, office, and production workflows.",
        "seoTitle": "Printers in Nairobi",
        "seoDescription": "Shop current MobDeals printers in Nairobi with prices, specifications, warranty details, and Kenya delivery support.",
    },
    "projectors": {
        "label": "Projectors",
        "eyebrow": "Presentation displays",
        "description": "Projectors for classrooms, offices, events, and presentation setups with source-sheet specifications.",
        "seoTitle": "Projectors in Nairobi",
        "seoDescription": "Shop MobDeals projectors in Nairobi with current prices, verified specifications, and delivery support across Kenya.",
    },
    "software": {
        "label": "Software",
        "eyebrow": "Security and productivity",
        "description": "Current software licences and security products with device coverage and warranty details.",
        "seoTitle": "Software Licences in Nairobi",
        "seoDescription": "Shop software licences from MobDeals in Nairobi with current prices and support across Kenya.",
    },
    "ups": {
        "label": "UPS & Power",
        "eyebrow": "Backup power and connectivity",
        "description": "UPS, backup power, and related connectivity products from the current MobDeals catalog.",
        "seoTitle": "UPS and Backup Power in Nairobi",
        "seoDescription": "Shop UPS and backup power products from MobDeals in Nairobi with current prices and Kenya delivery support.",
    },
}

CATEGORY_ORDER = ["laptops", "tablets", "monitors", "printers", "projectors", "software", "ups"]

IMAGE_GROUP_OVERRIDES = {
    "lenovo-t470s-6th-gen": "laptop/lenovo_t470_laptop.webp",
}

MATCH_STOPWORDS = {
    "available",
    "box",
    "brand",
    "camera",
    "charger",
    "complete",
    "computer",
    "condition",
    "core",
    "desktop",
    "desktops",
    "display",
    "ex",
    "gen",
    "generation",
    "graphics",
    "hdd",
    "home",
    "inch",
    "inches",
    "installed",
    "laptop",
    "laptops",
    "monitor",
    "monitors",
    "mouse",
    "new",
    "notebook",
    "nvme",
    "office",
    "phone",
    "phones",
    "plus",
    "printer",
    "printers",
    "professional",
    "projector",
    "projectors",
    "ram",
    "refurbished",
    "screen",
    "smartphone",
    "smartphones",
    "software",
    "ssd",
    "storage",
    "tablet",
    "tablets",
    "touch",
    "touchscreen",
    "type",
    "uk",
    "ultra",
    "ups",
    "usb",
    "used",
    "wi",
    "wifi",
    "windows",
    "win",
}

BRAND_TOKENS = {
    "acer",
    "apple",
    "asus",
    "canon",
    "cursor",
    "dell",
    "epson",
    "hp",
    "huawei",
    "infinix",
    "kaspersky",
    "kyocera",
    "lenovo",
    "lightwave",
    "mecer",
    "mercury",
    "microsoft",
    "msi",
    "onn",
    "phomemo",
    "samsung",
    "starlink",
    "tecno",
    "unomat",
}


@dataclass(frozen=True)
class ImageGroup:
    folder: str
    category: str
    slug: str
    name: str
    source_paths: tuple[str, ...]
    storage_keys: tuple[str, ...]

    @property
    def primary_source_path(self) -> str:
        return self.source_paths[0]


@dataclass(frozen=True)
class MatchProfile:
    tokens: frozenset[str]
    compact: str


@dataclass(frozen=True)
class ProductImageMatch:
    product_slug: str
    source_category: str
    group: ImageGroup
    score: float
    gap: float
    status: str


def ascii_text(value: object) -> str:
    text = "" if value is None else str(value)
    replacements = {
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return re.sub(r"\s+", " ", text).strip()


def parse_integer(value: object, field: str, row_number: int) -> int:
    normalized = re.sub(r"[^\d]", "", ascii_text(value))
    if not normalized:
        raise ValueError(f"Row {row_number}: {field} must be a positive integer")
    parsed = int(normalized)
    if parsed <= 0:
        raise ValueError(f"Row {row_number}: {field} must be greater than zero")
    return parsed


def parse_boolean(value: object) -> bool:
    return ascii_text(value).casefold() in {"1", "true", "yes", "in_stock", "in stock"}


def normalize_condition(value: object) -> str:
    normalized = ascii_text(value).casefold()
    if normalized == "brand new":
        return "New"
    if normalized in {"used / refurbished", "used", "refurbished", "ex-uk", "ex uk"}:
        return "Refurbished"
    if normalized in {"pre-owned", "pre owned"}:
        return "Pre-owned"
    if normalized in {"open box", "open-box"}:
        return "Open box"
    raise ValueError(f"Unsupported product condition: {value}")


def validate_description_html(value: str, row_number: int) -> None:
    unsafe_patterns = [
        r"<\s*(?:script|iframe|object|embed)\b",
        r"\son[a-z]+\s*=",
        r"javascript\s*:",
    ]
    if any(re.search(pattern, value, flags=re.I) for pattern in unsafe_patterns):
        raise ValueError(f"Row {row_number}: description_html contains unsafe markup")


def read_catalog_rows(source: Path, expected_count: int | None = None) -> list[dict[str, str]]:
    with source.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = set(reader.fieldnames or [])
        missing_columns = sorted(REQUIRED_COLUMNS - headers)
        if missing_columns:
            raise ValueError(f"CSV is missing required columns: {', '.join(missing_columns)}")
        rows = list(reader)

    if expected_count is not None and len(rows) != expected_count:
        raise ValueError(f"Expected {expected_count} product rows, found {len(rows)}")

    errors: list[str] = []
    slugs: list[str] = []
    skus: list[str] = []
    for row_number, row in enumerate(rows, start=2):
        slug = ascii_text(row.get("slug"))
        sku = ascii_text(row.get("sku"))
        title = ascii_text(row.get("title"))
        source_category = ascii_text(row.get("category")).casefold()
        if not slug or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            errors.append(f"Row {row_number}: invalid slug '{slug}'")
        if not sku:
            errors.append(f"Row {row_number}: sku is required")
        if not title:
            errors.append(f"Row {row_number}: title is required")
        if source_category not in SOURCE_CATEGORY_FOLDERS:
            errors.append(f"Row {row_number}: unsupported category '{source_category}'")
        try:
            parse_integer(row.get("price_kes"), "price_kes", row_number)
            json.loads(row.get("product_schema_json", ""))
            validate_description_html(row.get("description_html", ""), row_number)
            normalize_condition(row.get("condition"))
        except (json.JSONDecodeError, ValueError) as error:
            errors.append(f"Row {row_number}: {error}")
        slugs.append(slug)
        skus.append(sku)

    duplicate_slugs = sorted(slug for slug, count in Counter(slugs).items() if count > 1)
    duplicate_skus = sorted(sku for sku, count in Counter(skus).items() if count > 1)
    if duplicate_slugs:
        errors.append(f"Duplicate slugs: {', '.join(duplicate_slugs)}")
    if duplicate_skus:
        errors.append(f"Duplicate SKUs: {', '.join(duplicate_skus)}")
    if errors:
        raise ValueError("Product CSV validation failed:\n- " + "\n- ".join(errors))
    return rows


def load_image_groups(image_root: Path) -> list[ImageGroup]:
    rows, _ = build_rows(image_root)
    groups: list[ImageGroup] = []
    for row in rows:
        source_paths = [row["primary_source_image"]]
        source_paths.extend(path for path in row["source_gallery_images"].split(" | ") if path)
        storage_keys = [path for path in row["target_storage_keys"].split(" | ") if path]
        if len(source_paths) != len(storage_keys):
            raise ValueError(f"Image group has mismatched source and target counts: {row['product_slug']}")
        groups.append(
            ImageGroup(
                folder=source_paths[0].split("/", 1)[0],
                category=row["category"],
                slug=row["product_slug"],
                name=row["product_name"],
                source_paths=tuple(source_paths),
                storage_keys=tuple(storage_keys),
            )
        )
    return groups


def match_tokens(value: str) -> list[str]:
    tokens = re.findall(r"[a-z]+\d+[a-z0-9]*|\d+[a-z]+[a-z0-9]*|[a-z]+|\d+", value.casefold())
    return [
        token
        for token in tokens
        if token not in MATCH_STOPWORDS
        and token not in {"i3", "i5", "i7", "i9", "ryzen", "rtx", "gtx"}
        and not re.fullmatch(r"\d+(?:gb|tb)", token)
    ]


def match_profile(value: str) -> MatchProfile:
    tokens = match_tokens(value)
    return MatchProfile(tokens=frozenset(tokens), compact="-".join(tokens))


def token_weight(token: str) -> float:
    if re.search(r"[a-z]", token) and re.search(r"\d", token):
        return 8.0
    if token.isdigit():
        return 4.0 if len(token) >= 3 else 1.5
    if token in BRAND_TOKENS:
        return 1.0
    return 2.5


def match_score(product: MatchProfile, image: MatchProfile) -> float:
    intersection = product.tokens & image.tokens
    intersection_weight = sum(token_weight(token) for token in intersection)
    image_weight = sum(token_weight(token) for token in image.tokens) or 1.0
    union_weight = sum(token_weight(token) for token in product.tokens | image.tokens) or 1.0
    containment = intersection_weight / image_weight
    jaccard = intersection_weight / union_weight
    sequence = SequenceMatcher(None, product.compact, image.compact).ratio()
    return 0.6 * containment + 0.25 * jaccard + 0.15 * sequence


def rank_groups(title: str, groups: list[ImageGroup], profiles: dict[str, MatchProfile]) -> list[tuple[float, ImageGroup]]:
    product_profile = match_profile(title)
    ranked = [(match_score(product_profile, profiles[group.primary_source_path]), group) for group in groups]
    return sorted(ranked, key=lambda item: (-item[0], item[1].primary_source_path.casefold()))


def map_product_images(rows: list[dict[str, str]], groups: list[ImageGroup]) -> list[ProductImageMatch]:
    groups_by_folder: dict[str, list[ImageGroup]] = defaultdict(list)
    groups_by_primary = {group.primary_source_path: group for group in groups}
    profiles = {group.primary_source_path: match_profile(group.name) for group in groups}
    for group in groups:
        groups_by_folder[group.folder].append(group)

    matches: list[ProductImageMatch] = []
    errors: list[str] = []
    for row in rows:
        product_slug = ascii_text(row["slug"])
        source_category = ascii_text(row["category"]).casefold()
        override_path = IMAGE_GROUP_OVERRIDES.get(product_slug)
        if override_path:
            override_group = groups_by_primary.get(override_path)
            if not override_group:
                errors.append(f"{product_slug}: override image group not found: {override_path}")
                continue
            matches.append(
                ProductImageMatch(
                    product_slug=product_slug,
                    source_category=source_category,
                    group=override_group,
                    score=1.0,
                    gap=1.0,
                    status="approximate-override",
                )
            )
            continue

        expected_folder = SOURCE_CATEGORY_FOLDERS[source_category]
        ranked = rank_groups(row["title"], groups_by_folder[expected_folder], profiles)
        if not ranked:
            errors.append(f"{product_slug}: no image groups found for category '{source_category}'")
            continue

        if ranked[0][0] < 0.7:
            global_ranked = rank_groups(row["title"], groups, profiles)
            if global_ranked[0][0] > ranked[0][0]:
                ranked = global_ranked

        score, group = ranked[0]
        gap = score - ranked[1][0] if len(ranked) > 1 else score
        if score < 0.7:
            errors.append(f"{product_slug}: no reliable image match (best {group.primary_source_path}, score {score:.3f})")
            continue
        status = "cross-category" if group.folder != expected_folder else "matched"
        matches.append(ProductImageMatch(product_slug, source_category, group, score, gap, status))

    if errors:
        raise ValueError("Product image mapping failed:\n- " + "\n- ".join(errors))
    return matches


def spec_label(value: str) -> str:
    lowered = value.casefold()
    if re.search(r"\b(?:intel|core|ryzen|celeron|pentium|snapdragon)\b", lowered):
        return "Processor"
    if "ram" in lowered:
        return "Memory"
    if re.search(r"\b(?:ssd|hdd|nvme|storage)\b", lowered):
        return "Storage"
    if re.search(r"\b(?:rtx|gtx|radeon|graphics|gpu)\b", lowered):
        return "Graphics"
    if re.search(r"\b(?:display|screen|inch|hz)\b", lowered):
        return "Display"
    if re.search(r"\b\d+(?:st|nd|rd|th)\s+gen\b", lowered):
        return "Generation"
    return "Feature"


def product_specs(row: dict[str, str]) -> list[dict[str, str]]:
    values = [ascii_text(value) for value in row.get("short_specs", "").split(";") if ascii_text(value)]
    specs = [{"label": spec_label(value), "value": value} for value in values]
    specs.append({"label": "Condition", "value": ascii_text(row["condition"])})
    specs.append({"label": "Warranty", "value": ascii_text(row["warranty"])})
    return specs


def product_highlights(row: dict[str, str]) -> list[str]:
    highlights = [ascii_text(value) for value in row.get("short_specs", "").split(";") if ascii_text(value)]
    highlights.append(ascii_text(row["warranty"]))
    highlights.append("Confirm current stock and delivery timing before payment")
    return highlights[:6]


def load_additional_images(path: Path, rows: list[dict[str, str]], image_root: Path) -> dict[str, dict[str, str]]:
    entries = json.loads(path.read_text(encoding="utf-8")) if path.exists() else []
    if not isinstance(entries, list):
        raise ValueError(f"Additional image mapping must be a list: {path}")
    product_slugs = {ascii_text(row["slug"]) for row in rows}
    additional: dict[str, dict[str, str]] = {}
    storage_keys: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Additional image entries must be objects")
        slug = entry.get("product_slug")
        source_path = entry.get("source_path")
        storage_key = entry.get("storage_key")
        if not all(isinstance(value, str) for value in (slug, source_path, storage_key)):
            raise ValueError("Additional image entries need product_slug, source_path, and storage_key")
        if slug not in product_slugs or slug in additional or storage_key in storage_keys:
            raise ValueError(f"Unknown or duplicate additional image mapping: {slug}")
        if not source_path.startswith("optimized_v2/") or not source_path.endswith(".webp"):
            raise ValueError(f"Unexpected additional image source: {source_path}")
        if storage_key != f"laptop/additional/{slug}/02.webp":
            raise ValueError(f"Unexpected additional image storage key: {storage_key}")
        if not (image_root / source_path).is_file():
            raise ValueError(f"Additional image does not exist: {image_root / source_path}")
        additional[slug] = {"source_path": source_path, "storage_key": storage_key}
        storage_keys.add(storage_key)
    return additional


def build_products(rows: list[dict[str, str]], matches: list[ProductImageMatch], additional_images: dict[str, dict[str, str]] | None = None) -> tuple[list[dict[str, Any]], Counter[str]]:
    matches_by_slug = {match.product_slug: match for match in matches}
    products: list[dict[str, Any]] = []
    category_counts: Counter[str] = Counter()
    featured_categories: set[str] = set()

    for index, row in enumerate(rows):
        slug = ascii_text(row["slug"])
        match = matches_by_slug[slug]
        category = match.group.category
        category_counts[category] += 1
        price = parse_integer(row["price_kes"], "price_kes", index + 2)
        compare_at = parse_integer(row["compare_at_price"], "compare_at_price", index + 2)
        price_data: dict[str, Any] = {"amount": price, "currency": "KES"}
        if compare_at > price:
            price_data["compareAtAmount"] = compare_at
        title = ascii_text(row["title"])
        # A related model is not an exact product photo. Keep the mapping in the
        # audit report, but let presentation use a labelled category fallback.
        images = [] if match.status == "approximate-override" else [
            {
                "src": "",
                "storageKey": storage_key,
                "alt": title if image_index == 1 else f"{title} - image {image_index}",
            }
            for image_index, storage_key in enumerate(match.group.storage_keys, start=1)
        ]
        if slug in (additional_images or {}):
            if len(images) != 1:
                raise ValueError(f"Additional image requires exactly one existing image: {slug}")
            images.append({"src": "", "storageKey": additional_images[slug]["storage_key"], "alt": f"{title} - image 2"})
        in_stock = parse_boolean(row["is_available"]) and ascii_text(row["stock_status"]).casefold() == "in stock"
        product: dict[str, Any] = {
            "id": ascii_text(row["sku"]),
            "slug": slug,
            "name": title,
            "brand": ascii_text(row["brand"]),
            "category": category,
            "price": price_data,
            "images": images,
            "inStock": in_stock,
            "description": ascii_text(row["short_description"]),
            "descriptionHtml": row["description_html"].strip(),
            "highlights": product_highlights(row),
            "specs": product_specs(row),
            "condition": normalize_condition(row["condition"]),
            "warranty": ascii_text(row["warranty"]),
            "availabilityNote": "In stock. Confirm current availability and delivery timing before payment."
            if in_stock
            else "Confirm availability and delivery timing before payment.",
            "seoTitle": ascii_text(row["meta_title"]),
            "seoDescription": ascii_text(row["meta_description"]),
            "sourceJsonLd": json.loads(row["product_schema_json"]),
        }
        if index < 4 or category not in featured_categories:
            product["featured"] = True
            featured_categories.add(category)
        products.append(product)

    return products, category_counts


def categories_for_counts(category_counts: Counter[str]) -> list[dict[str, str]]:
    categories: list[dict[str, str]] = []
    for slug in CATEGORY_ORDER:
        if category_counts.get(slug, 0) == 0:
            continue
        categories.append({"slug": slug, **CATEGORY_DEFINITIONS[slug]})
    return categories


def ts_literal(value: object, indent: int = 0) -> str:
    return json.dumps(value, ensure_ascii=True, indent=2).replace("\n", "\n" + " " * indent)


def render_products_ts(categories: list[dict[str, str]], products: list[dict[str, Any]], source: Path) -> str:
    return "\n".join(
        [
            "import type { Product, ProductCategory } from '@lib/products';",
            "import { supabaseStorageImage } from '@lib/utils';",
            "",
            f"// Generated from {source.name} and product drop images. Re-run scripts/import_mobdeals_products.py after source updates.",
            f"export const productCategories: ProductCategory[] = {ts_literal(categories)};",
            "",
            f"const catalogProducts: Product[] = {ts_literal(products)};",
            "",
            "export const products: Product[] = catalogProducts.map((product) => ({",
            "  ...product,",
            "  images: product.images.map((image) => ({",
            "    ...image,",
            "    src: image.storageKey ? supabaseStorageImage(image.storageKey) : image.src",
            "  }))",
            "}));",
            "",
            "export function getAllProducts(): Product[] {",
            "  return products;",
            "}",
            "",
            "export function getFeaturedProducts(): Product[] {",
            "  return products.filter((product) => product.featured);",
            "}",
            "",
            "export function getProductBySlug(slug: string): Product | undefined {",
            "  return products.find((product) => product.slug === slug);",
            "}",
            "",
            "export function getCategoryBySlug(slug: string): ProductCategory | undefined {",
            "  return productCategories.find((category) => category.slug === slug);",
            "}",
            "",
            "export function getProductsByCategory(categorySlug: string): Product[] {",
            "  return products.filter((product) => product.category === categorySlug);",
            "}",
            "",
            "export function getRelatedProducts(product: Product, limit = 4): Product[] {",
            "  const explicitRelated = product.relatedProductSlugs",
            "    ?.map((slug) => getProductBySlug(slug))",
            "    .filter((relatedProduct): relatedProduct is Product => Boolean(relatedProduct)) ?? [];",
            "  const categoryFallback = products.filter(",
            "    (candidate) =>",
            "      candidate.slug !== product.slug &&",
            "      candidate.category === product.category &&",
            "      !explicitRelated.some((relatedProduct) => relatedProduct.slug === candidate.slug)",
            "  );",
            "  const broaderFallback = products.filter(",
            "    (candidate) =>",
            "      candidate.slug !== product.slug &&",
            "      candidate.category !== product.category &&",
            "      !explicitRelated.some((relatedProduct) => relatedProduct.slug === candidate.slug)",
            "  );",
            "",
            "  return [...explicitRelated, ...categoryFallback, ...broaderFallback].slice(0, limit);",
            "}",
            "",
        ]
    )


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_mapping(path: Path, rows: list[dict[str, str]], matches: list[ProductImageMatch], additional_images: dict[str, dict[str, str]] | None = None) -> None:
    rows_by_slug = {ascii_text(row["slug"]): row for row in rows}
    fieldnames = [
        "product_slug",
        "product_title",
        "source_category",
        "catalog_category",
        "mapping_status",
        "match_score",
        "score_gap",
        "image_group",
        "source_images",
        "storage_keys",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for match in matches:
            row = rows_by_slug[match.product_slug]
            extra = (additional_images or {}).get(match.product_slug)
            source_paths = list(match.group.source_paths) + ([extra["source_path"]] if extra else [])
            storage_keys = list(match.group.storage_keys) + ([extra["storage_key"]] if extra else [])
            writer.writerow(
                {
                    "product_slug": match.product_slug,
                    "product_title": ascii_text(row["title"]),
                    "source_category": match.source_category,
                    "catalog_category": match.group.category,
                    "mapping_status": match.status,
                    "match_score": f"{match.score:.3f}",
                    "score_gap": f"{match.gap:.3f}",
                    "image_group": match.group.slug,
                    "source_images": " | ".join(source_paths),
                    "storage_keys": " | ".join(storage_keys),
                }
            )


def build_manifest(matches: list[ProductImageMatch], image_root: Path, additional_images: dict[str, dict[str, str]] | None = None) -> list[dict[str, Any]]:
    products_by_group: dict[str, list[str]] = defaultdict(list)
    selected_groups: dict[str, ImageGroup] = {}
    for match in matches:
        primary = match.group.primary_source_path
        selected_groups[primary] = match.group
        products_by_group[primary].append(match.product_slug)

    manifest: list[dict[str, Any]] = []
    for primary in sorted(selected_groups):
        group = selected_groups[primary]
        for source_path, storage_key in zip(group.source_paths, group.storage_keys):
            source_file = image_root / source_path
            manifest.append(
                {
                    "source_path": source_path,
                    "storage_key": storage_key,
                    "size_bytes": source_file.stat().st_size,
                    "product_slugs": sorted(products_by_group[primary]),
                }
            )
    for slug, extra in sorted((additional_images or {}).items()):
        manifest.append({
            "source_path": extra["source_path"],
            "storage_key": extra["storage_key"],
            "size_bytes": (image_root / extra["source_path"]).stat().st_size,
            "product_slugs": [slug],
        })
    return manifest


def build_report(
    source: Path,
    image_root: Path,
    rows: list[dict[str, str]],
    groups: list[ImageGroup],
    matches: list[ProductImageMatch],
    category_counts: Counter[str],
    manifest: list[dict[str, Any]],
) -> dict[str, Any]:
    selected_primary_paths = {match.group.primary_source_path for match in matches}
    selected_assets = {item["source_path"] for item in manifest}
    all_assets = {path for group in groups for path in group.source_paths}
    corrections = [
        {
            "product_slug": match.product_slug,
            "source_category": match.source_category,
            "catalog_category": match.group.category,
            "image_group": match.group.slug,
        }
        for match in matches
        if CATEGORY_MAP[SOURCE_CATEGORY_FOLDERS[match.source_category]] != match.group.category
    ]
    return {
        "source": str(source),
        "image_root": str(image_root),
        "product_count": len(rows),
        "mapped_product_count": len(matches),
        "catalog_categories": dict(category_counts),
        "available_image_group_count": len(groups),
        "selected_image_group_count": len(selected_primary_paths),
        "unused_image_group_count": len(groups) - len(selected_primary_paths),
        "available_image_count": len(all_assets),
        "selected_image_count": len(selected_assets),
        "unused_image_count": len(all_assets - selected_assets),
        "storage_upload_bytes": sum(item["size_bytes"] for item in manifest),
        "category_corrections": corrections,
        "approximate_mappings": [
            {
                "product_slug": match.product_slug,
                "image_group": match.group.slug,
                "source_images": list(match.group.source_paths),
            }
            for match in matches
            if match.status == "approximate-override"
        ],
        "low_gap_mappings": [
            {
                "product_slug": match.product_slug,
                "score": round(match.score, 3),
                "gap": round(match.gap, 3),
                "image_group": match.group.slug,
            }
            for match in matches
            if match.status == "matched" and match.gap < 0.05
        ],
    }


def import_catalog(
    source: Path,
    image_root: Path,
    output: Path,
    report_path: Path,
    mapping_path: Path,
    manifest_path: Path,
    expected_count: int | None,
) -> dict[str, Any]:
    rows = read_catalog_rows(source, expected_count)
    groups = load_image_groups(image_root)
    matches = map_product_images(rows, groups)
    additional_images = load_additional_images(DEFAULT_ADDITIONAL_IMAGES, rows, image_root)
    products, category_counts = build_products(rows, matches, additional_images)
    categories = categories_for_counts(category_counts)
    manifest = build_manifest(matches, image_root, additional_images)
    report = build_report(source, image_root, rows, groups, matches, category_counts, manifest)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_products_ts(categories, products, source), encoding="utf-8")
    write_mapping(mapping_path, rows, matches, additional_images)
    write_json(manifest_path, manifest)
    write_json(report_path, report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, nargs="?", default=DEFAULT_SOURCE)
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGE_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--mapping", type=Path, default=DEFAULT_MAPPING)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--expected-count", type=int, default=241)
    args = parser.parse_args()

    report = import_catalog(
        source=args.source,
        image_root=args.images,
        output=args.output,
        report_path=args.report,
        mapping_path=args.mapping,
        manifest_path=args.manifest,
        expected_count=args.expected_count,
    )
    print(f"Imported {report['product_count']} products")
    for category, count in report["catalog_categories"].items():
        print(f"- {category}: {count}")
    print(f"Selected {report['selected_image_count']} images from {report['selected_image_group_count']} groups")
    print(f"Mapping report: {args.mapping}")
    print(f"Upload manifest: {args.manifest}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
