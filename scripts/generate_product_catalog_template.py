#!/usr/bin/env python3
"""Generate a reviewable product catalog template from a categorized WebP drop."""

from __future__ import annotations

import argparse
import csv
import hashlib
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path


DEFAULT_IMAGE_ROOT = Path("product drop")
DEFAULT_OUTPUT = Path("output/spreadsheet/new_product_catalog_template.csv")

CATEGORY_MAP = {
    "desktop": "desktops",
    "laptop": "laptops",
    "monitor": "monitors",
    "printer": "printers",
    "projector": "projectors",
    "smartphone": "smartphones",
    "software_box": "software",
    "tablet": "tablets",
    "ups": "ups",
}

BRAND_NAMES = {
    "acer": "Acer",
    "apple": "Apple",
    "asus": "ASUS",
    "canon": "Canon",
    "dell": "Dell",
    "epson": "Epson",
    "galaxy": "Samsung",
    "hp": "HP",
    "huawei": "Huawei",
    "infinix": "Infinix",
    "kaspersky": "Kaspersky",
    "kyocera": "Kyocera",
    "lenovo": "Lenovo",
    "lightwave": "Lightwave",
    "mecer": "Mecer",
    "mercury": "Mercury",
    "microsoft": "Microsoft",
    "msi": "MSI",
    "onn": "Onn",
    "phomemo": "Phomemo",
    "samsung": "Samsung",
    "starlink": "Starlink",
    "tecno": "Tecno",
    "unomat": "Unomat",
    "cursor": "Cursor",
}

DISPLAY_TOKENS = {
    "amd": "AMD",
    "ddr4": "DDR4",
    "ddr5": "DDR5",
    "elitebook": "EliteBook",
    "elitedesk": "EliteDesk",
    "gb": "GB",
    "hdd": "HDD",
    "hp": "HP",
    "ideapad": "IdeaPad",
    "iphone": "iPhone",
    "laserjet": "LaserJet",
    "macbook": "MacBook",
    "mfp": "MFP",
    "nvme": "NVMe",
    "omnibook": "OmniBook",
    "optiplex": "OptiPlex",
    "probook": "ProBook",
    "prodesk": "ProDesk",
    "ram": "RAM",
    "ssd": "SSD",
    "tb": "TB",
    "thinkbook": "ThinkBook",
    "thinkcentre": "ThinkCentre",
    "thinkpad": "ThinkPad",
    "ups": "UPS",
    "vivobook": "VivoBook",
    "xps": "XPS",
    "x360": "x360",
    "zbook": "ZBook",
}

GENERIC_NAME_SUFFIXES = (
    " software box",
    " smartphone",
    " projector",
    " desktop",
    " printer",
    " monitor",
    " laptop",
    " tablet",
    " ups",
)


@dataclass(frozen=True)
class ImageAsset:
    path: Path
    folder: str
    base_name: str
    gallery_order: int
    has_primary_name: bool


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return re.sub(r"-+", "-", slug).strip("-")


def split_filename(path: Path) -> tuple[str, int, bool]:
    stem = path.name[:-5]
    gallery_order = 1
    has_primary_name = True

    numbered_match = re.search(r"\s*\((\d+)\)$", stem)
    if numbered_match:
        gallery_order = int(numbered_match.group(1))
        stem = stem[: numbered_match.start()]
        has_primary_name = False

    if stem.lower().endswith(".webp"):
        stem = stem[:-5]
        gallery_order = max(gallery_order, 2)
        has_primary_name = False

    return stem.strip(), gallery_order, has_primary_name


