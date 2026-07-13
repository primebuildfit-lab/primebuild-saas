# Eventra — Testing Guide (`TESTING.md`)

## Commands

| Command | What it runs |
|---------|--------------|
| `npm run verify` | **The single gate:** typecheck + lint + test + build + boundaries + sql + pwa |
| `npm run test --workspaces` | All Vitest suites across the 13 workspaces |
| `npm run test:business` | Business app only |
| `npm run typecheck --workspaces` | `react-router typegen` (business) + `tsc --noEmit` everywhere |
| `npm run lint --workspaces` | ESLint (business) |
| `npm run build --workspaces` | Production builds |
| `npm run check:workspaces` | Dependency-boundary + cycle validation |
| `npm run check:sql` | Static Supabase schema/RLS/reference readiness |
| `npm run check:pwa` | Manifest + service worker + offline + icon validation |
| `npm run preinstall:check` | The `READY FOR SHOPIFY AUTHORIZATION` gate |

## Current coverage (all green)

**~208 tests** across workspaces. Highlights:

- **Business (150):** date resolution + BF/CM every year; planning (opportunities/prep); campaign duplication
  + next-year + never-overwrite history; plan limits + downgrade retention; hide/restore; single-current-store
  + tenant keying; template↔campaign; deterministic search; dialog a11y; **persistence** (CRUD, tenant
  isolation, memory/versioning, survives-reload snapshot + on-disk, soft-delete retention, validation, mode
  selection); **plan bridge** (façade↔locked, both directions); **permissions** (intent→permission mapping,
  per-role allow/deny, end-to-end denial through the server dispatcher); **observability** (request id, log
  level, build info).
- **Packages:** `@eventra/identity` (15 — principals, access checks never trust client ids, RLS claims,
  **role→permission matrix**); `@eventra/entitlements` (14 — two-axis consumer + business tiers);
  `@eventra/calendar` (8); `@eventra/config` (5); `@eventra/types` (6); `@eventra/testing` (4);
  Consumer/Admin shells (3 each).

## What is NOT covered by automated tests (verified manually / at certification)

These need a live Shopify session, a real Postgres, or a browser/device and are exercised in
`docs/FINAL_CERTIFICATION_CHECKLIST.md`:

- Live Shopify OAuth / install / App Bridge embedding / Shopify Mobile.
- Live Supabase RLS isolation (the matrix `supabase/tests/preinstall_rls_matrix.sql` runs against a real DB).
- Webhook delivery (HMAC-verified) end-to-end — handlers exist and are wired; delivery is Shopify-side.
- PWA install on a physical iPhone/Android; offline behavior on a device.
- Responsive rendering on real devices.
- No Playwright/E2E harness yet (documented gap — `docs/DECISIONS.md`).
