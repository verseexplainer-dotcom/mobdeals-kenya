#!/usr/bin/env python3
"""Generate the MobDeals static product catalog from the SEO workbook.

The workbook was exported without shared strings and this repo does not depend on
openpyxl, so the parser reads the small XLSX XML structure directly.
"""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


SHEET_NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
IMAGE_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png"}
TOKEN_STOPWORDS = {
    "and",
    "at",
    "available",
    "brand",
    "ci3",
    "ci5",
    "ci7",
    "ci9",
    "core",
    "desktop",
    "desktops",
    "display",
    "ex",
    "gb",
    "hdd",
    "in",
    "inch",
    "inches",
    "intel",
    "ksh",
    "laptop",
    "laptops",
    "monitor",
    "monitors",
    "new",
    "pc",
    "printer",
    "printers",
    "pro",
    "projector",
    "ram",
    "refurbished",
    "series",
    "simple",
    "ssd",
    "the",
    "touch",
    "touchscreen",
    "with",
}

CATEGORY_DEFINITIONS = {
    "laptops": {
        "label": "Laptops",
        "eyebrow": "Work, study, and creator machines",
        "description": "HP, Dell, Lenovo, Microsoft, and Apple laptops listed with condition, price, processor, memory, and storage details from the current MobDeals sheet.",
        "seoTitle": "Laptops in Nairobi",
        "seoDescription": "Shop current MobDeals laptop listings in Nairobi with visible price, condition, processor, RAM, storage, and Kenya delivery support.",
    },
    "desktops": {
        "label": "Desktops",
        "eyebrow": "Office PCs and workstations",
        "description": "All-in-one PCs, ProDesk, EliteDesk, OptiPlex, ThinkCentre, and workstation options for office and business setups.",
        "seoTitle": "Desktop Computers in Nairobi",
        "seoDescription": "Compare MobDeals desktop computer listings in Nairobi, including office PCs, all-in-ones, mini PCs, and workstations.",
    },
    "printers": {
        "label": "Printers",
        "eyebrow": "Office and home printing",
        "description": "HP, Epson, and Kyocera printer listings with source-sheet prices and availability-focused buying notes.",
        "seoTitle": "Printers in Nairobi",
        "seoDescription": "Shop current MobDeals printer listings in Nairobi with prices, condition notes, and delivery support across Kenya.",
    },
    "monitors": {
        "label": "Monitors",
        "eyebrow": "Display upgrades",
        "description": "HP and Dell monitor listings for office desks, home workstations, and display replacement needs.",
        "seoTitle": "Computer Monitors in Nairobi",
        "seoDescription": "Browse MobDeals monitor listings in Nairobi with visible price, size cues, condition notes, and Kenya delivery support.",
    },
    "storage": {
        "label": "Storage",
        "eyebrow": "External drives and upgrades",
        "description": "External hard drive and storage listings for backups, transfers, and expanded workspace capacity.",
        "seoTitle": "Computer Storage in Nairobi",
        "seoDescription": "Shop MobDeals storage listings in Nairobi, including external hard drives and storage upgrade options.",
    },
    "smartphones": {
        "label": "Smartphones",
        "eyebrow": "Mobile devices",
        "description": "Samsung and Apple phone listings with source-sheet condition, price, and availability details.",
        "seoTitle": "Smartphones in Nairobi",
        "seoDescription": "Browse current MobDeals smartphone listings in Nairobi with price, condition, and delivery support.",
    },
    "projectors": {
        "label": "Projectors",
        "eyebrow": "Presentation displays",
        "description": "Projector listings for classrooms, offices, events, and presentation setups.",
        "seoTitle": "Projectors in Nairobi",
        "seoDescription": "Shop MobDeals projector listings in Nairobi with price, condition, and Kenya delivery support.",
    },
    "internet": {
        "label": "Internet",
        "eyebrow": "Connectivity hardware",
        "description": "Internet hardware listings such as Starlink kits for buyers comparing connectivity options.",
        "seoTitle": "Internet Hardware in Nairobi",
        "seoDescription": "Browse MobDeals internet hardware listings in Nairobi with price, condition, and availability notes.",
    },
}

