# Eventra — Security & RLS Model (all principals)

> Expands `SECURITY_PLAN.md` (Business-only) to the whole platform. **Design only.** Defense-in-depth:
> server loaders/actions resolve the principal + authorization per request; **RLS** is a second,
> independent gate at the database. Related: `PLATFORM_SCHEMA.md`, `ENTITLEMENTS.md`.

## 1. Principals & identity
Four authenticated principal kinds, each with its own auth adapter → a short-lived signed **RLS JWT**
carrying `sub` (principal id), `kind`, and role claims:
- **Consumer** — consumer auth (email/OAuth); `auth.uid()` = consumer profile's user id.
- **Org member** — Shopify session **or** other-platform OAuth **or** email; claims carry `user_id`;
  membership resolves org/workspace access server-side.
- **Advertiser** — advertiser portal auth (future); scoped to own advertiser.
- **Admin** — internal SSO + MFA; separate JWT audience + RBAC.
- **Service role** — narrow, task-specific workers (monitoring, notifications, billing webhooks); no
  interactive login; least privilege per job.

## 2. Never trust a client-submitted value
The server/RLS must **derive** — never accept from the client — any of:
`user_id · organization_id · workspace_id · store_id · subscription state · plan · entitlement · trial
status · billing result · deal verification status · admin role`. The client may send *hints* (e.g., a
workspace id to open); the server validates membership + RLS enforces. Entitlements come only from the
engine (`ENTITLEMENTS.md`), never from a client flag.

## 3. Access rules (authoritative)
| Principal | May access |
|-----------|-----------|
| Consumer | **own** private data only (subscriptions, add-on, follows, prefs, saved deals, notifications) |
| Consumer (shared) | **published** deals, public company profiles, platform catalog (read) |
| Org member | only **authorized org/workspace(s)**, gated by membership + role |
| One business | **never** another business's private data |
| Advertiser | **own** campaigns/creatives/results only |
| Admin | only **explicitly permissioned** actions, **fully audited** |
| Service worker | **narrow** task-specific rows (e.g., notifications job reads prefs + writes deliveries) |
| Unpublished deal **evidence** | admin/service only — never consumers or businesses |
| Billing data | principal sees own summary; secrets/receipts server-only |

## 4. RLS helper predicates (extends `is_store_member`)
```
is_self(profile)         := profile.user_id = auth.uid()
is_org_member(org)       := EXISTS(SELECT 1 FROM organization_members m
                             WHERE m.organization_id = org AND m.user_id = auth.uid())
has_org_role(org, roles) := is_org_member(org) AND member.role = ANY(roles)
can_workspace(ws)        := is_org_member((SELECT org FROM workspaces WHERE id = ws))
is_admin(perm)           := jwt.kind='admin' AND perm = ANY(jwt.permissions)   # + audit
is_advertiser(adv)       := jwt.kind='advertiser' AND jwt.sub = adv
```
- Consumer tables: `USING/ WITH CHECK (is_self(profile_id))`.
- Workspace tables: `USING/WITH CHECK (can_workspace(workspace_id))` (+ role for writes).
- Org tables: `is_org_member(org_id)` (+ `has_org_role` for billing/settings).
- Catalog/published: `SELECT` for authenticated; writes admin/service only (no policy = denied).
- Deal evidence/advertiser/billing: no consumer/org policy → denied; admin/service via role.

## 5. Server validation layer (defense-in-depth)
Every request: authenticate principal → resolve tenant (org/workspace/profile) from verified identity →
check entitlement → then query with the principal's RLS client. Writes also re-check limits
(workspace/country/horizon/follow) server-side. RLS `WITH CHECK` blocks a write into another tenant even
if server code had a bug.

## 6. Cross-product boundaries (the top risk)
Hard lines: **consumer ↔ business** (consumer sees only *published* business data — never campaigns,
memory, unpublished submissions/evidence), **org ↔ org**, **advertiser ↔ advertiser**, **principal ↔
admin**. Ad targeting reads only consumer country/categories/consent. Verified-deal alerts read
published deals + consumer follows — never business-private planning.

## 7. Isolation-test matrix (must pass before any real data)
| # | Actor | Attempts | Expected |
|---|-------|----------|----------|
| 1 | Consumer A | read Consumer B follows/prefs/saved | **denied** |
| 2 | Consumer | read unpublished deal evidence/draft | **denied** |
| 3 | Consumer | read a business's campaigns/memory | **denied** |
| 4 | Consumer | write a deal verification/confidence | **denied** |
| 5 | Org1 member | read/write Org2 workspace/campaign | **denied** |
| 6 | Org member (Viewer) | write campaign / change billing | **denied** (role) |
| 7 | Org member | exceed workspace/country/horizon limit | **denied** (entitlement) |
| 8 | Client | submit forged org_id/workspace_id/store_id | **ignored**; server derives |
| 9 | Client | submit forged plan/entitlement/trial/billing flag | **ignored**; engine authoritative |
| 10 | Advertiser A | read Advertiser B campaigns/results | **denied** |
| 11 | Consumer/Org | read another principal's billing receipts | **denied** |
| 12 | Admin without perm X | perform action X | **denied** + audited attempt |
| 13 | Service worker (notifications) | read/write outside its task scope | **denied** |
| 14 | Expired/downgraded org | write to read-only excess workspace | **denied**; data still readable |
| 15 | Consumer trial expired | use Deal Intelligence write | **denied**; prefs preserved read-only |
| 16 | Anonymous/guest | read any tenant-private data | **denied** |

## 8. Other controls
Rate limiting on monitoring/notification jobs; audit on all admin + billing + deal + moderation writes;
MFA for admins; short-TTL RLS JWTs; secrets server-only; Supabase advisors reviewed each migration
(`ADMIN_CONSOLE.md → Security`). Company monitoring uses only legally accessible/approved sources
(`COMPANY_MONITORING.md`) — no auth bypass or restricted-data extraction.

## 9. Open decisions
Admin permission granularity; advertiser-portal auth (future); whether consumer↔org identity linking is
ever offered (default: never auto-linked); data-residency requirements per country.
