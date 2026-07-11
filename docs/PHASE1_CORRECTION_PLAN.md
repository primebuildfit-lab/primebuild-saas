# Phase 1 — Correction Plan (official Shopify template migration)

> ✅ **EXECUTED 2026-07-11** in a connected Claude Code session (Windows, Node 24.18, npm 11.16,
> Shopify CLI 4.3.0). The migration below was carried out: the app now runs on the official Shopify
> React Router template, all Eventra work was preserved per the migration map, `npm install` /
> `npm run typecheck` / `npm run build` pass, `package-lock.json` is committed, and a
> `react-router-serve` smoke test boots. Steps 1–4 done; Steps 5–6 (commit/push/report) recorded in
> `BUILD_STATUS.md`. The original plan text is kept below for reference.
>
> Implementation note: instead of `npm init @shopify/app` (which requires an interactive Shopify
> Partner-org login and would create/link a real app), the **identical** official template was obtained
> by cloning `Shopify/shopify-app-template-react-router` — the same source the scaffolder copies — so no
> app was linked and no external Partner action was taken.

---

> Deterministic steps to run in an environment where **npm and the repo are reachable**
> (a Claude **Code** session bound to `primebuildfit-lab/primebuild-saas`, or local/Railway).
> This session (Cowork) cannot: reach the npm registry (HTTP 403), run the Shopify CLI, build,
> produce a lockfile, or commit. Everything below is prepared so the corrected foundation is
> genuinely buildable there.

## Step 1 — Generate the official Shopify React Router template

```bash
# Official scaffold (React Router template). Pick app name "eventra".
npm init @shopify/app@latest -- --template react-router
#   ↳ produces: shopify.app.toml, shopify.web.toml, app/entry.server.tsx,
#     app/shopify.server.ts (real shopifyApp config), app/routes/app.tsx (authenticated,
#     App Bridge AppProvider + NavMenu), app/routes/auth.$.tsx, app/routes/_index/route.tsx,
#     app/routes/webhooks.*, prisma/ (session storage), vite.config.ts, react-router.config.ts.
```

Do this in a scratch dir, then merge into the repo (Step 3), OR run it at the repo root and layer
the Eventra foundation on top.

## Step 2 — Add Tailwind + Eventra dependencies to the template's package.json

Merge these into the template's `dependencies` / `devDependencies` (keep all `@shopify/*` and
`@react-router/*` from the template):

```
dependencies:    framer-motion  lucide-react  date-fns  clsx  tailwind-merge
devDependencies: @tailwindcss/vite  tailwindcss
```

Add the Tailwind plugin to the template's `vite.config.ts` plugin list, and import `./app.css`
in the root. Keep the template's `server.allowedHosts` / HMR config for tunneling.

## Step 3 — Migration map (reuse good work; don't rebuild)

| Existing Eventra file(s) | Action | Notes |
|--------------------------|--------|-------|
| `app/types/domain.ts` | ✅ keep as-is | framework-agnostic |
| `app/data/**` (mock data) | ✅ keep as-is | shapes match `docs/SUPABASE_SCHEMA.md` |
| `app/lib/**` (cn, dates, nav, planEntitlements, tenant) | ✅ keep as-is | — |
| `app/components/ui/**` | ✅ keep as-is | design system |
| `app/components/shell/**`, `app/components/Placeholder.tsx` | ✅ keep | our custom in-app chrome |
| `app/context/**` (Store, Plan) | ✅ keep | — |
| `app/routes/app.calendar.tsx` … `app.admin.tsx` (10 surfaces) | ✅ keep | render inside authenticated `app.tsx` Outlet |
| `app/routes/app._index.tsx` | ✅ keep (minor) | remove any "official scaffold" wording |
| `app/app.css` | ✅ keep | Tailwind entry + brand tokens |
| `app/root.tsx` | 🔁 replace | use template's root |
| `app/routes/app.tsx` | 🔁 rewrite | template's authenticated layout: `authenticate.admin(request)` loader + App Bridge `AppProvider`, then wrap **our** `StoreProvider`/`PlanProvider`/`AppShell` around `<Outlet/>` |
| `app/routes/_index.tsx` | 🔁 replace | template's `_index/route.tsx` (login/landing) |
| `app/shopify.server.ts` | 🔁 replace | template's real `shopifyApp({...})` (remove our placeholder) |
| `app/routes.ts`, `vite.config.ts`, `react-router.config.ts`, `tsconfig.json` | 🔁 use template's | then re-add `~/*` path + Tailwind |
| `package.json` | 🔁 merge | template base + Step 2 deps |
| `app/entry.server.tsx` | ➕ from template | — |
| `shopify.app.toml`, `shopify.web.toml`, `prisma/**`, `webhooks.*` | ➕ from template | session storage stays Prisma initially; swap to Supabase/Postgres session storage in Phase 5 |

**Auth layout target** (`app/routes/app.tsx`) — shape:
```tsx
import { authenticate } from "~/shopify.server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
export async function loader({ request }) {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
}
export default function App() {
  const { apiKey } = useLoaderData();
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <StoreProvider><PlanProvider>
        <AppShell><Outlet /></AppShell>   {/* our Tailwind shell inside App Bridge */}
      </PlanProvider></StoreProvider>
    </AppProvider>
  );
}
```
Real Shopify **actions stay disabled**; mock data remains until Phase 5.

## Step 4 — Install, verify, fix

```bash
npm install            # generates package-lock.json (the required lockfile)
npm run typecheck      # react-router typegen + tsc — fix every error
npm run build          # production build — fix every error
npm run dev            # optional: smoke-test the embedded app
```
Fix all TypeScript/build errors before declaring completion.

## Step 5 — Commit

```bash
git add -A
git commit -m "Phase 1: Eventra foundation on official Shopify React Router template"
git push
```
(Only possible once the repo is attached to the session / available locally.)

## Step 6 — Report

Produce the final Phase-1 correction report: Shopify template files created, Eventra files
preserved/migrated, dependencies installed, typecheck/build results, Supabase/RLS design delivered,
unresolved blockers.
