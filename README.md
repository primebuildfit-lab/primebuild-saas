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
**Phase 0 — Architecture & Product Lock.** No application code yet. Architecture Review **approved with
amendments**; Architecture Lock awaiting final go-ahead. See `docs/BUILD_STATUS.md`.

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

## Status
Phase 1 — Foundation is code-complete (52 app files). Build verification is pending a
connected environment (the Cowork cloud session blocks the npm registry). See `docs/BUILD_STATUS.md`.
