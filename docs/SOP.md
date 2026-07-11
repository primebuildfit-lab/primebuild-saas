# Eventra — Builder Mode SOP

> Standard operating procedure for AI-assisted development (priority #4).

## Source of truth priority
1. Latest direct instruction from the user
2. `docs/PRODUCT_ROADMAP.md`
3. `docs/BUSINESS_RULES.md`
4. This SOP / `CLAUDE.md`
5. Existing implementation

Never use older PrimeBuild assumptions to override Eventra requirements.

## Decision log
Maintain `docs/DECISIONS.md` with approved product decisions (identity, plan names/prices,
color meaning, country limits, calendar behavior, what's V1, what's postponed). Never silently
change an approved business rule.

## Progress tracker
Maintain `docs/BUILD_STATUS.md`. For each section: Not Started / In Progress / Ready for Review
/ Approved / Blocked. Also list files created, packages installed, known limitations, next task.

## Mock data rule
All mock data lives in dedicated files (`src/data/mockEvents.ts`, `mockCampaigns.ts`,
`mockCountries.ts`, `mockTemplates.ts`, ...). Never scatter fake data through components.

## Component rule
Pages compose reusable components; no oversized single-file pages. Example:
`DashboardPage → StatsGrid, UpcomingOpportunities, ActiveCampaigns, SavedCampaigns, QuickActions`.

## Button behavior rule
Every visible primary button must: open a working modal, navigate to a working route, update
local visual state, or be clearly marked disabled/coming-soon. No fake-functional buttons.

## Event removal rule
Official dates belong to the global approved catalog. Hiding one stores a per-store hidden
preference and is restorable; never a global delete. Custom merchant events delete normally.

## Repeat rule
Official and merchant recurring events default Repeat-next-year = ON; user can disable before
saving or later.

## Importance color rule
Green = high, Yellow = medium, Red = niche/low. Do NOT use these for categories — categories
get a separate visual indicator so priority and category are never confused.

## Plan names
Free · Starter $10 · Growth $20 · VIP $50. Do not use Pro/Advanced unless officially changed.

## First task (this phase)
Do **not** write application code yet:
1. Detect contradictions, missing decisions, duplicated requirements.
2. Produce a consolidated V1 scope.
3. Propose the project folder structure.
4. Propose the page/route map.
5. Propose the reusable component map.
6. Create `docs/DECISIONS.md`.
7. Create `docs/BUILD_STATUS.md`.
8. Explain how this is built as an independent multi-store Shopify app using PrimeBuild only
   as the first dev/test store.
9. **Stop and wait for approval** before generating the application.

Do not build the dashboard until the architecture review is approved.
