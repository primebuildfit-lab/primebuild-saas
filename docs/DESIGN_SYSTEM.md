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