CATEGORY_ORDER = [
    "laptops",
    "desktops",
    "printers",
    "monitors",
    "storage",
    "smartphones",
    "projectors",
    "internet",
]


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


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref or "")
    if not match:
        return 0

    index = 0
    for character in match.group(1):
        index = index * 26 + ord(character) - 64
    return index - 1


def cell_value(cell: ET.Element) -> str:
    if cell.attrib.get("t") == "inlineStr":
        return ascii_text("".join(node.text or "" for node in cell.findall(".//a:t", SHEET_NS)))

    value = cell.find("a:v", SHEET_NS)
    return ascii_text(value.text if value is not None else "")


def read_product_rows(workbook_path: Path) -> list[dict[str, str]]:
    with ZipFile(workbook_path) as archive:
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows: list[list[str]] = []
    for row in root.findall(".//a:sheetData/a:row", SHEET_NS):
        values: list[str] = []
        for cell in row.findall("a:c", SHEET_NS):
            index = column_index(cell.attrib.get("r", ""))
            while len(values) <= index:
                values.append("")
            values[index] = cell_value(cell)
        rows.append(values)

    headers = rows[0]
    records: list[dict[str, str]] = []
    for row in rows[1:]:
        padded = row + [""] * (len(headers) - len(row))
        records.append(dict(zip(headers, padded)))
    return records


def slugify(value: str) -> str:
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-")


def image_tokens(value: str) -> set[str]:
    cleaned = value.lower().replace("ex-uk", "ex uk").replace("_", " ").replace("-", " ")
    tokens = set(re.findall(r"[a-z]+\d*[a-z]*|\d+[a-z]*", cleaned))
    filtered: set[str] = set()
    for token in tokens:
        if len(token) <= 1 or token in TOKEN_STOPWORDS:
            continue
        if re.fullmatch(r"i[3579]", token):
            continue
        if re.fullmatch(r"\d+(?:gb|tb|gbhdd|tbhdd|tbssd)", token):
            continue
        if re.fullmatch(r"\d+(?:st|nd|rd|th)?gen", token):
            continue
        if re.fullmatch(r"\d+", token) and int(token) in {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 23, 24, 27, 32, 64, 128, 256, 320, 400, 500, 512}:
            continue
        filtered.add(token)
    return filtered


def build_image_index(images_dir: Path) -> tuple[list[dict[str, object]], dict[str, str]]:
    images: list[dict[str, object]] = []
    fallback_by_category = {
        "laptops": "hp_elitebook_840_g11_laptop.webp",
        "desktops": "hp-prodesk-i5-8500-8th-gen-desktop-computer-3.2-8gb-ddr4-ram-500gb-hdd-solid-state-windows-11-professional-home-or-office-pc.webp",
        "printers": "epson_l3210_printer.webp",
        "monitors": "hp_monitor_m27fw_monitor.webp",
        "storage": "starlink_mini_available_ups.webp",
        "smartphones": "samsung-galaxy-note-20-5g-8gb-256gb-5g-and-dual-sim-refurbished.webp",
        "projectors": "epson_co_w01_portable_wxga_projector_projector.webp",
        "internet": "starlink_mini_available_ups.webp",
    }

    for path in sorted(images_dir.iterdir() if images_dir.exists() else []):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        images.append(
            {
                "name": path.name,
                "tokens": image_tokens(path.stem),
            }
        )

    existing = {image["name"] for image in images}
    fallback_by_category = {category: name for category, name in fallback_by_category.items() if name in existing}
    return images, fallback_by_category


