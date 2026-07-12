import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Campaign,
  CustomEvent,
  PlanId,
  StorePreference,
  Template,
} from "~/types/domain";
import { duplicateCampaign as buildDuplicate } from "~/lib/campaigns";
import {
  campaignToRow,
  customEventToRow,
  rowToCampaign,
  rowToCountry,
  rowToCustomEvent,
  rowToEventPref,
  rowToGlobalEvent,
  rowToPlan,
  rowToStoreCountry,
  rowToStorePreference,
  rowToSubscription,
  rowToTemplate,
  templateToRow,
} from "./mappers";

/**
 * Data access for the Eventra pilot. Every function takes an RLS-scoped client
 * (built from the verified user identity) and, for merchant tables, the server-
 * resolved `storeId` — never a client-supplied one. RLS is a second gate.
 */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

// ---------- catalog (platform-owned, read-only) ----------
export async function loadCatalog(client: SupabaseClient) {
  const [countries, plans, events] = await Promise.all([
    client.from("countries").select("*").order("code"),
    client.from("plans").select("*"),
    client.from("global_events").select("*").order("id"),
  ]);
  return {
    countries: (unwrap(countries) as Record<string, unknown>[]).map(rowToCountry),
    plans: (unwrap(plans) as Record<string, unknown>[]).map(rowToPlan),
    globalEvents: (unwrap(events) as Record<string, unknown>[]).map(rowToGlobalEvent),
  };
}

// ---------- store bundle (all merchant data for one store) ----------
export async function loadStoreBundle(client: SupabaseClient, storeId: string) {
  const [sc, prefs, custom, campaigns, templates, storePref, sub] =
    await Promise.all([
      client.from("store_countries").select("*").eq("store_id", storeId),
      client.from("store_event_preferences").select("*").eq("store_id", storeId),
      client.from("custom_events").select("*").eq("store_id", storeId),
      client.from("campaigns").select("*").eq("store_id", storeId).order("updated_at", { ascending: false }),
      client.from("templates").select("*").eq("store_id", storeId),
      client.from("store_preferences").select("*").eq("store_id", storeId).maybeSingle(),
      client.from("subscriptions").select("*").eq("store_id", storeId).maybeSingle(),
    ]);
  return {
    storeCountries: (unwrap(sc) as Record<string, unknown>[]).map(rowToStoreCountry),
    eventPreferences: (unwrap(prefs) as Record<string, unknown>[]).map(rowToEventPref),
    customEvents: (unwrap(custom) as Record<string, unknown>[]).map(rowToCustomEvent),
    campaigns: (unwrap(campaigns) as Record<string, unknown>[]).map(rowToCampaign),
    templates: (unwrap(templates) as Record<string, unknown>[]).map(rowToTemplate),
    preferences: storePref.data
      ? rowToStorePreference(storePref.data as Record<string, unknown>)
      : null,
    subscription: sub.data
      ? rowToSubscription(sub.data as Record<string, unknown>)
      : null,
  };
}

// ---------- countries ----------
export async function setCountryEnabled(
  client: SupabaseClient,
  storeId: string,
  countryCode: string,
  enabled: boolean,
) {
  return unwrap(
    await client
      .from("store_countries")
      .upsert(
        { store_id: storeId, country_code: countryCode, enabled },
        { onConflict: "store_id,country_code" },
      )
      .select()
      .single(),
  );
}

// ---------- event hide / restore ----------
export async function setEventHidden(
  client: SupabaseClient,
  storeId: string,
  globalEventId: string,
  hidden: boolean,
) {
  return unwrap(
    await client
      .from("store_event_preferences")
      .upsert(
        { store_id: storeId, global_event_id: globalEventId, hidden },
        { onConflict: "store_id,global_event_id" },
      )
      .select()
      .single(),
  );
}

