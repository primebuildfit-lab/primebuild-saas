# Eventra — Platform Data Model (conceptual, implementation-ready)

> Conceptual model for the whole platform. **Not provisioned.** Expands `SUPABASE_SCHEMA.md` (the
> Business slice) to all principals/domains. Tenancy keys: **platform** (no tenant), **consumer**
> (`consumer_profile_id`), **org** (`organization_id`, often via `workspace_id`), **advertiser**
> (`advertiser_id`), **admin/platform**. RLS in `RLS_SECURITY_MODEL.md`. Legend for Access: C=consumer
> self, O=org member, Adv=advertiser, A=admin(role), S=service-role.

## Conventions (apply to every table)
- Every table has `id` (uuid), `created_at`, `updated_at`. Tenant-owned tables carry their tenant key
  and are **RLS-gated**. Platform catalog tables are readable by authenticated principals, writable only
  by admin/service. **No hard deletes** of customer/business data — use `archived_at`/`status` +
  retention; deletions cascade only within a tenant on explicit account/workspace deletion (post
  retention window). All admin writes + billing/deal/moderation events are **audit-logged**.

## 1. Identity
| Entity | Owner / Tenant | Key fields | Uniqueness | Access | Retention | Notes/Index |
|--------|----------------|-----------|-----------|--------|-----------|-------------|
| User | platform (auth) | email, auth_provider | email unique | self, A | until account delete (+grace) | one human; may own multiple principals |
| Principal | platform | user_id, kind(consumer/org_member/admin) | (user_id,kind) unique | self, A | with user | maps a user to a principal type |
| ConsumerProfile | consumer | user_id, display_name, country, locale | user_id unique | C(self), A | with user | idx(country) |
| Organization | org | name, owner_user_id, status | — | O(members), A | archive not delete | root business tenant |
| OrganizationMember | org | organization_id, user_id, role | (org,user) unique | O(self+admins), A | with org | idx(org) |
| Role | platform/org | name, scope, permission_set | name unique per scope | O/A | — | org roles + admin roles |
| Permission | platform | key, description | key unique | A | — | referenced by roles |
| Device | consumer/org | principal_id, push_token, platform | token unique | self, A | prune stale | for push |
| Session | platform | principal_id, issued/expires, source | — | self, A | short TTL | never trusted from client |

## 2. Consumer
| Entity | Owner | Key fields | Uniqueness | Access | Retention |
|--------|-------|-----------|-----------|--------|-----------|
| ConsumerSubscription | consumer | profile_id, product(deal_intelligence), status, source | one active per product | C(self), A | history kept |
| ConsumerAddOn | consumer | profile_id, addon(ad_free), status, source | one active ad_free | C(self), A | history kept |
| ConsumerTrial | consumer | profile_id, kind, state, started/ends, used | one per profile+kind | C(self), A | permanent (anti-abuse) |
| FollowedCompany | consumer | profile_id, company_id, enabled | (profile,company) unique | C(self), A | until removed |
| FollowedCategory | consumer | profile_id, offer_category_id, enabled | (profile,cat) unique | C(self), A | until removed |
| OfferPreference | consumer | profile_id, offer_type, notify | (profile,type) unique | C(self), A | until changed |
| NotificationPreference | consumer/org | principal_id, channel, quiet_hours, caps | (principal,channel) | self, A | until changed |
| SavedDeal | consumer | profile_id, deal_id, saved_at | (profile,deal) unique | C(self), A | until removed |
| MutedSource / MutedCompany / MutedCategory | consumer | profile_id, target | unique per target | C(self), A | until removed |

Consumer data is **strictly private** to the profile; never visible to businesses or other consumers.