def image_score(product_tokens: set[str], image: dict[str, object]) -> tuple[float, int, int]:
    image_token_set = image["tokens"]
    if not isinstance(image_token_set, set) or not product_tokens or not image_token_set:
        return (0.0, 0, 0)

    overlap = len(product_tokens & image_token_set)
    precision = overlap / len(product_tokens)
    recall = overlap / len(image_token_set)
    score = precision * 0.72 + recall * 0.28
    return (score, overlap, -len(image_token_set))


def best_local_image(name: str, brand: str, category: str, images: list[dict[str, object]], fallback_by_category: dict[str, str]) -> str:
    tokens = image_tokens(f"{brand} {name}")
    best = max(images, key=lambda image: image_score(tokens, image), default=None)
    if best:
        score, overlap, _ = image_score(tokens, best)
        if overlap >= 2 and score >= 0.58:
            return str(best["name"])

    brand_lower = brand.lower()
    category_terms = {
        "laptops": "laptop",
        "desktops": "desktop",
        "printers": "printer",
        "monitors": "monitor",
        "projectors": "projector",
        "smartphones": "samsung" if brand_lower == "samsung" else "phone",
        "internet": "starlink",
        "storage": "ups",
    }
    term = category_terms.get(category, "")
    brand_candidates = [
        image
        for image in images
        if brand_lower and brand_lower in str(image["name"]).lower() and (not term or term in str(image["name"]).lower())
    ]
    if brand_candidates:
        return str(brand_candidates[0]["name"])

    return fallback_by_category.get(category, fallback_by_category.get("laptops", ""))


def display_name(raw_name: str) -> str:
    name = ascii_text(raw_name)
    name = re.sub(r"\s+available\s*@?\s*(?:ksh?)?\s*[\d,]+", "", name, flags=re.I)
    name = re.sub(r"\s+@\s*(?:ksh?)?\s*[\d,]+", "", name, flags=re.I)
    name = re.sub(r"\s+at\s+[\d,]+$", "", name, flags=re.I)
    return name.strip(" ,.-")


def parse_price(record: dict[str, str], raw_name: str) -> int:
    price = re.sub(r"[^\d]", "", record.get("Price (KES)", ""))
    if price:
        return int(price)

    name_match = re.search(r"(?:@|at)\s*(?:ksh?)?\s*([\d,]+)", raw_name, flags=re.I)
    if name_match:
        return int(name_match.group(1).replace(",", ""))

    return 0


def infer_category(record: dict[str, str], name: str) -> str:
    source = record.get("Category", "").lower().strip()
    lowered = name.lower()

    if "starlink" in lowered or source == "internet":
        return "internet"
    if source in {"smartphone", "smartphones"} or any(term in lowered for term in ["iphone", "samsung note", "galaxy"]):
        return "smartphones"
    if source in {"storage disk", "storage"} or "external hard drive" in lowered or "external hdd" in lowered:
        return "storage"
    if "projector" in lowered:
        return "projectors"
    if (
        source == "monitor"
        or " monitor" in lowered
        or "inches monitor" in lowered
        or "inch simple" in lowered
        or "z23i" in lowered
        or "z24 g3" in lowered
        or "p2425h" in lowered
    ):
        return "monitors"
    if source == "printer" or any(term in lowered for term in ["printer", "laserjet", "officejet", "ecosys"]):
        return "printers"
    if source == "desktop" or any(
        term in lowered
        for term in [
            "prodesk",
            "elitedesk",
            "eliteone",
            "optiplex",
            "thinkcentre",
            "all-in-one",
            "all in one",
            "mini pc",
            "workstation",
            "desktop",
            "compaq 6200",
        ]
    ):
        return "desktops"

    return "laptops"


def normalize_condition(value: str) -> str:
    lowered = value.lower()
    if "brand" in lowered and "new" in lowered:
        return "New"
    if "open" in lowered:
        return "Open box"
    if "ex" in lowered or "uk" in lowered:
        return "Refurbished"
    return "Pre-owned"


def title_condition(value: str) -> str:
    return "Ex-UK" if value == "Refurbished" else value