// ---------- custom events ----------
export async function insertCustomEvent(
  client: SupabaseClient,
  storeId: string,
  input: Omit<CustomEvent, "id" | "storeId">,
): Promise<CustomEvent> {
  const row = customEventToRow({ ...input, storeId });
  return rowToCustomEvent(
    unwrap(await client.from("custom_events").insert(row).select().single()) as Record<string, unknown>,
  );
}

export async function updateCustomEvent(
  client: SupabaseClient,
  storeId: string,
  id: string,
  patch: Partial<CustomEvent>,
) {
  const row = customEventToRow({ ...(patch as CustomEvent), storeId, id });
  delete row.id;
  delete row.store_id;
  return unwrap(
    await client.from("custom_events").update(row).eq("id", id).eq("store_id", storeId).select().single(),
  );
}

export async function deleteCustomEvent(client: SupabaseClient, storeId: string, id: string) {
  unwrap(await client.from("custom_events").delete().eq("id", id).eq("store_id", storeId).select());
}

// ---------- campaigns ----------
export async function insertCampaign(
  client: SupabaseClient,
  storeId: string,
  input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">,
): Promise<Campaign> {
  const row = campaignToRow({ ...input, storeId });
  return rowToCampaign(
    unwrap(await client.from("campaigns").insert(row).select().single()) as Record<string, unknown>,
  );
}

export async function updateCampaign(
  client: SupabaseClient,
  storeId: string,
  id: string,
  patch: Partial<Campaign>,
): Promise<Campaign> {
  const row = campaignToRow(patch);
  delete row.store_id;
  return rowToCampaign(
    unwrap(
      await client.from("campaigns").update(row).eq("id", id).eq("store_id", storeId).select().single(),
    ) as Record<string, unknown>,
  );
}

export async function deleteCampaign(client: SupabaseClient, storeId: string, id: string) {
  unwrap(await client.from("campaigns").delete().eq("id", id).eq("store_id", storeId).select());
}

/** Reuse = read source (RLS), build a NEW linked draft, insert. Never overwrites. */
export async function duplicateCampaign(
  client: SupabaseClient,
  storeId: string,
  id: string,
  overrides?: Partial<Campaign>,
): Promise<Campaign> {
  const source = rowToCampaign(
    unwrap(
      await client.from("campaigns").select("*").eq("id", id).eq("store_id", storeId).single(),
    ) as Record<string, unknown>,
  );
  const copy = buildDuplicate(source, overrides);
  const { id: _id, createdAt: _c, updatedAt: _u, ...insertable } = copy;
  return insertCampaign(client, storeId, insertable);
}

// ---------- templates ----------
export async function insertTemplate(client: SupabaseClient, template: Template) {
  return rowToTemplate(
    unwrap(await client.from("templates").insert(templateToRow(template)).select().single()) as Record<string, unknown>,
  );
}

export async function deleteTemplate(client: SupabaseClient, storeId: string, id: string) {
  unwrap(await client.from("templates").delete().eq("id", id).eq("store_id", storeId).select());
}

// ---------- preferences + plan (pilot) ----------
export async function updatePreferences(
  client: SupabaseClient,
  storeId: string,
  patch: Partial<StorePreference>,
) {
  const row: Record<string, unknown> = { store_id: storeId };
  if (patch.weekStartsOn !== undefined) row.week_starts_on = patch.weekStartsOn;
  if (patch.calendarFormat !== undefined) row.calendar_format = patch.calendarFormat;
  if (patch.reminderDefaults !== undefined) row.reminder_defaults = patch.reminderDefaults;
  if (patch.accent !== undefined) row.accent = patch.accent;
  if (patch.density !== undefined) row.density = patch.density;
  return unwrap(
    await client.from("store_preferences").upsert(row, { onConflict: "store_id" }).select().single(),
  );
}

export async function setPlan(client: SupabaseClient, storeId: string, planId: PlanId) {
  return unwrap(
    await client
      .from("subscriptions")
      .upsert({ store_id: storeId, plan_id: planId, status: "active" }, { onConflict: "store_id" })
      .select()
      .single(),
  );
}
