# Eventra — Routing Model & Phase‑5 Readiness

> Current URL/route design and the plan for real, persistent, deep-linkable records.
> Source: `app/routes/*`, `app/routes.ts` (flat routes).

## Current routes
Authenticated surfaces live under the `app.tsx` layout (App Bridge + `DataProvider` + shell):

`/app` (dashboard) · `/app/calendar` · `/app/events` · `/app/campaigns` · `/app/campaign-library` ·
`/app/templates` · `/app/countries` · `/app/analytics` · `/app/billing` · `/app/settings` ·
`/app/admin` · `/app/search`.

Plus: `/app/*` catch-all (`app.$.tsx`, friendly 404 inside the shell), `auth.$`, `auth.login`,
webhooks, and `_index` → redirect to `/app`.

## URL-addressable state (today)
State that should survive reload/sharing is encoded in the URL, read with `useSearchParams`:

| Surface | URL state | Notes |
|---------|-----------|-------|
| Campaigns | `?c=<id>` opens the detail drawer | invalid/stale id → explicit "not found" panel, not a blank one |
| Calendar | `?view=year\|month`, `?y`, `?m`, `?d` | view + focused month/day are shareable |
| Events / Search | `?q=<query>` | filter/search term is shareable |

Error handling: every leaf route exports `RouteBoundary` (in-shell error state); unknown `/app/*`
paths render the catch-all; unresolved record ids render a recoverable "not found" state.

### Known limitation (mock only)
Records created at runtime live in client state and reset on reload, so a deep link to a *newly
created* id won't resolve after refresh (it shows the "not found" state). This resolves in Phase 5
when records persist in Supabase — see below.

## Phase‑5 plan: nested record routes + loaders
When records persist, promote the query-param panels to **nested routes** so each record has a real,
loader-backed URL:

```
app.campaigns._index.tsx     // list (loader: campaigns for the store)
app.campaigns.$id.tsx        // detail (loader: one campaign; 404 -> throw new Response(null,{status:404}))
app.campaigns.new.tsx        // create (action)
app.campaigns.$id.edit.tsx   // edit (action)
```

The list route renders `<Outlet/>` in a drawer slot, preserving today's overlay UX while giving each
record an addressable URL, server 404s, and native back/forward. Apply the same pattern to
events (`app.events.$id`) and calendar day/month routes if deep day links are wanted.

Migration is mechanical because:
- the current components already accept an id and render detail/edit UIs;
- `docs/STATE_ARCHITECTURE.md` maps each read to a loader and each write to an action;
- invalid-id handling already exists (swap the client "not found" panel for a thrown 404 `Response`
  caught by `RouteBoundary`).

Decision to make before Phase 5 (tracked as audit **M‑1**): commit to nested routes vs. keeping query
params. Recommendation: **nested routes**, for real 404s, SSR of a single record, and shareable URLs.