## 3. Business
| Entity | Owner (tenant) | Key fields | Uniqueness | Access | Retention |
|--------|----------------|-----------|-----------|--------|-----------|
| BusinessSubscription | org | org_id, plan, status, source | one active per org | O(owner/admin), A | history kept |
| BusinessTrial | org | org_id, state, started/ends | one per org | O, A | permanent |
| Workspace | org | org_id, name, status(active/read_only/archived) | (org,name) | O, A | archive not delete; read-only on downgrade |
| CommerceConnection | workspace | workspace_id, platform, external_ref, health | (workspace,platform) | O, A | disconnect keeps records |
| Campaign | workspace | workspace_id, …(existing fields), status, created_from_id | — | O, A | never overwrite; retention by plan |
| CampaignVersion | workspace | campaign_id, snapshot, version | (campaign,version) | O, A | permanent (memory) |
| CampaignTemplate | workspace/org | org_id, structure | — | O, A | until removed |
| CustomEvent | workspace | workspace_id, dates, category | — | O, A | until removed |
| BusinessPreference | workspace | workspace_id, calendar/appearance/reminders | workspace_id unique | O, A | until changed |
| StorefrontWidget | workspace | workspace_id, type, config, enabled | — | O, A | Pro only; disable not delete |
| WidgetPlacement | workspace | widget_id, surface, frequency, schedule | — | O, A | — |
| SupplierOpportunity | workspace | workspace_id, source, window, confidence | — | O, A | expire |
| CompetitorSignal | workspace | workspace_id, company_ref, signal, confidence, source | — | O, A | expire |

One org **never** sees another org's private data. `idx(workspace_id)` on all workspace-owned tables.

## 4. Shared catalog (platform-owned)
| Entity | Owner | Key fields | Uniqueness | Access |
|--------|-------|-----------|-----------|--------|
| Country | platform | code, name, flag | code unique | read all; write A |
| Region | platform | country_code, name | (country,name) | read all; write A |
| EventCategory | platform | key, name | key unique | read all; write A |
| GlobalEvent | platform | name, country_codes[], category, importance, recurring | id | read all; write A |
| EventDateRule | platform (embedded jsonb or table) | kind, month, day/weekday/nth, offsetDays | — | read all; write A |
| Company | platform | name, website, countries[], categories[], status, is_business_customer? | name+country unique-ish | read all(public profile); write A |
| CompanyLocation | platform | company_id, country, region | — | read all; write A |
| OfferCategory | platform | key, name | key unique | read all; write A |
| OfferType | platform | key, name (e.g. %off, BOGO, freeship) | key unique | read all; write A |

Catalog is curated (quality > quantity). Companies registry is shared; **consumers see public profile +
published deals only**.

## 5. Deals (verified deals pipeline — `VERIFIED_DEALS.md`)
| Entity | Owner | Key fields | Uniqueness | Access | Notes |
|--------|-------|-----------|-----------|--------|-------|
| Deal | platform (published) | company_id, offer_type, discount, start/end, country[], category[], status, confidence, classification | dedupe(company+offer+window) | read: published→all(DI-tier for alerts), draft→A/S | classification enum below |
| DealSource | platform | company_id, type, url, trust_weight | — | A/S | legal/approved sources only |
| DealEvidence | platform (unpublished) | deal_id, source_id, snapshot, captured_at | — | **A/S only** (never consumers) | pre-publish evidence |
| DealVerification | platform | deal_id, admin_id, decision, reason | — | A/S | audit |
| DealConfidence | platform | deal_id, score, signals | deal_id | A/S; score shown on published | |
| DealCountry / DealCategory | platform | deal_id, code | unique per pair | read published | scope |
| DealRevision | platform | deal_id, change, version | — | A/S; visible if published | correction history |
| DealRetraction | platform | deal_id, reason, at | deal_id | A/S; notice to consumers | unpublish |
| DealReport | consumer→platform | deal_id, profile_id, reason | (deal,profile) | C(create), A(review) | user-reported inaccuracy |

**Deal classification (locked labels):** `Confirmed Official Deal` · `Publicly Published Deal` ·
`Strongly Supported Likely Deal` · `Historical Pattern` · `Unverified Possibility`. Uncertain classes
must be visually distinct and **never** marketed as guaranteed.

