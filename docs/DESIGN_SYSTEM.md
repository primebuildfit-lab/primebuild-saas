# Eventra Design System (`DESIGN_SYSTEM.md`)

> Phase 7, Bloque 2. A dark, information-dense system for the Internal OS, intended to become the shared
> base for Eventra, Partnera, and Nexus. Applied to Eventra first.

## Principles

Priority: **speed, visible information, filters, search, comparison, mass administration, minimal clicks,
security, clarity, maintainability.** Not: decorative animation, empty space, giant cards, effects that
reduce information density.

## Tokens (`apps/admin/src/os/theme.css`, `.eos` scope)

Dark slate surfaces (`--eos-bg #0b0f17`, `--eos-surface #111827`, …), indigo accent (`--eos-brand #6366f1`)
— Eventra's own identity, not Shopify's palette. Status tones: good/warn/bad. 10px radius.

## Components (`apps/admin/src/os/ui.tsx`)

`Panel`, `PageTitle`, `Btn`, `StatCard`, `Pill` (status), `Money`, `Percent`, `ScoreBar`, `DataTable`
(`Column<T>`), `Toolbar`, `Select`, `DevBadge`. Shell: `Shell` (sidebar/topbar/command palette),
`CommandPalette`, `EnvBadge`.

## Per-product theming (planned shared kit)

The kit is designed to swap by product: logo, name, accent color, navigation, icons, available modules —
via CSS variables + injected nav (mirrors the `@eventra/ui` `AppShell` pattern). Generic components stay in
the shared core; product-specific screens stay in each app.

## Accessibility (Bloque 24)

Keyboard nav, focus, aria labels on controls, `aria-current` on active nav, reduced-motion honored,
tables scroll safely on mobile. Formal audit pending (Playwright/axe) — documented gap.

## Status

Implemented **inside `apps/admin`** now. Extraction to `@eventra/ui` (so Partnera/Nexus consume the same
kit) is the next design-system step — not done this phase.

## Business (Nivel B) surface — DARK commercial redesign (2026-07-13)

> **Supersedes the light-SaaS note below.** By owner decision (2026-07-13), the Business app now uses the
> **dark, premium commercial identity** — deep slate canvas + indigo/violet accent — matching the Internal OS
> family. Trade-off acknowledged and accepted: inside Shopify Admin's light chrome the dark app is visually
> distinct; it is designed primarily for the standalone/PWA commercial experience. The Shopify pre-cert freeze
> is intentionally broken and must be re-verified.

**Tokens** live in `apps/business/app/app.css` `@theme` and Tailwind v4 generates utilities from them:
`--color-canvas #0b0f17` (app bg), `--color-surface #111827` (cards), `--color-surface-2`, `--color-elevated`,
`--color-line` / `--color-line-strong` (borders), `--color-ink` / `--color-ink-muted` / `--color-ink-faint`
(text), `--color-accent` (indigo), and status tones `--color-ok/warn/err/info`. `color-scheme: dark` +
global `prefers-reduced-motion` guard. Every shared primitive and the shell consume these tokens, so screens
theme from one place. Nav is reorganised into five commercial groups (Planning / Create / Knowledge /
Resources / Company); the calendar is one tool inside an opportunity-first product.

### Legacy note (pre-2026-07-13, historical)

The Business app previously kept a **light, professional SaaS** system (CLAUDE.md §3): white surfaces, brand accent
tokens, clean borders, moderate radius. The opportunity-first reorg **did not change** colors, branding, or
typography — only organization, hierarchy, and priority. It added reusable primitives to
`apps/business/app/components/ui` that all modules compose (no duplicates):

- **`MetricCard`** — clickable KPI card with sub-metrics + optional footer; the dashboard's doorway cards.
- **`ScoreBadge`** — 0–100 opportunity-score chip; **solid** color bands, deliberately distinct from the
  ring-style importance `Badge` tones so score ≠ importance (D11).
- **`DataTable`** — generic table wrapped in `overflow-x-auto`; columns can `hideOnMobile` so tables stay
  usable on phones.
- **`Toolbar`** — responsive search/filter ↔ sort/actions row for list surfaces.
- **`FilterChips`** — single-select chips with counts + an "All" reset (null = unfiltered).

Responsive contract preserved: desktop → tablet → mobile; wide content scrolls within its own container, the
page body never scrolls horizontally.
