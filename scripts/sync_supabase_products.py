#!/usr/bin/env python3
"""Check and optionally upload product-drop images to Supabase Storage."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from import_mobdeals_products import (
    DEFAULT_IMAGE_ROOT,
    DEFAULT_SOURCE,
    build_manifest,
    load_image_groups,
    map_product_images,
    read_catalog_rows,
)


DEFAULT_REPORT = Path("output/logs/supabase-product-image-sync-report.json")


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


def storage_object_url(base_url: str, bucket: str, storage_key: str, public: bool = True) -> str:
    quoted_bucket = urllib.parse.quote(bucket, safe="")
    quoted_key = urllib.parse.quote(storage_key, safe="/")
    visibility = "public/" if public else ""
    return f"{base_url.rstrip('/')}/storage/v1/object/{visibility}{quoted_bucket}/{quoted_key}"


def check_storage_object(base_url: str, bucket: str, item: dict[str, Any], timeout: int) -> dict[str, Any]:
    storage_key = item["storage_key"]
    request = urllib.request.Request(
        storage_object_url(base_url, bucket, storage_key),
        method="GET",
        headers={"Range": "bytes=0-0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return {
                "storage_key": storage_key,
                "exists": response.status in {200, 206},
                "status": response.status,
                "content_type": response.headers.get("Content-Type", ""),
            }
    except urllib.error.HTTPError as error:
        detail = error.read(1024).decode("utf-8", errors="replace")
        return {
            "storage_key": storage_key,
            "exists": False,
            "status": error.code,
            "error": str(error.reason),
            "detail": detail,
        }
    except (urllib.error.URLError, TimeoutError) as error:
        reason = error.reason if isinstance(error, urllib.error.URLError) else error
        return {"storage_key": storage_key, "exists": False, "status": 0, "error": str(reason)}


def check_storage(
    base_url: str,
    bucket: str,
    manifest: list[dict[str, Any]],
    workers: int,
    timeout: int,
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(check_storage_object, base_url, bucket, item, timeout): item["storage_key"]
            for item in manifest
        }
        for future in as_completed(futures):
            results.append(future.result())
    return sorted(results, key=lambda result: result["storage_key"])


def upload_storage_object(
    base_url: str,
    bucket: str,
    service_key: str,
    image_root: Path,
    item: dict[str, Any],
    timeout: int,
) -> dict[str, Any]:
    source_file = image_root / item["source_path"]
    storage_key = item["storage_key"]
    content_type = mimetypes.guess_type(source_file.name)[0] or "application/octet-stream"
    request = urllib.request.Request(
        storage_object_url(base_url, bucket, storage_key, public=False),
        data=source_file.read_bytes(),
        method="POST",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": content_type,
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return {"storage_key": storage_key, "uploaded": response.status in {200, 201}, "status": response.status}
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        return {"storage_key": storage_key, "uploaded": False, "status": error.code, "error": detail}
    except (urllib.error.URLError, TimeoutError) as error:
        reason = error.reason if isinstance(error, urllib.error.URLError) else error
        return {"storage_key": storage_key, "uploaded": False, "status": 0, "error": str(reason)}


def upload_missing(
    base_url: str,
    bucket: str,
    service_key: str,
    image_root: Path,
    items: list[dict[str, Any]],
    workers: int,
    timeout: int,
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(upload_storage_object, base_url, bucket, service_key, image_root, item, timeout): item[
                "storage_key"
            ]
            for item in items
        }
        for future in as_completed(futures):
            results.append(future.result())
    return sorted(results, key=lambda result: result["storage_key"])


def write_report(path: Path, report: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, nargs="?", default=DEFAULT_SOURCE)
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGE_ROOT)
    parser.add_argument("--bucket", default="product-images")
    parser.add_argument("--expected-count", type=int, default=241)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--upload", action="store_true", help="Upload missing catalog images before the final storage gate.")
    args = parser.parse_args()

    load_env_file(Path(".env"))
    load_env_file(Path(".env.local"))
    base_url = os.environ.get("PUBLIC_SUPABASE_URL", "").strip()
    if not base_url:
        raise SystemExit("Missing PUBLIC_SUPABASE_URL in the environment or .env files.")

    rows = read_catalog_rows(args.source, args.expected_count)
    groups = load_image_groups(args.images)
    matches = map_product_images(rows, groups)
    manifest = build_manifest(matches, args.images)
    initial_results = check_storage(base_url, args.bucket, manifest, args.workers, args.timeout)
    missing_keys = {result["storage_key"] for result in initial_results if not result["exists"]}
    missing_items = [item for item in manifest if item["storage_key"] in missing_keys]
    upload_results: list[dict[str, Any]] = []

    if missing_items and args.upload:
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        if not service_key:
            raise SystemExit("SUPABASE_SERVICE_ROLE_KEY is required for --upload.")
        upload_results = upload_missing(
            base_url,
            args.bucket,
            service_key,
            args.images,
            missing_items,
            args.workers,
            args.timeout,
        )

    final_results = (
        check_storage(base_url, args.bucket, manifest, args.workers, args.timeout) if upload_results else initial_results
    )
    unresolved = [result for result in final_results if not result["exists"]]
    report = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "source": str(args.source),
        "image_root": str(args.images),
        "bucket": args.bucket,
        "product_count": len(rows),
        "image_count": len(manifest),
        "resolved_count": len(manifest) - len(unresolved),
        "missing_count": len(unresolved),
        "upload_requested": args.upload,
        "uploaded_count": sum(bool(result.get("uploaded")) for result in upload_results),
        "upload_failures": [result for result in upload_results if not result.get("uploaded")],
        "missing": unresolved,
    }
    write_report(args.report, report)

    if unresolved:
        print(f"Storage gate failed: {len(unresolved)} of {len(manifest)} catalog images are unresolved.")
        print(f"Report: {args.report}")
        raise SystemExit(2)

    print(f"Storage gate passed: all {len(manifest)} catalog images resolve in '{args.bucket}'.")
    print(f"Report: {args.report}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