def extract_storage(name: str) -> str:
    patterns = [
        r"(\d+(?:\.\d+)?)\s*(TB|GB)\s*(SSD|HDD|NVME|HARD DRIVE)",
        r"(\d+(?:\.\d+)?)(TB|GB)(SSD|HDD)",
    ]
    for pattern in patterns:
        match = re.search(pattern, name, flags=re.I)
        if match:
            amount, unit, kind = match.group(1), match.group(2).upper(), match.group(3).upper()
            kind = "Hard Drive" if kind == "HARD DRIVE" else kind
            return f"{amount}{unit} {kind}"
    external_match = re.search(r"(\d+(?:\.\d+)?)\s*(TB|GB)\s*external\s*(?:hard drive|hdd)", name, flags=re.I)
    if external_match:
        return f"{external_match.group(1)}{external_match.group(2).upper()} External HDD"
    return ""


def extract_ram(name: str) -> str:
    for match in re.finditer(r"(\d+)\s*GB(?!\s*(?:SSD|HDD|NVME|HARD|external))", name, flags=re.I):
        value = int(match.group(1))
        if 2 <= value <= 128:
            return f"{value}GB"
    return ""


def extract_processor(name: str) -> str:
    lowered = name.lower()
    if re.search(r"\b(?:core\s*)?i9\b|\bci9\b", lowered):
        return "Intel Core i9"
    if re.search(r"\b(?:core\s*)?i7\b|\bci7\b", lowered):
        return "Intel Core i7"
    if re.search(r"\b(?:core\s*)?i5\b|\bci5\b", lowered):
        return "Intel Core i5"
    if re.search(r"\b(?:core\s*)?i3\b|\bci3\b", lowered):
        return "Intel Core i3"
    ryzen = re.search(r"\bryzen\s*([3579])\b", lowered)
    if ryzen:
        return f"AMD Ryzen {ryzen.group(1)}"
    core = re.search(r"\bcore\s+([3579])\b", lowered)
    if core:
        return f"Intel Core {core.group(1)}"
    if "core m5" in lowered or re.search(r"\bm5\b", lowered):
        return "Intel Core m5"
    return ""


def extract_generation(record: dict[str, str], name: str) -> str:
    source = record.get("Generation", "")
    match = re.search(r"(\d+)(?:st|nd|rd|th)?\s*gen", source or name, flags=re.I)
    if match:
        return f"{match.group(1)}th Gen"
    return ascii_text(source)


def extract_display(name: str) -> str:
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:inch|inches)", name, flags=re.I)
    if match:
        return f"{match.group(1)} inch"
    if "qhd" in name.lower():
        return "QHD"
    return ""


def category_noun(category: str) -> str:
    return {
        "laptops": "laptop",
        "desktops": "desktop computer",
        "printers": "printer",
        "monitors": "monitor",
        "storage": "storage device",
        "smartphones": "smartphone",
        "projectors": "projector",
        "internet": "internet hardware",
    }.get(category, "product")


def category_title_noun(category: str) -> str:
    return {
        "laptops": "Laptop",
        "desktops": "Desktop Computer",
        "printers": "Printer",
        "monitors": "Monitor",
        "storage": "Storage Device",
        "smartphones": "Smartphone",
        "projectors": "Projector",
        "internet": "Internet Hardware",
    }.get(category, "Product")


def category_use_case(category: str) -> str:
    return {
        "laptops": "work, study, business use, and everyday productivity",
        "desktops": "office desks, reception setups, admin work, and business procurement",
        "printers": "home office, school, and business printing workflows",
        "monitors": "desk display upgrades and office workstation setups",
        "storage": "backup, file transfer, and storage expansion needs",
        "smartphones": "daily mobile use, calls, apps, and media",
        "projectors": "office, classroom, and presentation setups",
        "internet": "connectivity planning and internet hardware purchases",
    }.get(category, "general technology buying")


def spec_summary(facts: dict[str, str]) -> str:
    parts = []
    for key in ["processor", "ram", "storage", "generation", "display"]:
        if facts.get(key):
            parts.append(facts[key])
    return ", ".join(parts)


