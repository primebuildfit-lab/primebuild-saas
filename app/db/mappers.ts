import type {
  Campaign,
  Country,
  CustomEvent,
  EventAction,
  GlobalEvent,
  Plan,
  StoreCountry,
  StoreEventPreference,
  StorePreference,
  Subscription,
  Template,
} from "~/types/domain";

/**
 * Pure row <-> domain mappers (snake_case DB <-> camelCase domain). Kept free of
 * any DB/secret imports so they are fully unit-testable (test/db/mappers.test.ts).
 */
type Row = Record<string, unknown>;

// ---------- catalog ----------
export const rowToCountry = (r: Row): Country => ({
  code: r.code as string,
  name: r.name as string,
  flag: r.flag as string,
});

export const rowToPlan = (r: Row): Plan => ({
  id: r.id as Plan["id"],
  name: r.name as string,
  priceMonthly: r.price_monthly as number,
  countryLimit: (r.country_limit as number | null) ?? null,
  planningHorizonMonths: r.planning_horizon_months as number,
  savedCampaignLimit: (r.saved_campaign_limit as number | null) ?? null,
  features: (r.features as string[]) ?? [],
});

export const rowToGlobalEvent = (r: Row): GlobalEvent => ({
  id: r.id as string,
  name: r.name as string,
  countryCodes: (r.country_codes as string[]) ?? [],
  startRule: r.start_rule as GlobalEvent["startRule"],
  endRule: (r.end_rule as GlobalEvent["endRule"]) ?? undefined,
  category: r.category as GlobalEvent["category"],
  importance: r.importance as GlobalEvent["importance"],
  description: (r.description as string | null) ?? undefined,
  recommendedLeadDays: (r.recommended_lead_days as number | null) ?? undefined,
  recurring: Boolean(r.recurring),
});

// ---------- merchant ----------
export const rowToStoreCountry = (r: Row): StoreCountry => ({
  storeId: r.store_id as string,
  countryCode: r.country_code as string,
  enabled: Boolean(r.enabled),
});

export const rowToEventPref = (r: Row): StoreEventPreference => ({
  storeId: r.store_id as string,
  globalEventId: r.global_event_id as string,
  hidden: Boolean(r.hidden),
});

export const rowToCustomEvent = (r: Row): CustomEvent => ({
  id: r.id as string,
  storeId: r.store_id as string,
  name: r.name as string,
  startDate: r.start_date as string,
  endDate: (r.end_date as string | null) ?? undefined,
  category: r.category as CustomEvent["category"],
  color: (r.color as string | null) ?? undefined,
  description: (r.description as string | null) ?? undefined,
  recurring: Boolean(r.recurring),
});

export const customEventToRow = (
  e: Omit<CustomEvent, "id"> & { id?: string },
): Row => ({
  ...(e.id ? { id: e.id } : {}),
  store_id: e.storeId,
  name: e.name,
  start_date: e.startDate,
  end_date: e.endDate ?? null,
  category: e.category,
  color: e.color ?? null,
  description: e.description ?? null,
  recurring: e.recurring,
});

export const rowToCampaign = (r: Row): Campaign => ({
  id: r.id as string,
  storeId: r.store_id as string,
  name: r.name as string,
  globalEventId: (r.global_event_id as string | null) ?? undefined,
  country: (r.country as string | null) ?? undefined,
  objective: (r.objective as string | null) ?? undefined,
  description: (r.description as string | null) ?? undefined,
  prepStart: (r.prep_start as string | null) ?? undefined,
  startDate: r.start_date as string,
  endDate: r.end_date as string,
  offer: (r.offer as string | null) ?? undefined,
  productRefs: (r.product_refs as string[]) ?? [],
  notes: (r.notes as string | null) ?? undefined,
  status: r.status as Campaign["status"],
  actions: (r.actions as EventAction[]) ?? [],
  createdFromId: (r.created_from_id as string | null) ?? undefined,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

/** Domain campaign -> insertable/updatable row (omits server-managed fields). */
export const campaignToRow = (c: Partial<Campaign>): Row => {
  const row: Row = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) row[k] = v;
  };
  set("store_id", c.storeId);
  set("name", c.name);
  set("global_event_id", c.globalEventId ?? null);
  set("country", c.country ?? null);
  set("objective", c.objective ?? null);
  set("description", c.description ?? null);
  set("prep_start", c.prepStart ?? null);
  set("start_date", c.startDate);
  set("end_date", c.endDate);
  set("offer", c.offer ?? null);
  set("product_refs", c.productRefs);
  set("notes", c.notes ?? null);
  set("status", c.status);
  set("actions", c.actions);
  set("created_from_id", c.createdFromId ?? null);
  return row;
};

export const rowToTemplate = (r: Row): Template => ({
  id: r.id as string,
  storeId: r.store_id as string,
  name: r.name as string,
  category: r.category as Template["category"],
  defaultDurationDays: r.default_duration_days as number,
  defaultLeadDays: r.default_lead_days as number,
  offer: (r.offer as string | null) ?? undefined,
  notes: (r.notes as string | null) ?? undefined,
});

export const templateToRow = (t: Template): Row => ({
  id: t.id,
  store_id: t.storeId,
  name: t.name,
  category: t.category,
  default_duration_days: t.defaultDurationDays,
  default_lead_days: t.defaultLeadDays,
  offer: t.offer ?? null,
  notes: t.notes ?? null,
});

export const rowToStorePreference = (r: Row): StorePreference => ({
  storeId: r.store_id as string,
  weekStartsOn: (r.week_starts_on as 0 | 1) ?? 0,
  calendarFormat: r.calendar_format as StorePreference["calendarFormat"],
  reminderDefaults: (r.reminder_defaults as number[]) ?? [30, 14, 7, 1],
  accent: (r.accent as StorePreference["accent"]) ?? "indigo",
  density: (r.density as StorePreference["density"]) ?? "comfortable",
});

export const rowToSubscription = (r: Row): Subscription => ({
  storeId: r.store_id as string,
  planId: r.plan_id as Subscription["planId"],
  status: r.status as Subscription["status"],
});
