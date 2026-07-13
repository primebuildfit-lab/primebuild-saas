# Eventra Internal OS — Information Architecture (`INTERNAL_OS_INFORMATION_ARCHITECTURE.md`)

> Phase 7 (Nivel A). The private platform admin console — separate from the Business app (Nivel B) and
> the future Personal app (Nivel C). Shopify Admin was used only as an **ergonomics reference** (structure,
> density, navigation behavior) — no Shopify code, brand, or icons. Eventra keeps its own identity.

## Levels (strict separation — never mixed)

| Level | Product | Audience | App |
|-------|---------|----------|-----|
| **A** | **Eventra Internal OS** | Eventra platform staff (Brian first) | `apps/admin` |
| B | Eventra Business | Business customers | `apps/business` (Shopify-embedded + web) |
| C | Eventra Personal | Individual users (when enabled) | `apps/consumer` |

Access to A requires an **admin principal** + a **platform role** (`@eventra/identity`). A tenant role can
never reach a platform permission (deny-by-default; enforced server-side + RLS).

## Navigation map (grouped)

Implemented in `apps/admin/src/os/nav.ts`. `real` = a built screen; others are honest scaffolds.

| Group | Module | Route | Built |
|-------|--------|-------|-------|
| — | Home | `/` | ✅ |
| Offers | Global Calendar | `/calendar` | ✅ |
| Offers | Offers | `/offers` | ✅ |
| Offers | Sources | `/sources` | ✅ |
| Offers | Cancellations | `/cancellations` | scaffold (engine built) |
| Marketing | Campaigns | `/campaigns` | scaffold |
| Marketing | Content | `/content` | scaffold |
| Marketing | Templates | `/templates` | scaffold |
| Marketing | Media | `/media` | scaffold |
| Customers | Companies | `/companies` | ✅ |
| Customers | Users & Teams | `/users` | ✅ |
| Customers | Audiences | `/audiences` | scaffold |
| Revenue | Analytics | `/analytics` | ✅ |
| Revenue | Plans & Membership | `/plans` | scaffold |
| Revenue | Commissions | `/commissions` | ✅ |
| Platform | Integrations | `/integrations` | scaffold |
| Platform | AI | `/ai` | ✅ (fake) |
| Platform | Automations & Jobs | `/jobs` | ✅ |
| Platform | Countries & Regions | `/countries` | scaffold |
| System | System Health | `/health` | scaffold |
| System | Logs | `/logs` | scaffold |
| System | Audit | `/audit` | scaffold |
| System | Settings | `/settings` | scaffold |

## Shell

- **Sidebar:** grouped, collapsible, mobile drawer, active state, environment badge in topbar.
- **Topbar:** global search → **command palette** (⌘K / Ctrl+K), environment badge (dev/prod, never falsely
  "production"), principal label.
- **Main:** page title + description + primary actions + toolbar (filters) + content.

## Per-module conventions

- **List pages:** filters (status/country/…), search, sortable, selection + bulk actions (gated by the
  permission matrix; mock today, always audited when real), pagination (server-side when live), empty +
  error states.
- **Detail pages:** header + status, tabs, activity/audit timeline, related records, primary/secondary actions.
- **Bulk actions:** verify / reject / archive / re-sync / change category/priority / assign / mark problem /
  export — each generates an audit record.
- **Empty/error states:** every screen renders an honest empty/scaffold state — never a fake filled UI.

## Permissions (summary — see `PLATFORM_ADMIN_SECURITY.md`)

Roles: `platform_owner` (Brian), `platform_admin`, `operations`, `support`, `analyst`, `read_only`.
Reads = any admin; offer/source curation + jobs = `operations`+; commissions/billing/settings =
`platform_admin`+; ownership = `platform_owner`. `support` may impersonate (audited).
