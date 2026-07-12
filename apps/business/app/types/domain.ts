/**
 * Eventra domain types — the multi-tenant model from docs/ARCHITECTURE_REVIEW.md §7.
 *
 * Platform-owned entities (Country, GlobalEvent, Plan) have NO storeId.
 * Merchant-owned entities carry `storeId` and are gated by Membership + Supabase RLS
 * in Phase 5. `storeId` from a client is never trusted on its own (see §8).
 */

export type StoreId = string;
export type UserId = string;
/** ISO 3166-1 alpha-2, e.g. "US", "CA". */
export type CountryCode = string;
export type PlanId = "free" | "starter" | "growth" | "vip";
export type MembershipRole = "owner" | "admin" | "staff";

export type EventCategory =
  | "major_sales"
  | "national_holiday"
  | "seasonal"
  | "cultural";

/** Commercial importance of an official date (D11). NOT used for categories. */
export type Importance = "high" | "medium" | "low";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "archived";

/** Kept separate from CampaignStatus in DB and UI (roadmap §7). */
export type EventPrepStatus = "unprepared" | "planning" | "ready" | "passed";

export type SubscriptionStatus = "active" | "past_due" | "canceled";

/**
 * A date or recurrence rule, resolved to a concrete date per year by
 * `lib/events.ts#resolveDateRule`.
 *
 * `offsetDays` shifts the resolved date by a fixed number of days and is the
 * mechanism for holidays defined *relative* to another weekday anchor — e.g.
 * Black Friday = "day after the 4th Thursday of November" (nth_weekday Thu #4,
 * offsetDays 1) and Cyber Monday = "Monday after" (offsetDays 4). Encoding these
 * as an offset from Thanksgiving keeps them correct in every year, unlike a bare
 * "4th Friday" / "last Monday" approximation (see docs/RECURRENCE.md).
 */
export interface DateRule {
  kind: "fixed" | "nth_weekday";
  /** 1–12 */
  month: number;
  /** for kind="fixed": 1–31 */
  day?: number;
  /** for kind="nth_weekday": 0 (Sun) – 6 (Sat) */
  weekday?: number;
  /** for kind="nth_weekday": 1–5, or -1 for "last" */
  nth?: number;
  /** optional fixed shift applied after resolving (e.g. +1 day after an anchor) */
  offsetDays?: number;
}

// ---------- Platform-owned (no storeId) ----------

export interface User {
  id: UserId;
  email: string;
  name: string;
}

export interface Country {
  code: CountryCode;
  name: string;
  /** emoji flag, for lightweight display */
  flag: string;
}

export interface GlobalEvent {
  id: string;
  name: string;
  countryCodes: CountryCode[];
  startRule: DateRule;
  endRule?: DateRule;
  category: EventCategory;
  importance: Importance;
  description?: string;
  /** recommended days of lead time to prepare */
  recommendedLeadDays?: number;
  recurring: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  /** null = unlimited */
  countryLimit: number | null;
  planningHorizonMonths: number;
  /** null = unlimited */
  savedCampaignLimit: number | null;
  features: string[];
}

// ---------- Merchant-owned (carry storeId) ----------

export interface Store {
  id: StoreId;
  shopDomain: string;
  name: string;
}

export interface Membership {
  userId: UserId;
  storeId: StoreId;
  role: MembershipRole;
}

/** Per-store enablement of a country (D25). Country itself has no global enabled flag. */
export interface StoreCountry {
  storeId: StoreId;
  countryCode: CountryCode;
  enabled: boolean;
}

/** Per-store hide/restore of an official global event (D13). Never a global delete. */
export interface StoreEventPreference {
  storeId: StoreId;
  globalEventId: string;
  hidden: boolean;
}

export interface CustomEvent {
  id: string;
  storeId: StoreId;
  name: string;
  startDate: string; // ISO
  endDate?: string; // ISO
  category: EventCategory;
  color?: string;
  description?: string;
  recurring: boolean;
}

/** Visual-only in V1 — never executes anything (D7). */
export interface EventAction {
  id: string;
  label: string;
  done: boolean;
}

export interface Campaign {
  id: string;
  storeId: StoreId;
  name: string;
  globalEventId?: string;
  country?: CountryCode;
  objective?: string;
  description?: string;
  prepStart?: string; // ISO
  startDate: string; // ISO
  endDate: string; // ISO
  offer?: string;
  productRefs?: string[];
  notes?: string;
  status: CampaignStatus;
  actions?: EventAction[];
  /** memory link — reuse creates a new record; never overwrites the source (D15) */
  createdFromId?: string;
  /** memory version — increments along a reuse chain (MM4 Part 7). Optional in the façade. */
  version?: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Template {
  id: string;
  storeId: StoreId;
  name: string;
  category: EventCategory;
  defaultDurationDays: number;
  defaultLeadDays: number;
  offer?: string;
  notes?: string;
}

/** Accent palette choices for Appearance settings (D31 shell uses brand tokens). */
export type AccentColor = "indigo" | "blue" | "emerald" | "violet";

export type Density = "comfortable" | "compact";

export interface StorePreference {
  storeId: StoreId;
  weekStartsOn: 0 | 1;
  calendarFormat: "month" | "year";
  /** days-before reminder milestones */
  reminderDefaults: number[];
  /** Appearance: accent tint applied to brand utilities (default "indigo"). */
  accent?: AccentColor;
  /** Appearance: calendar cell density. */
  density?: Density;
}

export interface Subscription {
  storeId: StoreId;
  planId: PlanId;
  status: SubscriptionStatus;
}

/**
 * Free-form planning note attached to a store/workspace (MM4 persistence). Prepared
 * entity — minimal surface in V1; persisted, audited, and soft-deletable like other
 * merchant records. See docs/MM4_PERSISTENCE.md Part 4.
 */
export interface WorkspaceNote {
  id: string;
  storeId: StoreId;
  body: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * Server-resolved tenant scope (MM4). The Business façade `storeId` maps to a
 * persistent `workspaceId` inside an `organizationId`. Resolved from verified
 * identity server-side — NEVER from client-supplied ids (D23). The legacy
 * `assertMembership`/RLS gate applies on top.
 */
export interface TenantScope {
  userId: UserId;
  organizationId: string;
  organizationName: string;
  /** the façade store id === the persistent workspace id */
  workspaceId: StoreId;
  /** locked-model role (owner|admin|editor|viewer) */
  role: "owner" | "admin" | "editor" | "viewer";
}
