# Cloudflare and Supabase audit — 18 October 2026

## Remediation

After the audit, the owner authorized fixes and a commit/push. The following live
changes were applied and read back successfully:

- Both Pages projects now have the public site origin, Supabase URL, and public
  anon key in production and preview environments. This restores marketing's
  exact product-image URLs when rebuilt.
- Production GA4/Clarity IDs remain configured. Preview GA4/Clarity IDs are
  explicitly empty, as selected by the owner, to exclude preview traffic from
  production reports.
- Cloudflare's minimum TLS version was raised from `1.0` to `1.2`; the existing
  token permitted the change. Strict origin TLS and HTTPS redirection remain on.
- `scripts/configure_cloudflare_pages.py` provides a repeatable dry run and
  opt-in apply operation. It only publishes the allowlisted public settings,
  rejects a privileged Supabase key in the anon field, preserves unrelated
  public variables, and verifies API updates. No credential values are logged.

Supabase still reports `disable_signup: false`. Disabling new user signup needs
the owner's dashboard access or a Supabase management token. No database schema,
catalog row, Storage object, or Auth user was changed by these fixes.

The owner's SQL result, `supabase_migrations.schema_migrations`, confirms the
migration-history table exists; it does not include the RLS, grant, function, or
constraint results. The SQL checklist now returns all checks and migration
versions together in one JSON `audit` result for easier sharing. Those checks
remain unverified until the full result is reviewed.

Remediation verification passed `npm run check`, `npm run check:marketing`,
`npm run lint`, both production builds, and `npm run verify:sites` (409 storefront
pages and two marketing pages). Both `npm audit --omit=dev` and `npm audit`
reported zero vulnerabilities. The configuration helper's safety checks covered
privileged-key rejection, dry-run isolation, preservation of unrelated variables,
empty preview analytics IDs, and idempotency. A subsequent live dry run reported
all four project/environment combinations matching. The AST knowledge graph was
updated without an LLM/API call.

The original audit below records the state before these fixes.

## Initial audit

The initial live checks used credentials already in local `.env`. Credential values were
kept out of the report. No remote settings, database rows, storage objects, DNS
records, or deployments were changed. A short-lived Pages upload credential was
requested solely to verify Pages Write capability, then discarded without use.

## Overall finding

The current static, WhatsApp-based storefront has its core hosting and Supabase
data/media configured. Configuration gaps remain in marketing image settings,
preview environments, and unused Supabase signup. Full live database policy and
migration verification requires SQL or Supabase management access.

## Confirmed working

- Both Cloudflare Pages projects use GitHub branch `main` and successfully
  deployed commit `e66476512bbf51458283cff3c6ccc308c429a98d` on 18 October.
- `mobdeals-kenya`: `npm run build`, output `dist`, domain `shop.mobdeals.co.ke`.
- `mobdeals-marketing`: `npm run build:marketing`, output `dist-marketing`, domains
  `mobdeals.co.ke` and `www.mobdeals.co.ke`.
- All three custom domains are active, with proxied CNAME records pointing to
  the correct Pages project. Cloudflare SSL mode is Full (strict), with automatic
  HTTPS enabled.
- Both deployed projects report `uses_functions: true`. The repository's only
  Pages Function, `functions/_middleware.js`, redirects `www` to the apex; it
  delegates other requests to static Pages hosting. No order/payment API is
  required by the current implementation.
- Supabase has `products`, `product_categories`, and `product_images` tables.
  Public reads return 346 products, nine categories, and 384 image rows.
  Service-role reads return 357 products and 396 image rows. The 11 extra
  products are inactive and unavailable and are excluded from public reads.
- All 346 public product slugs, prices, availability flags, categories, and
  primary image keys match `src/data/products.ts` exactly.
- All 324 unique Storage objects referenced by the local catalog returned HTTP
  200 and an image content type on public HEAD requests.
- `product-images` is public, has a 50 MiB upload limit, and allows WebP, JPEG,
  and PNG, matching the versioned schema.
- Production GA4 and both site-specific Clarity variables exist on both Pages
  projects and match the local `.env` values. The storefront production Supabase
  URL and public anon key also match. Neither production configuration contains
  the local service-role key or Cloudflare API token.

## Gaps and who can resolve them

