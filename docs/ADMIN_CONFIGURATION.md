# Eventra — Admin Configuration Coverage (design)

> What Brian can control from the Admin Console (desktop/tablet/mobile) so commercial rules live in
> **config**, not hardcoded across apps. **Design only.** Backed by `SystemSetting` + `FeatureFlag` +
> the `config` package (`ENTITLEMENTS.md §9`, `PLATFORM_SCHEMA.md §9`). Every change is audit-logged;
> price/limit changes are versioned. IA in `ADMIN_CONSOLE.md`.

## Principle
Any commercial rule that may reasonably change is **Admin-configurable** and read from one source by all
surfaces + server enforcement. No rule duplicated in `apps/consumer|business|admin`.

## Consumer configuration
| Setting | Configurable |
|---------|--------------|
| Core calendar | enabled countries, event visibility, seasonal windows |
| Countries | catalog add/edit/enable |
| Companies | registry, monitored flag, sources |
| Followed-company analytics | view engagement/follow counts |
| Deal Intelligence | feature toggles, follow fair-use limit, DI country count |
| Ad-Free status | per-user view; add-on independence enforced (cannot bundle without explicit change) |
| Add-on combinations | view the four states (A/B/C/D); no illegal combos allowed |
| Consumer trial | length (default 30d), reminders, eligibility/anti-abuse, extensions |
| Offer types | catalog of offer types/categories |
| Notification filters | default lead time, caps, quiet-hour policy |
| Company-monitoring status | per-company monitoring on/off, source health |

## Business configuration
| Setting | Configurable |
|---------|--------------|
| Plans | prices, names, feature flags (single source) |
| Workspace limits | 1/2/3/∞ per plan (+ fair-use ceiling) |
| Country limits | per plan |
| Planning horizons | years per plan (1/4/10) |
| Promotion-widget permissions | which widget types, per plan, guardrails |
| Consumer-app promo eligibility | Pro promo inventory, moderation, fair-use |
| Trials | 45-day duration, reminders, extensions |
| Downgrade/read-only states | retention windows, "which workspace stays active" default |
| Integrations | enable adapters, health, config |
| Competitor/public intelligence | enable per plan, source lists |

## Deals configuration
Sources (add/trust weight), verification workflow, confidence thresholds + push policy, approvals,
retractions, corrections, user-report handling, company disputes. (`VERIFIED_DEALS.md`,
`COMPANY_MONITORING.md`.)

## Advertising configuration
PrimeBuild campaigns; Business-Pro promotional inventory + fair-use; placements; moderation; scheduling;
targeting (country/category); frequency caps; impressions/clicks/conversions reporting; Ad-Free
exclusions. (`ADVERTISING.md`.)

## Billing configuration
Provider adapters (enable/disable), subscription source mapping, entitlement maps, trial settings, grace
periods, refunds, restore-purchase handling, reconciliation, billing-event log. No secrets shown; keys
server-only. (`BILLING_ARCHITECTURE.md`.)

## System configuration
Feature flags (per surface/cohort/%), numeric limits, notification rules/templates, provider health, job
queues, logs, audit history, app versions + min-supported + rollout controls, and **emergency disable
switches** (kill-switches for ads, monitoring, a provider, a widget type, or a surface).

## Change safety
Price/limit/entitlement changes are **versioned** with effective dates and audited; feature flags
support gradual rollout + instant kill; destructive/global changes confirm (some need a second admin).
Consumer add-on **independence** and approved prices are protected: the UI warns and requires explicit
confirmation to change them (they are approved business rules).

## Open decisions
Which settings are Superadmin-only vs delegated; effective-date scheduling for price changes; config
change-approval workflow.
