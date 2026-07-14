# Eventra — Business Product Redesign Report (Master Specification)

**Date:** 2026-07-13 · **Scope:** frontend + design only (`apps/business`).
**Backend untouched:** live Supabase, migrations, persistence seam, business rules unchanged; **no** deploy,
OAuth, or Shopify install performed. This report covers execution of the 4-part **Eventra Product Master
Specification** and supersedes the Phase-9 report (dark redesign), which it builds on.

> **Owner decisions honored:** dark commercial identity; proceed on current branch (pre-cert freeze broken,
> must be re-verified). Executed continuously without stopping between modules, per the spec.

---

## Architecture
- React Router 7 + Shopify-embedded + PWA, Tailwind v4 (dark tokens in `app.css`), pure engines
  (`lib/opportunities.ts`, `lib/planning.ts`), tenant data via `DataContext` (mock/file/Supabase seam).
- **Opportunity-first**: everything derives from the scored opportunity set; the calendar is one view.
- Single design-token source; shell + shared primitives consume it → screens theme from one place.
- Promotion persistence rides the existing Campaign model + `/app/data` server-action seam (no schema change).

## Screens redesigned
- **Dashboard** ✅ — decision center ("what to do today"): country scope selector, primary actions, real KPI
  cards, Needs-attention, Recommended-today (labelled rules-based, not fake AI), 30–90 day timeline, activity.
- **Calendar** ✅ — annual **heatmap** default + inline accordion month expansion + legend.
- **Opportunities** ✅ engine + explainable **score breakdown** (`ScoreBreakdown` + `scoreFactors`); table/
  filters pre-existing. (Full detail drawer = remaining.)
- **Promotion Builder** ✅ — new 6-step wizard, saves a real campaign/advertisement.
- **Campaign Library** ✅ — grouped by opportunity/country, "Reuse next year", reuse chains, honest empty state.
- **Campaigns / Memory** ✅ — memory tabs + reuse (from Phase 9).
- **Content, Templates, Media, Audiences, Analytics, Countries, Sources, Team, Billing, Settings, AI,
  Integrations** 🟡 — dark-themed and functional with honest empty states, **not** individually restructured
  to the full spec this phase (remaining).

## Components created
`YearHeatmap`, `PromotionBuilder` (route), `CountrySelector`, `ScoreBreakdown` (+ `scoreFactors()`), new
dashboard blocks (ActionTile, Kpi, Panel, AttentionRow, RecommendationCard), `/app/memory` (Phase 9).

## Components reused (no duplication)
AppShell, Sidebar, Topbar, MobileNav, Brand, NavLinks, PageHeader, MetricCard, StatTile, Card, Button, Badge,
StatusPill, ScoreBadge, DataTable, Toolbar, FilterChips, SegmentedControl, SearchInput, Field, FormControls,
Drawer, Modal, ConfirmDialog, Tabs, Toggle, EmptyState, States, ColorDot, ProductPicker, CampaignFormModal,
CampaignLibrary, MonthView.

## Files modified (principal)
- `lib/nav.ts` (+ `test/lib/nav.test.ts`) — master-spec navigation.
- `features/calendar/YearHeatmap.tsx` (new); `routes/app.calendar.tsx` (annual default + heatmap).
- `routes/app.promotion-builder.tsx` (new); `routes/app.campaigns.tsx` (quick-create seam, Phase 9).
- `components/ui/{ScoreBreakdown,CountrySelector}.tsx` (new) + `index.ts`; `lib/opportunities.ts` (`scoreFactors`).
- `routes/app._index.tsx` — country scope + real KPI/attention/recommended/timeline.
- `app.css` + shell + all `components/ui/*` + every Business screen (dark, Phase 9).
- Tests: `test/components/{dashboard,builder-calendar}.test.tsx`.
- Docs: `PRODUCT_VISION.md`, `PROMOTION_BUILDER.md`, `CALENDAR_ENGINE.md`, `DESIGN_SYSTEM.md`,
  `CHANGELOG.md`, `BUILD_STATUS.md`, this report.

## Tests executed
All existing tests kept green (+ updated `nav.test.ts`). Added dashboard + promotion-builder + calendar render
tests. **Total: 191 passing (25 files).**

