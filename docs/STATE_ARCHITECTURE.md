# Eventra — State Architecture (Phases 2–4) and Phase‑5 Migration

> How mock-era state is organized today and exactly what moves to React Router
> loaders/actions + Supabase in Phase 5. Source: `app/context/DataContext.tsx`.

## Today (mock, client-side)
All mutable tenant state lives in React state seeded from `app/data/*`. It is split into three
**domain contexts** so a change in one domain doesn't re-render consumers of another:

| Context | Owns | Changes when |
|---------|------|--------------|
| **Plan / Identity** (`usePlanData`) | user, store, membership, plans, current plan/subscription, `setPlanId`, `canAddCountry` | plan switched (rare) |
| **Catalog** (`useCatalog`) | country catalog + per-store enablement, global events, hide/restore prefs, custom events, store preferences (appearance) | countries toggled, events hidden/restored, custom events edited, prefs changed |
| **Campaigns** (`useCampaignData`) | campaigns + templates and their actions | campaign/template CRUD, duplication, status/date changes |

`useData()` composes all three for backward compatibility (surface components use it; only one
surface is mounted at a time, so a composite subscription is acceptable there).

### Why the split
The **app shell** (sidebar, topbar, mobile nav) is always mounted. Its selectors
(`useCurrentStore`, `usePlan`) read only Plan + Catalog, **not** Campaigns — so editing or
duplicating a campaign no longer re-renders the shell. Action creators are referentially stable
(all `useCallback`; `duplicateCampaign` uses a functional `setState` so it carries no `campaigns`
dependency), so components memoized on actions don't re-render on unrelated state changes.

### Deliberately NOT done (would be overengineering at mock scale)
- No external store library (Zustand/Redux). Three contexts + memoization is enough for ≤ hundreds
  of mock records.
- No `useMemo`/`React.memo` sprinkling beyond derived lists already memoized in routes; added only
  where dependency analysis justified it.

## Phase 5 — what moves to loaders/actions
The context boundaries are drawn to match the future server boundaries. Each read below becomes a
route **`loader`** and each mutation a route **`action`**, backed by Supabase with RLS.

| Domain | Reads → `loader` | Writes → `action` | Supabase tables |
|--------|------------------|-------------------|-----------------|
| Plan/Identity | resolve Shopify session → `store` + `membership`; current `subscription` | change plan (Shopify Billing) | `stores`, `memberships`, `subscriptions`, `plans` |
| Catalog | `countries`, `global_events`, `store_countries`, `store_event_preferences`, `custom_events`, `store_preferences` | enable/disable country, hide/restore event, CRUD custom events, update prefs | those tables |
| Campaigns | `campaigns`, `templates` for the store | create/update/delete/duplicate/status/move; template CRUD | `campaigns`, `templates` |

Migration mechanics:
1. Replace `DataProvider`'s `useState` seeds with loader data passed via `useLoaderData()`.
2. Replace each action with a `fetcher.submit` to a route `action`; the action enforces membership +
   plan limits **server-side** (see `docs/PLAN_ENFORCEMENT.md`) and writes through RLS.
3. Component code that calls `useData()`/domain hooks keeps the **same shapes**, so most components
   don't change — they read loader-provided data instead of context state.
4. Optimistic UI via React Router `fetcher` state where useful.

Because the mock shapes already mirror `app/types/domain.ts` and `docs/SUPABASE_SCHEMA.md`, this is a
data-source swap, not a component rewrite.
