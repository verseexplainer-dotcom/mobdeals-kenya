#!/usr/bin/env python3
"""Check or apply public build variables for the two existing Pages projects."""

import argparse
import base64
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = {
    "mobdeals-kenya": "https://shop.mobdeals.co.ke",
    "mobdeals-marketing": "https://mobdeals.co.ke",
}
ANALYTICS = (
    "PUBLIC_GA4_MEASUREMENT_ID",
    "PUBLIC_CLARITY_SHOP_PROJECT_ID",
    "PUBLIC_CLARITY_MARKETING_PROJECT_ID",
)


def load_environment():
    for filename in (".env", ".env.local"):
        path = ROOT / filename
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            match = re.match(r"\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)", line)
            if match:
                os.environ.setdefault(match[1], match[2].strip().strip("\"'"))
    required = ("CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY")
    missing = [name for name in required if not os.environ.get(name, "").strip()]
    if missing:
        raise ValueError("Missing required environment variables: " + ", ".join(missing))
    url = urllib.parse.urlparse(os.environ["PUBLIC_SUPABASE_URL"])
    if url.scheme != "https" or not (url.hostname or "").endswith(".supabase.co") or url.username or url.password:
        raise ValueError("PUBLIC_SUPABASE_URL must be a hosted Supabase HTTPS URL.")
    key = os.environ["PUBLIC_SUPABASE_ANON_KEY"]
    if key.startswith("sb_publishable_"):
        return
    try:
        payload = json.loads(base64.urlsafe_b64decode(key.split(".")[1] + "==="))
    except (ValueError, IndexError):
        raise ValueError("PUBLIC_SUPABASE_ANON_KEY must be an anon JWT or publishable API key.") from None
    if payload.get("role") != "anon":
        raise ValueError("Refusing to publish a Supabase key whose role is not anon.")


def cloudflare(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4" + path,
        method=method,
        data=data,
        headers={
            "Authorization": "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"],
            "Content-Type": "application/json",
            "User-Agent": "MobDeals-Pages-Configuration/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        # Project response bodies can contain secrets; report only the status.
        raise RuntimeError(f"Cloudflare {method} failed with HTTP {error.code}.") from None
    if not body.get("success"):
        raise RuntimeError(f"Cloudflare {method} failed; inspect the account dashboard.")
    return body["result"]


def desired_variables(origin, environment):
    values = {
        "PUBLIC_SITE_URL": origin,
        "PUBLIC_SUPABASE_URL": os.environ["PUBLIC_SUPABASE_URL"],
        "PUBLIC_SUPABASE_ANON_KEY": os.environ["PUBLIC_SUPABASE_ANON_KEY"],
    }
    for name in ANALYTICS:
        if environment == "preview":
            values[name] = ""
        elif os.environ.get(name):
            values[name] = os.environ[name]
    return {name: {"type": "plain_text", "value": value} for name, value in values.items()}


def configure(project, apply):
    path = f"/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}/pages/projects/{project}"
    current = cloudflare("GET", path)
    updates = {}
    desired = {}
    for environment in ("production", "preview"):
        desired[environment] = desired_variables(PROJECTS[project], environment)
        existing = (current.get("deployment_configs", {}).get(environment) or {}).get("env_vars") or {}
        changed = {name: value for name, value in desired[environment].items() if existing.get(name) != value}
        print(f"{project}/{environment}: " + ("update " + ", ".join(sorted(changed)) if changed else "matches"), flush=True)
        if changed:
            updates[environment] = {"env_vars": existing | changed}
    if apply and updates:
        for environment, config in updates.items():
            for name, value in config["env_vars"].items():
                if value.get("type") == "secret_text" and name not in desired[environment]:
                    raise ValueError("Unrelated secret variables cannot be safely round-tripped; use the dashboard.")
        cloudflare("PATCH", path, {"deployment_configs": updates})
        verified = cloudflare("GET", path)
        for environment in updates:
            actual = verified["deployment_configs"][environment].get("env_vars") or {}
            if any(actual.get(name) != value for name, value in updates[environment]["env_vars"].items()):
                raise RuntimeError(f"Configuration verification failed for {project}/{environment}.")
        print(f"{project}: applied and verified; rebuild to publish changed build variables.", flush=True)
    return bool(updates)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Apply public variables; default only reports drift.")
    parser.add_argument("--project", choices=PROJECTS, help="Limit to one project; default checks both.")
    args = parser.parse_args()
    load_environment()
    drift = False
    for project in ([args.project] if args.project else PROJECTS):
        drift = configure(project, args.apply) or drift
    print("Preview GA4 and Clarity are explicitly disabled; production IDs are preserved or loaded from the local environment.")
    if drift and not args.apply:
        print("Dry run only. Re-run with --apply to update Cloudflare.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, RuntimeError, urllib.error.URLError, TimeoutError) as error:
        raise SystemExit(str(error)) from None