def build_specs(record: dict[str, str], name: str, category: str, condition: str, price: int) -> tuple[list[dict[str, str]], dict[str, str]]:
    facts = {
        "ram": extract_ram(name),
        "storage": extract_storage(name),
        "processor": extract_processor(name),
        "generation": extract_generation(record, name),
        "display": extract_display(name),
    }
    specs = [
        {"label": "Product", "value": name},
        {"label": "Brand", "value": ascii_text(record.get("Brand", ""))},
        {"label": "Category", "value": CATEGORY_DEFINITIONS[category]["label"]},
        {"label": "Condition", "value": title_condition(condition)},
        {"label": "Listed price", "value": f"KES {price:,}" if price else "Confirm current price"},
    ]
    if facts["processor"]:
        specs.append({"label": "Processor", "value": facts["processor"]})
    if facts["generation"]:
        specs.append({"label": "Generation", "value": facts["generation"]})
    if facts["ram"]:
        specs.append({"label": "Memory", "value": facts["ram"]})
    if facts["storage"]:
        specs.append({"label": "Storage", "value": facts["storage"]})
    if facts["display"]:
        specs.append({"label": "Display", "value": facts["display"]})
    specs.append({"label": "Source category", "value": ascii_text(record.get("Category", ""))})
    return specs, facts


def product_description(name: str, brand: str, category: str, condition: str, price: int, facts: dict[str, str]) -> str:
    condition_label = "Ex-UK" if condition == "Refurbished" else condition.lower()
    descriptor = f"{condition_label} {category_noun(category)}"
    article = "an" if descriptor[0].lower() in {"a", "e", "i", "o", "u"} else "a"
    summary = spec_summary(facts)
    price_part = f" at KES {price:,}" if price else ""
    details = f" Key sheet details include {summary}." if summary else ""
    brand_part = f" from {brand}" if brand else ""
    return (
        f"{name} is {article} {descriptor}{brand_part} listed by MobDeals Kenya{price_part}. "
        f"It is positioned for {category_use_case(category)}.{details}"
    )


def product_highlights(category: str, condition: str, price: int, facts: dict[str, str]) -> list[str]:
    highlights = [f"{title_condition(condition)} listing from the MobDeals product sheet"]
    for label, key in [
        ("Processor", "processor"),
        ("Memory", "ram"),
        ("Storage", "storage"),
        ("Generation", "generation"),
        ("Display", "display"),
    ]:
        if facts.get(key):
            highlights.append(f"{label}: {facts[key]}")
    if price:
        highlights.append(f"Listed price: KES {price:,}")
    highlights.append("Confirm current stock, accessories, warranty terms, and delivery before purchase")
    return highlights[:5]


def warranty_note(condition: str) -> str:
    if condition == "New":
        return "Warranty terms confirmed before purchase"
    return "Shop warranty and condition details confirmed before purchase"


def availability_note(category: str) -> str:
    base = "Confirm current availability, exact unit details, and delivery timing before payment."
    if category == "laptops":
        return "Confirm exact unit condition, charger, battery status, and delivery timing before payment."
    if category == "desktops":
        return "Confirm included accessories, monitor bundle needs, and delivery timing before payment."
    if category == "printers":
        return "Confirm current stock, supplies, setup needs, and delivery timing before payment."
    return base


def image_for_record(record: dict[str, str], images_dir: Path, category: str, images: list[dict[str, object]], fallback_by_category: dict[str, str]) -> list[dict[str, str]]:
    image_name = Path(record.get("Image URL", "")).name
    product_name = ascii_text(record.get("Product Name", ""))
    brand = ascii_text(record.get("Brand", ""))

    candidates = [image_name, f"{Path(image_name).stem}.webp"] if image_name else []
    for candidate in candidates:
        path = images_dir / candidate
        if path.exists():
            return [{"src": f"/images/{candidate}", "alt": product_name}]

    best_image = best_local_image(product_name, brand, category, images, fallback_by_category)
    if best_image:
        return [{"src": f"/images/{best_image}", "alt": product_name}]
    return []


