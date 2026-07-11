# Eventra — Project Audit (pre‑V1)

> Full engineering, architecture, UX, product and code audit of everything built in **Phases 1–4**
> (mock‑data‑driven Shopify app on the official React Router template). Conducted 2026‑07‑11 as a
> professional review *before* a hypothetical public release. **Phase 5 (real Shopify/Supabase/Billing)
> was not started, connected, or implemented.**
>
> Scope reviewed: 16 route modules, 30 feature components, 18 UI primitives, 13 lib modules, contexts,
> mock data, config, and all `docs/`. Verification used `tsc`, `react-router build`, ESLint, and SSR
> renders of every surface.

## How to read this
Findings are grouped **Critical → High → Medium → Low**. Each has: Title · Severity · Description ·
Why it matters · Recommended solution · Effort. Items marked **✅ Fixed in this audit** were small,
safe, and self‑contained and have been applied + committed. Items marked **📌 Documented only** touch
architecture, business rules, or future infrastructure and were intentionally *not* changed.

---

## Summary

| Severity | Count | Fixed now | Documented |
|----------|-------|-----------|------------|
| Critical | 1 | 0 | 1 |
| High | 5 | 1 (partial: doc correction) | 5 |
| Medium | 8 | 3 | 5 |
| Low | 10 | 6 | 4 |
| **Total** | **24** | **10 fixes applied** | — |

**Overall project health: 78 / 100** — clean, typed, consistent, fully builds/typechecks; debt is mostly
the expected mock→real gap plus a few correctness/UX items.
**Production readiness (public V1): 35 / 100** — no persistence, auth, billing, or tests yet; those are
Phase‑5 by design, so the app is *not* releasable to real merchants today.

### 12‑area coverage
| Area | Verdict |
|------|---------|
| 1. Architecture | Solid layering; single mega‑context is the main risk (H‑4). Loaders/actions absent (M‑7). |
| 2. Components | Consistent; removed real duplication (SearchInput) and dead code. Modal/Drawer a11y gap (M‑2). |
| 3. Pages | Cohesive layout, empty/error states everywhere, responsive. Contrast + focus polish needed. |
| 4. Business rules | Conform to docs, **except** downgrade‑retention only partial (H‑3) and BF/CM dates (H‑2). |
| 5. UX | Strong flows; store‑switcher honesty fixed; search discoverability + record URLs to improve. |
| 6. Performance | Fine at mock scale; duplicated computes (M‑4), framer‑motion weight (M‑5). |
| 7. TypeScript | Strong; no `any`/`ts‑ignore`; a few `as` casts on selects (M‑8). |
| 8. Styling | Consistent tokens + accent system; systemic `gray‑400` contrast (M‑3). |
| 9. Future infra | Types/mock shapes match schema; boundary is clean but entirely unimplemented (H‑5). |
| 10. Testing | **None** — biggest gap (C‑1). |
| 11. Security | No real boundary yet; stub membership guard (H‑5); no secrets in client. |
| 12. Documentation | Matches implementation after the BF/CM correction; route map is aspirational (M‑1). |

---

## CRITICAL

### C‑1 — No automated tests of any kind
- **Severity:** Critical · 📌 Documented only
- **Description:** There is no test runner, no `npm run test` script, and zero unit/integration/UI/
  regression tests. All verification to date is manual (typecheck, build, SSR smoke renders).
- **Why it matters:** The product's core promises are logic‑heavy — date‑rule resolution, prep‑status,
  plan limits, and **non‑destructive campaign reuse** (history must never be overwritten). Without tests,
  regressions in these will ship silently, and there is nothing to protect the multi‑tenant/RLS logic
  when it lands in Phase 5.
- **Recommended solution:** Add **Vitest + @testing-library/react**. Start with pure‑logic unit tests
  (`lib/events` date rules incl. BF/CM, `lib/planning` opportunities/prep, `lib/campaigns` duplication &
  lineage, `lib/search`) and a few component tests (CampaignFormModal validation, CountryManager limits,
  calendar drag reschedule). Wire `test`/`test:watch` scripts and run in CI.
- **Effort:** M (harness + first meaningful suite ≈ 1–2 days).

---

## HIGH

### H‑1 — All application state is client‑side and ephemeral
- **Severity:** High · 📌 Documented only (Phase‑5 boundary)
- **Description:** `app/context/DataContext.tsx` holds every mutable entity in React state seeded from
  mock data. A page reload resets everything; newly created records (and deep links like
  `/app/campaigns?c=<newId>`) do not survive a refresh.
- **Why it matters:** Fine for a preview, but it is the gap between "screens" and a usable product; the
  MVP definition requires persistent data.
- **Recommended solution:** Phase 5 — replace the context with route `loader`/`action`s backed by
  Supabase; keep the same typed shapes so components don't change. Until then, keep expectations framed
  as a preview.