def collect_assets(image_root: Path) -> list[ImageAsset]:
    paths = sorted(path for path in image_root.rglob("*.webp") if path.is_file())
    initial = []
    available_names: set[tuple[str, str]] = set()

    for path in paths:
        folder = path.parent.relative_to(image_root).as_posix()
        base_name, gallery_order, has_primary_name = split_filename(path)
        initial.append((path, folder, base_name, gallery_order, has_primary_name))
        available_names.add((folder.casefold(), base_name.casefold()))

    assets: list[ImageAsset] = []
    for path, folder, base_name, gallery_order, has_primary_name in initial:
        if gallery_order == 1:
            suffix_match = re.search(r"[-_](\d+)$", base_name)
            if suffix_match and int(suffix_match.group(1)) >= 2:
                candidate = base_name[: suffix_match.start()]
                if (folder.casefold(), candidate.casefold()) in available_names:
                    base_name = candidate
                    gallery_order = int(suffix_match.group(1))
                    has_primary_name = False

        assets.append(ImageAsset(path, folder, base_name, gallery_order, has_primary_name))

    return assets


def humanize_name(base_name: str) -> str:
    value = re.sub(r"[_-]+", " ", base_name)
    value = re.sub(r"\s+", " ", value).strip()
    lowered = value.lower()
    for suffix in GENERIC_NAME_SUFFIXES:
        if lowered.endswith(suffix):
            value = value[: -len(suffix)].strip()
            lowered = value.lower()
            break

    for suffix in (" brand new", " refurbished"):
        if lowered.endswith(suffix):
            value = value[: -len(suffix)].strip()
            break

    formatted = []
    for token in value.split():
        lowered_token = token.lower()
        if lowered_token in DISPLAY_TOKENS:
            formatted.append(DISPLAY_TOKENS[lowered_token])
        elif lowered_token in BRAND_NAMES:
            formatted.append(BRAND_NAMES[lowered_token])
        elif re.fullmatch(r"i[3579]", lowered_token):
            formatted.append(lowered_token)
        elif any(character.isdigit() for character in token) and any(character.isalpha() for character in token):
            formatted.append(token.upper())
        else:
            formatted.append(token.title())
    return " ".join(formatted)


def infer_brand(base_name: str) -> str:
    tokens = re.findall(r"[a-z0-9]+", base_name.lower())
    for token in tokens:
        if token in BRAND_NAMES:
            return BRAND_NAMES[token]
    return ""


def infer_condition(base_name: str) -> str:
    normalized = re.sub(r"[_-]+", " ", base_name.lower())
    if "brand new" in normalized:
        return "Brand New"
    if "refurbished" in normalized:
        return "Refurbished"
    return ""


def ordinal(value: int) -> str:
    if 10 <= value % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(value % 10, "th")
    return f"{value}{suffix}"


def infer_specs(base_name: str) -> tuple[str, str, str, str]:
    normalized = re.sub(r"[_-]+", " ", base_name.lower())
    storage_match = re.search(r"(\d+(?:\.\d+)?)\s*(tb|gb)\s*(ssd|hdd|nvme|hard drive)", normalized)
    storage = ""
    storage_span: tuple[int, int] | None = None
    if storage_match:
        amount, unit, kind = storage_match.groups()
        storage = f"{amount}{unit.upper()} {kind.upper().replace('HARD DRIVE', 'HDD')}"
        storage_span = storage_match.span()

    explicit_ram = re.search(r"(\d+)\s*gb(?:\s*ddr\d+)?\s*ram", normalized)
    ram = f"{explicit_ram.group(1)}GB" if explicit_ram else ""
    if not ram:
        for capacity in re.finditer(r"(\d+)\s*gb", normalized):
            if storage_span and capacity.start() >= storage_span[0] and capacity.end() <= storage_span[1]:
                continue
            if int(capacity.group(1)) <= 64:
                ram = f"{capacity.group(1)}GB"
                break

    generation_match = re.search(r"(\d+)(?:st|nd|rd|th)\s*gen", normalized)
    generation = f"{ordinal(int(generation_match.group(1)))} Gen" if generation_match else ""

    processor_match = re.search(r"(?:intel\s+)?core\s+(i[3579])|\b(i[3579])\b|ryzen\s+([3579])", normalized)
    processor = ""
    if processor_match:
        core = processor_match.group(1) or processor_match.group(2)
        processor = f"Intel Core {core}" if core else f"AMD Ryzen {processor_match.group(3)}"

    return ram, storage, generation, processor