def seo_description(name: str, category: str, condition: str, price: int, facts: dict[str, str]) -> str:
    summary = spec_summary(facts)
    details = f" Specs: {summary}." if summary else ""
    price_text = f" Listed price KES {price:,}." if price else ""
    return (
        f"{name} from MobDeals Kenya. {title_condition(condition)} {category_noun(category)} for {category_use_case(category)}."
        f"{details}{price_text} Confirm availability before purchase."
    )


def seo_title(name: str, category: str, condition: str) -> str:
    return f"{name} - {title_condition(condition)} {category_title_noun(category)} Kenya"


def build_products(records: list[dict[str, str]], images_dir: Path) -> tuple[list[dict], Counter]:
    products: list[dict] = []
    slug_counts: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()
    first_featured_by_category: set[str] = set()
    images, fallback_by_category = build_image_index(images_dir)

    for index, record in enumerate(records):
        raw_name = ascii_text(record.get("Product Name", ""))
        name = display_name(raw_name)
        brand = ascii_text(record.get("Brand", ""))
        category = infer_category(record, name)
        condition = normalize_condition(record.get("Condition", ""))
        price = parse_price(record, raw_name)
        specs, facts = build_specs(record, name, category, condition, price)
        base_slug = slugify(name)
        slug_counts[base_slug] += 1
        slug = base_slug if slug_counts[base_slug] == 1 else f"{base_slug}-{slug_counts[base_slug]}"
        category_counts[category] += 1

        product = {
            "id": slug,
            "slug": slug,
            "name": name,
            "brand": brand,
            "category": category,
            "price": {"amount": price, "currency": "KES"},
            "images": image_for_record(record, images_dir, category, images, fallback_by_category),
            "inStock": True,
            "description": product_description(name, brand, category, condition, price, facts),
            "highlights": product_highlights(category, condition, price, facts),
            "specs": specs,
            "condition": condition,
            "warranty": warranty_note(condition),
            "availabilityNote": availability_note(category),
            "seoTitle": seo_title(name, category, condition),
            "seoDescription": seo_description(name, category, condition, price, facts),
        }

        if category not in first_featured_by_category or index < 4:
            product["featured"] = True
            first_featured_by_category.add(category)

        products.append(product)

    return products, category_counts


def categories_for_counts(category_counts: Counter[str]) -> list[dict]:
    categories = []
    for slug in CATEGORY_ORDER:
        if category_counts.get(slug, 0) == 0:
            continue
        entry = {"slug": slug, **CATEGORY_DEFINITIONS[slug]}
        categories.append(entry)
    return categories


def ts_literal(value: object, indent: int = 0) -> str:
    return json.dumps(value, ensure_ascii=True, indent=2).replace("\n", "\n" + " " * indent)


def render_products_ts(categories: list[dict], products: list[dict], source_path: Path) -> str:
    return "\n".join(
        [
            "import type { Product, ProductCategory } from '@lib/products';",
            "",
            f"// Generated from {source_path.name}. Re-run scripts/import_mobdeals_products.py after workbook updates.",
            f"export const productCategories: ProductCategory[] = {ts_literal(categories)};",
            "",
            f"export const products: Product[] = {ts_literal(products)};",
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output", type=Path, default=Path("src/data/products.ts"))
    parser.add_argument("--images-dir", type=Path, default=Path("public/images"))
    args = parser.parse_args()

    records = read_product_rows(args.workbook)
    products, category_counts = build_products(records, args.images_dir)
    categories = categories_for_counts(category_counts)
    output = render_products_ts(categories, products, args.workbook)
    args.output.write_text(output, encoding="utf-8")

    print(f"Imported {len(products)} products")
    for category in categories:
        print(f"- {category['slug']}: {category_counts[category['slug']]}")


if __name__ == "__main__":
    main()
