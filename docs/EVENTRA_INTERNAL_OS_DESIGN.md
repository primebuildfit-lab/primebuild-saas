# Eventra Internal OS — Design System (`EVENTRA_INTERNAL_OS_DESIGN.md`)

The private administrative panel (Nivel A). A dark, information-dense **command
center** — deep blue-black surfaces + violet brand. Own identity; organizational
inspiration only (Stripe / Linear / Vercel / Grafana / Shopify Admin / Notion /
Raycast), no copied components or branding. Lives in `apps/admin/src/os`.

> This is NOT Eventra Business (Nivel B, light), NOT the Shopify-embedded app, NOT
> the mobile version, NOT Nexus/Partnera, NOT a marketing page.

## Palette (`os/theme.css`, `.eos` scope)

| Token | Value | Use |
| --- | --- | --- |
| `--background` / `--background-alt` | `#07111f` / `#081522` | app background |
| `--sidebar` | `#06101b` | sidebar (darker) |
| `--topbar` | `#091522` | topbar |
| `--surface` / `--surface-elevated` / `--surface-hover` | `#0e1a29` / `#111f30` / `#142538` | cards / insets / hover |
| `--border` / `--border-strong` | `rgba(148,163,184,.12)` / `.22` | borders |
| `--text-primary` / `--text-secondary` / `--text-muted` | `#f8fafc` / `#94a3b8` / `#64748b` | text |
| `--brand-primary` / `--brand-secondary` / `--brand-soft` | `#7c4dff` / `#6d4aff` / `rgba(124,77,255,.16)` | brand (violet) |
| `--success` `--info` `--warning` `--danger` `--magenta` | `#84cc16` `#38bdf8` `#f59e0b` `#ef4444` `#ec4899` | status |

Radius 12px (cards) / 8px (chips). Backward-compat `--eos-*` aliases keep older
engine screens working. `color-scheme` dark; `prefers-reduced-motion` honored.

## Typography

`Inter` (then Geist / system-ui). Page title 22–26px/700 · subtitle 13–15px
secondary · card title 13–15px/600 · **metric 32px/700** · table 12–13px · nav
label 13.5px. No decorative fonts.

## Layout

`Sidebar 228px` (fixed, 100vh, own scroll) + `Topbar 64px` (sticky) + content
(padding 22–24px, fluid, never scrolls horizontally). Sidebar collapses to 64px.

## Obligatory components (`os/ui.tsx` + `os/Shell.tsx`)

`InternalOsShell` (Shell), `InternalSidebar`, `InternalTopbar`, `SearchCommand`
(⌘K), `PageHeader`, `Card`/`CardHead`, `MetricCard`, `MetricTrend`, `ChartCard`,
`Donut`, `DataTable`, `ActivityFeed`, `StatusBadge`, `PriorityBadge`, `EmptyState`,
`ErrorState`, `LoadingSkeleton`, `DateRangePicker`, `FilterDropdown`,
`SystemStatusIndicator`, `QuickActionButton`, plus `ProgressBar`, `Pill`, `Money`,
`Percent`, `ScoreBar`, `DevBadge`. No duplicated equivalents.

## Accessibility

Keyboard nav + focus, `aria-current` on active branch, roles on dialogs/menus,
tables scroll on mobile, `prefers-reduced-motion` guard. Formal axe audit pending.

## Responsive

Desktop = full composition. Tablet (≤1080px): metrics 2×2, dashboard row-2 stacks.
Mobile (≤860px): sidebar becomes a drawer, metrics single column, secondary topbar
controls hide. The desktop grid is never compressed — it re-flows.
