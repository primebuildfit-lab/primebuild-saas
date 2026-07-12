# Eventra Business — Pre-Install Screen Review (MM5, Part 11)

> Every Business surface reviewed before installation. Verified LIVE in local **preview** mode
> (`EVENTRA_PREVIEW=true EVENTRA_PERSISTENCE_MODE=file npx react-router dev`) hydrated from the file
> repository — a labeled, no-Shopify-session inspection. Functional issues fixed inline; subjective design
> notes are deferred to a later UX phase (not redesigned now).

## Method
Loaded each route in the in-app browser, checked: renders, **console errors**, hydration from the
persistence layer, and refresh behavior. Persistence write→reload was exercised against the running
server (`/app/data` POST → on-disk snapshot → fresh navigation re-hydrated the record).

## Result: all routes render, **zero console errors**
| Route | Screen | Status | Notes |
|-------|--------|--------|-------|
| `/app` | Dashboard | ✅ | Stats, upcoming opportunities, campaigns — hydrated from file repo (Growth plan). |
| `/app/calendar` | Calendar (year/month/day) | ✅ | Month grid with events + campaigns placed; toolbar filters render. |
| `/app/campaigns` | Campaigns | ✅ | Filters + cards; **write→reload proven** ("MM5 Browser Proof" survived). "4 of 100 saved on your Growth plan". |
| `/app/campaign-library` | Library | ✅ | Renders. |
| `/app/countries` | Countries | ✅ | Renders; server-side plan enforcement now gates enabling. |
| `/app/events` | Events catalog | ✅ | Renders. |
| `/app/templates` | Templates | ✅ | Renders. |
| `/app/settings` | Settings / Appearance | ✅ | Renders. |
| `/app/billing` | Billing / Pricing | ✅ | Renders. |
| `/app/analytics` | Analytics | ✅ | Renders. |
| `/app/admin` | In-app admin | ✅ | Renders. |
| `/app/search?q=…` | Search | ✅ | Refactored route; returns grouped results (events + campaigns). |

**States:** the preview banner renders on every screen; the persistence-error banner is wired (shown only
on a real `/app/data` failure). Empty/loading/not-found states exist via `EmptyState`/`Skeleton`/
`RouteBoundary` (unchanged from prior phases).

## Fixed inline during MM5
- `app/search.tsx`: removed a `setState`-in-effect (derived the searching flag) — was a lint error.
- `app/calendar.tsx`: stopped mutating `URLSearchParams` in place — was a memoization/lint warning.
- Wired every screen's reads to loader-hydrated data + writes to the `/app/data` action seam (Part 3).

## Deferred (subjective — later UX phase, NOT redesigned now)
- Residual advisory React-Compiler warnings in form modals (`CampaignFormModal`, `CustomEventFormModal`,
  `TemplateFormModal`) — reset form state in an effect; advisory only, no runtime bug.
- Some `text-gray-400` low-contrast spots (noted in `PROJECT_AUDIT.md`).
- Full Business-UI convergence onto `@eventra/ui` + `@eventra/config` (façade retained for MM5).

## Gated (cannot verify pre-install)
- Embedded App Bridge behavior **inside Shopify Admin** (frame, session token nav) — requires install.
  Preview renders the same routes without the Admin frame.