## Build status
`react-router typegen && tsc --noEmit` ✅ 0 errors · `eslint` ✅ 0 errors (pre-existing style warnings only) ·
`vitest run` ✅ 191/191 · `react-router build` ✅ 2696 modules · preview server serves `/app`,
`/app/promotion-builder`, `/app/calendar?view=year`, `/app/campaign-library` all **HTTP 200**.

## Performance
No new heavy deps; pure engines memoized; dashboard derives from in-memory tenant data; calendar heat computed
once per entry set. Server-side pagination/virtualization for large lists remains pre-existing debt (not regressed).

## Accessibility
Keyboard nav, focus rings, `aria-current` active nav, roles on dialogs/drawers/switches/tablists, tables scroll
on mobile, **global `prefers-reduced-motion` guard**. Dark palette chosen for contrast. Formal axe/Playwright
audit still pending.

## Documentation updated
PRODUCT_VISION, PROMOTION_BUILDER, CALENDAR_ENGINE (new); DESIGN_SYSTEM, CHANGELOG, BUILD_STATUS, this report.
Still to refresh: PROJECT_CONTEXT, ARCHITECTURE, BUSINESS_INFORMATION_ARCHITECTURE, ROADMAP, TESTING,
UX_GUIDELINES, CAMPAIGN_MEMORY.

## Remaining technical debt (honest)
- **Modules not restructured** (only themed): Content (4 workspaces), Templates (versioning + library),
  Analytics (visual query builder + saved views), Countries (management center), Sources (status DB),
  Audiences (comparison), AI page, Integrations center, Team, Billing (45-day-trial flow), Settings sections.
- **Opportunities**: full detail drawer wiring `ScoreBreakdown`, all sort/filter/view modes, Events news-feed.
- **Calendar**: Quarter/Agenda/Timeline/Compare views, richer filter bar, drag-reschedule in heatmap.
- **Command palette** + unified global search across all entities.
- **Responsive** re-verification at every listed breakpoint; formal a11y audit; list virtualization.
- **Backend-blocked (out of frontend scope):** Promotions & Advertisements as **distinct entities** (schema),
  real analytics/performance data, historical memory metrics (CTR/conversions/revenue), source sync engine,
  AI provider wiring. These need migrations/services/credentials — intentionally not faked.

## Recommendations for V2
1. Add a `Promotion` + `Advertisement` schema (campaign = container) so the builder persists first-class.
2. Performance data pipeline (from Shopify orders + ad platforms) to unlock real analytics, score
   "competition/historical success", and campaign memory metrics.
3. Source ingestion service (government/industry/RSS/API) feeding real opportunities + change detection.
4. Extract the dark design system into `@eventra/ui` shared kit (Eventra/Partnera/Nexus).

## Acceptance criteria (master spec)
| Criterion | Status |
| --- | --- |
| Dashboard completely redesigned | ✅ |
| Annual Calendar redesigned | ✅ |
| Opportunities the main feature | ✅ (engine + score; detail drawer remaining) |
| Promotion Builder implemented | ✅ (persists as campaign; own schema = V2) |
| Campaign Library redesigned | ✅ |
| Templates / Content / Countries / Sources / Analytics redesigned | 🟡 themed, not restructured |
| Billing polished | 🟡 themed |
| Navigation unified | ✅ |
| Design system reused | ✅ |
| Responsive validated | 🟡 preserved, not re-audited at all breakpoints |
| Accessibility validated | 🟡 preserved + reduced-motion; formal axe pending |
| No fake metrics / graphs / placeholders-as-real | ✅ |
| Tests green / Build green / Docs updated | ✅ |

## Final classification

### `EVENTRA BUSINESS EXPERIENCE PARTIAL`

The **opportunity-first spine** of the master spec is implemented, verified, and green: dark identity, unified
navigation, decision-center dashboard with country scope, annual calendar heatmap, explainable opportunity
score, the **Promotion Builder**, and the Campaign Library memory/reuse loop. It is **PARTIAL** because several
principal modules (Content, Templates, Analytics, Countries, Sources, Audiences, AI, Integrations, Team,
Billing, Settings) were **re-themed but not individually restructured** to the full spec, and because
Promotions/Advertisements as distinct entities plus all real-performance analytics require **backend work
outside this frontend phase**. Per the spec's own rule, "Completed" is not claimed just because it compiles —
the remaining work is documented above, and the foundation makes it incremental and low-risk.