- **Effort:** L (this is Phase 5).

### H‑2 — Black Friday / Cyber Monday recurrence rules can be wrong in some years
- **Severity:** High · ✅ Doc corrected (`BUILD_STATUS.md`); catalog rule 📌 documented only
- **Description:** The catalog encodes Black Friday as **4th Friday of November** and Cyber Monday as
  **last Monday of November** (`app/data/mockGlobalEvents.ts`). `lib/events.ts` resolves these correctly,
  and they match the real dates for **2026**. But the *true* definitions are "day **after** the 4th
  Thursday" (Thanksgiving) and "the Monday after that." When **Nov 1 falls on a Friday** (e.g. 2024/2025
  cadence), the 4th Friday precedes the real Black Friday by a week, and "last Monday" misses Cyber
  Monday — the flagship dates would display wrong.
- **Why it matters:** Black Friday is the single most important date for merchants; a wrong date
  undermines the product's core value and trust.
- **Recommended solution:** Add a `DateRule` kind like `nth_weekday_after` (offset from an anchor weekday)
  or special‑case BF = Thanksgiving+1 and CM = Thanksgiving+4. Add unit tests across 2024–2030. (Left as a
  catalog/business‑data change per audit rules — not modified here.)
- **Effort:** S (rule + tests ≈ half a day).

### H‑3 — Plan‑limit enforcement is UI‑only and downgrade retention is partial
- **Severity:** High · 📌 Documented only (business rule / Phase‑5)
- **Description:** D16 requires that on downgrade, excess data becomes **read‑only under a retention
  policy** (never deleted) and limits are enforced **server‑side**. Today: creating past a limit is
  blocked in the UI with an honest banner (good), but existing over‑limit countries/campaigns remain
  **fully editable**, not read‑only, and enforcement is entirely client‑side.
- **Why it matters:** It's a stated business rule and a monetization guardrail; UI‑only checks are
  trivially bypassable and the retention semantics aren't actually implemented.
- **Recommended solution:** Phase 5 — enforce in server actions; in the UI, render excess records
  read‑only with a clear "over your plan" state. Keep prices/limits in the single plan config (already
  the case).
- **Effort:** M.

### H‑4 — Single global context re‑renders the entire app on any change
- **Severity:** High · 📌 Documented only (architecture)
- **Description:** `DataContext` exposes one value object holding all slices + actions. Any mutation
  (toggle a country, edit a campaign) produces a new context value and re‑renders **every** consumer,
  including unrelated surfaces mounted in the tree.
- **Why it matters:** Acceptable at mock scale, but it's a scalability and maintainability liability: a
  1000‑campaign store would jank, and one mega‑context is hard to reason about and test.
- **Recommended solution:** Prefer route `loader`/`action` data in Phase 5 (naturally scoped per route).
  If client state persists, split into focused contexts (campaigns / catalog / preferences) or adopt a
  selector‑based store (e.g. Zustand) so components subscribe to slices.
- **Effort:** M–L.

### H‑5 — The tenant‑security boundary is entirely unimplemented (by design)
- **Severity:** High · 📌 Documented only (Phase‑5)
- **Description:** `lib/tenant.ts#assertMembership` is a no‑op stub; there are no server loaders/actions,
  no membership validation, and no RLS. All data is client‑side mock, so there is no real exposure today,
  but the app's central security promise (never trust client `storeId`; enforce via membership + RLS) has
  zero implementation or tests.
- **Why it matters:** This is the highest‑risk area for a multi‑tenant SaaS; it must be built and
  **tested** (isolation tests) before any real data exists.
- **Recommended solution:** Phase 5 per `docs/SUPABASE_SCHEMA.md` — server‑side membership resolution +
  RLS + tenant‑isolation tests. Treat the current stub as a placeholder, not a control.
- **Effort:** L (Phase 5).

---

## MEDIUM

### M‑1 — Records use query‑param modals instead of the proposed nested routes
- **Severity:** Medium · 📌 Documented only (architecture)
- **Description:** Detail/edit views open as drawers/modals keyed by `?c=<id>` rather than the
  `app.campaigns.$id` / `.new` nested routes in `ARCHITECTURE_REVIEW.md §5`. There are no per‑record URLs
  that survive reload, and back‑button semantics are shallow.
- **Why it matters:** Deep linking, shareable URLs, and SSR of a specific record are core to a Shopify
  admin app; the current shape also won't map cleanly onto Supabase loaders.