def ordered_assets(assets: list[ImageAsset]) -> list[ImageAsset]:
    return sorted(assets, key=lambda asset: (asset.gallery_order, not asset.has_primary_name, asset.path.name.casefold()))


def duplicate_content_warnings(assets: list[ImageAsset], image_root: Path) -> dict[Path, str]:
    hashes: dict[str, list[Path]] = defaultdict(list)
    for asset in assets:
        digest = hashlib.sha256(asset.path.read_bytes()).hexdigest()
        hashes[digest].append(asset.path)

    warnings: dict[Path, str] = {}
    for paths in hashes.values():
        if len(paths) < 2:
            continue
        relative_paths = [path.relative_to(image_root).as_posix() for path in paths]
        warning = "Identical image content: " + " | ".join(relative_paths)
        for path in paths:
            warnings[path] = warning
    return warnings


def build_rows(image_root: Path) -> tuple[list[dict[str, str]], list[ImageAsset]]:
    assets = collect_assets(image_root)
    groups: dict[tuple[str, str], list[ImageAsset]] = defaultdict(list)
    display_bases: dict[tuple[str, str], str] = {}
    for asset in assets:
        key = (asset.folder.casefold(), asset.base_name.casefold())
        groups[key].append(asset)
        display_bases.setdefault(key, asset.base_name)

    duplicate_warnings = duplicate_content_warnings(assets, image_root)
    slug_counts: Counter[str] = Counter()
    rows: list[dict[str, str]] = []

    for key in sorted(groups):
        folder, _ = key
        grouped_assets = ordered_assets(groups[key])
        base_name = display_bases[key]
        base_slug = slugify(base_name)
        slug_counts[base_slug] += 1
        product_slug = base_slug if slug_counts[base_slug] == 1 else f"{base_slug}-{slugify(folder)}"
        source_paths = [asset.path.relative_to(image_root).as_posix() for asset in grouped_assets]
        target_paths = [f"{folder}/{product_slug}/{index:02d}.webp" for index in range(1, len(grouped_assets) + 1)]
        ram, storage, generation, processor = infer_specs(base_name)
        notes = ["Required: add price_kes and review all inferred fields."]
        if not any(asset.has_primary_name for asset in grouped_assets):
            notes.append("No unnumbered primary image; first gallery file selected as primary.")

        content_warnings = sorted({duplicate_warnings[asset.path] for asset in grouped_assets if asset.path in duplicate_warnings})
        rows.append(
            {
                "include": "YES",
                "product_slug": product_slug,
                "product_name": humanize_name(base_name),
                "brand": infer_brand(base_name),
                "category": CATEGORY_MAP.get(folder, slugify(folder)),
                "condition": infer_condition(base_name),
                "price_kes": "",
                "ram": ram,
                "storage": storage,
                "generation": generation,
                "processor": processor,
                "short_description": "",
                "long_description": "",
                "seo_title": "",
                "seo_description": "",
                "primary_source_image": source_paths[0],
                "source_gallery_images": " | ".join(source_paths[1:]),
                "target_storage_keys": " | ".join(target_paths),
                "image_count": str(len(grouped_assets)),
                "review_status": "NEEDS PRODUCT DATA",
                "duplicate_image_warning": " || ".join(content_warnings),
                "review_notes": " ".join(notes),
            }
        )

    return rows, assets


def write_csv(output_path: Path, rows: list[dict[str, str]]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGE_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.images.is_dir():
        raise SystemExit(f"Image directory not found: {args.images}")

    rows, assets = build_rows(args.images)
    if not rows:
        raise SystemExit(f"No WebP images found under: {args.images}")

    write_csv(args.output, rows)
    gallery_counts = Counter(row["image_count"] for row in rows)
    category_counts = Counter(row["category"] for row in rows)
    print(f"Generated {len(rows)} product rows from {len(assets)} images")
    print(f"Categories: {dict(sorted(category_counts.items()))}")
    print(f"Images per product: {dict(sorted(gallery_counts.items(), key=lambda item: int(item[0])))}")
    print(f"Output: {args.output}")


if __name__ == "__main__":
    main()
