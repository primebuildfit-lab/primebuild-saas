# Eventra (Calendar Engine)

> Working repo name: `primebuild-saas` · Brand: **Eventra** (`eventra.com`)

A marketing **planning and campaign-memory** system for online merchants — delivered first
as a **Shopify app**, architected as a multi-tenant SaaS. Not a personal calendar: Eventra
helps stores see upcoming sales opportunities, prepare campaigns early, and reuse what worked.

**Core promise:** never miss a sales opportunity, and never rebuild a winning campaign from zero.

---

## ⚠️ Independence from PrimeBuild
Eventra is a standalone product. PrimeBuild is only the **first test store** — no PrimeBuild
branding, colors, code, accounts, or logic anywhere. See `CLAUDE.md`.

## Status
**Installation phase — Business product complete on mock data; certified `READY FOR SHOPIFY
AUTHORIZATION`.** The Business app (12 screens) runs on a typed mock/file persistence layer with a
Supabase org/workspace adapter + RLS designed and unit-tested (not yet provisioned). Plans and roles
have a single canonical source (`@eventra/config` / `@eventra/identity`); server-side role enforcement
gates every write; the app ships a PWA manifest + service worker. Remaining work is Brian-gated
(Shopify credentials, a separate Supabase project, deploy/install). See `docs/BUILD_STATUS.md` and
`docs/STABILIZATION_2026-07-13.md`.

## Stack (locked)
**Shopify official React Router app template** · React · TypeScript · Tailwind CSS · Framer Motion ·
date-fns · dnd-kit. Backend: a **separate, new Supabase project** (Postgres + Auth + RLS). Tenant
isolation via server-validated `Membership` + RLS — never trust a client `storeId`. See `docs/DECISIONS.md`.

## Docs
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Permanent rules for AI/dev — read before every task |
| `docs/ARCHITECTURE_REVIEW.md` | Consolidated scope, structure, routes, components, open questions |
| `docs/DECISIONS.md` | Decision log (approved + open) |
| `docs/BUILD_STATUS.md` | Progress tracker |
| `docs/PRODUCT_ROADMAP.md` | Roadmap & MVP plan (source of truth #2) |
| `docs/BUSINESS_RULES.md` | Product vision & rules (#3) |
| `docs/SOP.md` | Builder-mode SOP (#4) |

## Plans
Free ($0 · 1 country) · Starter ($10 · 2) · Growth ($20 · 3) · VIP ($50 · unlimited).

## Getting started (in an environment where npm is reachable)
```bash
npm install
npm run typecheck   # react-router typegen + tsc
npm run build       # production build
npm run dev         # local dev server
```
> Phases 1–4 run on mock data — no Shopify or Supabase credentials needed. Real
> Shopify/Supabase env vars (see `.env.example`) are wired in Phase 5.

> _(Historical note: an earlier draft of this README described the project as "Phase 0 — no code yet."
> That is obsolete. The code is the source of truth — see `docs/BUILD_STATUS.md`.)_