## 6. Advertising (`ADVERTISING.md`)
| Entity | Owner | Key fields | Uniqueness | Access |
|--------|-------|-----------|-----------|--------|
| Advertiser | advertiser/platform | name, account_ref, status | — | Adv(self), A |
| AdCampaign | advertiser | advertiser_id, schedule, budget, priority, freq_cap, status | — | Adv(self), A |
| AdCreative | advertiser | campaign_id, asset, copy, cta, landing | — | Adv(self), A |
| AdPlacement | platform | surface, slot | (surface,slot) | A; served by S |
| AdTargeting | advertiser | campaign_id, countries[], categories[] | — | Adv(self), A |
| AdSchedule | advertiser | campaign_id, start/end, pacing | — | Adv(self), A |
| AdImpression / AdClick / AdConversion | platform (event) | campaign_id, creative_id, consumer_id?, ts, region | — | Adv(aggregate), A; S writes | no cross-site PII |
| PromotionEntitlement | platform | org_id(Pro), inventory grant, fair-use state | org_id | O(view), A | Pro consumer-promo exposure |

Advertisers see only **their own** campaigns/results. Ad events carry no PII beyond the owning consumer
id (RLS for user-facing; aggregated for advertiser/admin).

## 7. Billing (`BILLING_ARCHITECTURE.md`)
| Entity | Owner | Key fields | Uniqueness | Access | Notes |
|--------|-------|-----------|-----------|--------|-------|
| BillingAccount | consumer or org | principal_ref, provider_customer_ids{} | one per principal | self(view), A | maps to providers |
| ExternalSubscription | billing | account_id, provider, external_id, product, status | (provider,external_id) unique | S/A; self(view) | Play/Apple/Stripe/Shopify |
| PurchaseReceipt | billing | account_id, provider, token, verified, payload | provider token unique | S/A | receipt verification |
| Entitlement | billing→engine | account_id, key, source, expires | (account,key,source) | S/A; self(view) | reconciled state |
| Trial | billing | account_id, kind, state | one per account+kind | S/A; self(view) | mirrors ConsumerTrial/BusinessTrial |
| BillingEvent | billing | account_id, type, provider, before/after | — | S/A | append-only audit |
| Refund | billing | account_id, provider_ref, amount, reason | provider_ref unique | S/A | |
| GracePeriod | billing | account_id, reason, ends | — | S/A; self(view) | read-only window |

**No card data stored** — only provider references/receipts.

## 8. Notifications (`NOTIFICATIONS.md`)
| Entity | Owner | Key fields | Uniqueness | Access |
|--------|-------|-----------|-----------|--------|
| Notification | principal | principal_id, type, payload, critical? | — | self, A |
| NotificationPreference | principal | (see §2) | — | self, A |
| NotificationDelivery | platform | notification_id, channel, status, attempts | — | S/A; self(status) |
| NotificationTemplate | platform | key, channel, locale, body | (key,channel,locale) | A |
| NotificationJob | platform | trigger, scheduled_at, dedupe_key, state | dedupe_key unique | S/A |

## 9. Admin
| Entity | Owner | Key fields | Uniqueness | Access |
|--------|-------|-----------|-----------|--------|
| AdminUser | platform | user_id, status, mfa | user_id unique | A(superadmin) |
| AdminRole | platform | name, permission_set | name unique | A(superadmin) |
| AdminAction / AuditLog | platform | admin_id, action, target, before/after, ts, ip | append-only | A(read by role) |
| ModerationCase | platform | subject_ref, type, state, notes | — | A |
| FeatureFlag | platform | key, targeting, state | key unique | A |
| SystemSetting | platform | key, value, type, history | key unique | A |
| HealthIncident | platform | service, severity, state, ts | — | A |

## 10. Key uniqueness & index summary
Uniques: `users.email`, one active subscription per (principal, product), one active `ad_free` per
consumer, one trial per (principal, kind), `(profile,company)` follow, `(org,name)` workspace,
`(provider, external_id)` external subscription, provider receipt token, `country.code`, `offer_type.key`.
Indexes: every tenant table on its tenant key; `deals` on `(status, company_id)`, `(country, category)`;
ad events on `(campaign_id, ts)`; notifications on `(principal_id, created_at)`; audit on `(target, ts)`.

## 11. Retention & deletion (summary)
Customer/business data is archived/read-only, never hard-deleted on downgrade. Account deletion honors a
retention window then cascades within the tenant. Deal **evidence** and audit logs follow platform
retention (longer, admin-only). Consumer data export/delete honored (`AD_PRIVACY.md`).