| Priority | Finding and effect | Action | Available access |
| --- | --- | --- | --- |
| High | Marketing production has no `PUBLIC_SUPABASE_URL`. The image helper returns an empty source without it, causing selected product photos to use representative fallbacks. | Copy the public Supabase URL into marketing production build variables, then rebuild/redeploy that project. The current marketing page does not call the database client, so the anon key is not required for these images. | The existing Cloudflare token has verified Pages Write capability for both projects; Codex can apply this fix. |
| Medium | Both Pages preview environments have no environment variables. Production settings therefore do not establish that previews have product images or analytics. | Add the public Supabase URL and the documented GA4/Clarity settings to previews; add the public anon key wherever a preview uses the browser database client. Build a preview to verify. Decide whether previews should send analytics to production properties. | Codex can configure and deploy previews with the existing Cloudflare token. |
| Medium | Live Auth settings advertise `disable_signup: false` and email authentication enabled. Local `supabase/config.toml` has `enable_signup = false`; this file configures local development and does not establish hosted Auth settings. | In Supabase Authentication configuration, turn off **Allow new users to sign up** for this account-free storefront. No signup or email-sending test was performed. | Requires your dashboard access or an appropriately scoped Supabase management token. The `.env` service-role key is a data/Auth-admin credential, not a Management API token. |
| Verification gap | Public row filtering behaves as intended, but exact RLS definitions, grants, constraints, authenticated-user access, and migration history were not inspected through SQL. | Run `docs/cloud-audit-readonly.sql` in the project's Supabase SQL Editor, or provide scoped management/SQL access for Codex to complete the inspection. Review results before applying any migration. | Existing service-role access can administer catalog rows and Storage, but does not provide arbitrary SQL/DDL or management configuration access. |
| Optional hardening | Cloudflare's minimum allowed TLS version is `1.0`. | Consider raising it to `1.2` after reviewing support requirements for older clients. HTTPS and strict origin TLS are already enabled. | Zone-setting read access was confirmed. Zone-setting write capability was not established; it is separate from Pages Write. You can change this in SSL/TLS → Edge Certificates. |

Cloudflare documents that both the upload-token capability probe and project
configuration updates require [Pages Write](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/).
Both projects passed the capability probe; this audit deliberately did not test
edits by changing live configuration.

Supabase's [Management API](https://supabase.com/docs/reference/api/introduction)
uses personal access tokens or OAuth, distinct from project API keys. Hosted
signup is controlled through [Auth general configuration](https://supabase.com/docs/guides/auth/general-configuration).

## Scope and access limits

- Cart storage, search, enquiries, business quotations, and order-status requests
  are implemented in browser code. Checkout and enquiry forms prepare WhatsApp
  messages. Automated payments, customer accounts, persistent orders, and an
  automatic order-status backend are not implemented in this project; enabling
  Cloudflare or Supabase settings alone would not add them.
- GA4/Clarity variable configuration does not prove receipt of events. Check
  GA4 DebugView/Realtime and the relevant Clarity dashboard using your Google and
  Microsoft accounts after accepting analytics consent. These Cloudflare and
  Supabase credentials do not grant analytics-account access.
- No Meta Pixel ID is configured locally or in Pages. Meta tracking is optional
  and needs a real ID from your Meta account if desired. AdSense has a configured
  publisher ID fallback in the source; account approval and revenue were not
  checked.
- Anonymous database reads work. Anonymous OpenAPI discovery returned HTTP 401;
  this does not establish that the anon key is invalid for catalog reads.
- Cloudflare token-policy introspection returned HTTP 403. Pages Write was
  established independently through the documented capability probe. The Bot
  Management API also returned HTTP 403; its settings were not verified.
- Initial Python-default-user-agent requests returned Cloudflare error 1010.
  A browser user agent succeeds. Cloudflare describes this as a
  [browser-signature block](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/);
  it is not evidence that the site is generally unavailable. No security control
  was disabled for this audit.
- No WhatsApp message was sent, no customer account was created, and no mutation
  was attempted to test anonymous write permissions. Database security findings
  are limited to the observed public read filtering until the SQL audit runs.

## Verification evidence

API checks covered Pages configuration, current deployments, Function metadata,
custom domains, DNS, SSL settings, Supabase catalog reads under both credentials,
Storage configuration, and public Auth settings.

- The live shop homepage contains six exact Supabase product-image references;
  the marketing homepage contains zero. This corroborates the missing marketing
  build variable rather than a Storage outage.
- Successful route checks cover both homepages, the cart, search, contact,
  business enquiries, order-status request page, privacy/cookie pages, all nine
  categories, one product per category, robots files, sitemaps, and shop ads.txt.
  Deliberately nonexistent URLs on both sites return HTTP 404.
- HTTP-to-HTTPS, `www`-to-apex, and `/account`-to-`/contact` redirects return HTTP
  301. The legacy apex product URL was independently traced through a 301 to the
  shop, a trailing-slash 308, and a final HTTP 200. Some individual fetches timed
  out; a timeout alone was not classified as a deployment defect.
- Both sites' delivered analytics module contains the expected GA4 and Clarity
  IDs. No local privileged credential values were detected in fetched public
  HTML/JS/CSS. This scan covers the retrieved assets rather than every deployed
  file and does not establish event delivery to provider dashboards.
- The initial SQL helper contained six SELECT statements and no mutations. Its
  updated form combines them into one read-only JSON result. Both report files were scanned against the privileged `.env`
  credential values, with no matches. `git diff --check` passed.
- `graphify update .` completed its AST scan and reported no code-graph topology
  changes. No LLM extraction or API cost was incurred by that graph update.

The companion SQL file contains read-only queries for the remaining database
checks. The initial audit changed no application code and needed no release build.