- **Recommended solution:** Before Phase 5, decide the routing model; move record detail/new/edit to
  nested routes with loaders. (Not changed — it's an architecture decision.)
- **Effort:** M.

### M‑2 — Modal & Drawer lack focus management
- **Severity:** Medium · 📌 Documented only (needs care to do right)
- **Description:** `Modal` and `Drawer` handle Escape + backdrop close and set `aria-modal`, but do not
  **trap focus**, set initial focus, or restore focus to the trigger on close.
- **Why it matters:** Keyboard and screen‑reader users can tab out of an open dialog into the page
  behind it — a real accessibility defect for a commercial app.
- **Recommended solution:** Add a small focus‑trap (first/last focusable cycling, initial focus to the
  dialog, return focus on close) or adopt a headless dialog primitive. Kept out of "safe fixes" because
  it needs testing across all modal/drawer usages.
- **Effort:** S–M.

### M‑3 — Systemic low‑contrast `text-gray-400`
- **Severity:** Medium · ✅ Partially fixed
- **Description:** `text-gray-400` (~2.85:1 on white) is used for informational text in ~20 files, below
  WCAG AA (4.5:1). **Fixed** in the shared `Field` and `StatTile` hints (→ `gray-500`); still present in
  several feature components and input placeholders.
- **Why it matters:** Accessibility/readability, and it's a stated V1 requirement.
- **Recommended solution:** Sweep remaining informational `gray-400` text → `gray-500`; keep `gray-400`
  only for decorative icons. Consider a `text-muted` token to enforce it.
- **Effort:** S.

### M‑4 — Duplicated / unmemoized derived computations
- **Severity:** Medium · 📌 Documented only (low value now)
- **Description:** `upcomingOpportunities` is computed twice on the dashboard (in the route **and** in
  `DashboardStats`); `DayDetail` rebuilds `entriesForYear` unmemoized every time the drawer opens.
- **Why it matters:** Wasteful and scales poorly as data grows; also a subtle source of divergence if the
  two dashboard computations drift.
- **Recommended solution:** Compute opportunities once in the route and pass down; memoize DayDetail's
  entries. (Left as‑is to avoid prop‑threading churn during the audit.)
- **Effort:** S.

### M‑5 — framer‑motion is heavy for the effects used
- **Severity:** Medium · 📌 Documented only
- **Description:** framer‑motion accounts for a ~114 kB (≈38 kB gzip) chunk and is used only for simple
  slide/fade on `Modal`, `Drawer`, and `MobileNav`.
- **Why it matters:** Bundle size affects embedded‑app load inside Shopify admin.
- **Recommended solution:** Replace with CSS transitions / a tiny animation helper, or lazy‑load the
  animated shells. Re‑measure after.
- **Effort:** S–M.

### M‑6 — `DataContext` is a 41 kB shared chunk on every route
- **Severity:** Medium · 📌 Documented only
- **Description:** The context module imports all mock data + campaign logic, so ~41 kB (≈14 kB gzip)
  loads on every `/app` route.
- **Why it matters:** Fine for mock, but indicates the data layer isn't code‑split; with real data this
  belongs behind loaders.
- **Recommended solution:** Phase 5 loaders remove this naturally; until then it's acceptable.
- **Effort:** L (folds into Phase 5).

### M‑7 — No route loaders/actions; data is read during render
- **Severity:** Medium · 📌 Documented only (Phase‑5 shape)
- **Description:** Every surface reads from context during render; no `loader`/`action` exports exist
  (beyond `app.tsx` auth). There are therefore no real navigation loading states or server data flow.
- **Why it matters:** The React Router template's whole model is loader/action‑based; deferring this makes
  Phase 5 a larger refactor and hides latency/loading UX today.
- **Recommended solution:** Introduce loaders/actions in Phase 5; the `LoadingState`/`Skeleton` primitives
  already exist to back them.
- **Effort:** L.

### M‑8 — Unchecked `as` casts on `<select>` values
- **Severity:** Medium · 📌 Documented only
- **Description:** Several selects cast `e.target.value as CampaignStatus | EventCategory | Importance`.
  The options are constrained, so it's safe in practice, but the cast bypasses type safety.
- **Why it matters:** A future refactor that changes option sets could silently produce invalid enum
  values with no compile error.
- **Recommended solution:** Add a small `parseEnum(value, allowed)` guard, or validate in the reducer.
- **Effort:** S.

---

## LOW

### L‑1 — Dead code & unused API — ✅ Partly fixed
- **Severity:** Low. Removed `lib/format#joinCodes`, `lib/planEntitlements#formatLimit` (duplicate of
  `formatLimitValue`), and the now‑unused `components/Placeholder.tsx`. **Remaining:** the context
  `canAddCountry` + `usePlan().subscription/canAddCountry` are never consumed (CountryManager computes
  inline). Keep or remove in Phase 5. **Effort:** S.

### L‑2 — `tenant.ts` placeholder params trip `no-unused-vars`
- **Severity:** Low · 📌 Documented only. `_userId/_storeId` are intentional Phase‑5 stub params; ESLint
  isn't configured to honor the `_` prefix. Fix by adding `argsIgnorePattern: "^_"` to the eslint config
  (left unchanged to avoid touching shared tooling config). **Effort:** XS.

### L‑3 — Search debounce calls `setState` inside `useEffect`
- **Severity:** Low · 📌 Documented only. Works fine; flagged by `react-hooks/set-state-in-effect`. Could
  move the "searching" flag into the change handler. **Effort:** XS.

### L‑4 — React Compiler skips memoization on the calendar `useMemo`
- **Severity:** Low · 📌 Documented only. Informational (`preserve-manual-memoization`); no bug. Will
  resolve when the compiler‑friendly patterns are adopted. **Effort:** XS.

### L‑5 — No global 404 / no `root.tsx` ErrorBoundary
- **Severity:** Low · 📌 Documented only. Leaf routes + `app.tsx` have boundaries, but an unmatched path
  or an error above the app layout falls back to React Router's bare default. Add a catch‑all `$.tsx` and
  a friendly root `ErrorBoundary`. **Effort:** S.

### L‑6 — `templateFromCampaign` hardcodes `category: "major_sales"`
- **Severity:** Low · 📌 Documented only. Saving a campaign as a template loses its real category.
  Thread the category (or infer from the linked event). **Effort:** XS.

### L‑7 — Calendar `const now = new Date()` at module scope
- **Severity:** Low · 📌 Documented only. "Today" is frozen for the life of the loaded tab; a long‑lived
  SPA tab would highlight a stale day. Compute per render or refresh on focus. **Effort:** XS.

### L‑8 — React Router v8 future‑flag warnings at build
- **Severity:** Low · 📌 Documented only. Middleware / route‑splitting / Vite‑env changes are coming;
  opt‑in flags early to de‑risk the upgrade. **Effort:** S.

### L‑9 — Search is Topbar‑only (discoverability)
- **Severity:** Low · 📌 Documented only. No sidebar entry for `/app/search`; some users won't find it.
  Consider a nav item or a visible ⌘K hint. **Effort:** XS.

### L‑10 — Scope inconsistency between `.env.example` and `shopify.app.toml`
- **Severity:** Low · 📌 Documented only. `.env.example` suggests `SCOPES=read_products,read_customers`
  while `shopify.app.toml` declares `write_products`. Reconcile to the scopes the app truly needs before
  Phase 5. **Effort:** XS.

---

## Fixes applied in this audit (safe, self‑contained)
1. **Extracted `SearchInput`** primitive; removed 4 duplicated icon‑input blocks (EventCatalog,
   CampaignFilterBar, ProductPicker, CampaignLibrary). *(components / DRY)*
2. **Removed dead code:** `joinCodes`, `formatLimit` (duplicate of `formatLimitValue`),
   `components/Placeholder.tsx`. *(maintainability)*
3. **Accessibility contrast:** `Field` + `StatTile` hint text `gray‑400 → gray‑500`. *(a11y)*
4. **Honesty fix:** removed the non‑functional store‑switcher `ChevronDown` that implied a dropdown.
   *(UX / button‑behavior rule)*
5. **Renamed non‑hook `useTemplate → applyTemplate`** (fixes a `rules-of-hooks` error). *(correctness)*
6. **Fixed `children` passed as a prop** on two `Drawer` fallbacks (`react/no-children-prop`).
7. **Merged a duplicate `lucide-react` import** and **removed an unused `Campaign` import**.
8. **Escaped apostrophes** in four JSX strings (`react/no-unescaped-entities`).
9. **Removed `autoFocus`** from search inputs (`jsx-a11y/no-autofocus`).
10. **Corrected `BUILD_STATUS.md`** over‑statement that BF/CM are "resolved precisely… forward."

**Lint:** 23 → 8 problems (remaining are intentional Phase‑5 stubs + React‑Compiler/informational).
**Typecheck + build:** green after all fixes. All surfaces still SSR‑render without errors.

---

## Recommended priorities before Phase 5
1. **Stand up a test harness** (Vitest + RTL) and cover the logic libs first — especially date rules and
   non‑destructive reuse (C‑1).
2. **Fix the Black Friday / Cyber Monday rule** and test it across years (H‑2) — flagship correctness.
3. **Decide the routing model** (nested record routes + loaders) so it aligns with Supabase (M‑1, M‑7).
4. **Plan the state migration** off the single mega‑context toward loaders/actions or scoped stores
   (H‑4) — the biggest architectural lever for Phase 5.
5. **Finish the accessibility pass** (modal/drawer focus trap, contrast sweep) (M‑2, M‑3).
6. **Design the real plan‑limit + downgrade‑retention behavior** and the tenant‑isolation tests before
   any real data exists (H‑3, H‑5).

_No Phase‑5 work, Shopify/Supabase connections, or paid services were introduced by this audit._
