import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Campaign,
  CampaignStatus,
  StorePreference,
  Subscription,
  Template,
  TenantScope,
} from "~/types/domain";
import { duplicateCampaign as buildDuplicate } from "~/lib/campaigns";
import { toLockedPlanId } from "~/lib/planModel";
import { plans as facadePlans } from "~/data";
import type { BusinessRepository, Catalog, StoreBundle } from "./repository";
import {
  campaignToRow,
  customEventToRow,
  rowToCampaign,
  rowToCountry,
  rowToCustomEvent,
  rowToEventPref,
  rowToGlobalEvent,
  rowToStoreCountry,
  rowToStorePreference,
  rowToSubscription,
  rowToTemplate,
  rowToWorkspaceNote,
  templateToRow,
} from "./mappers";
import {
  assertNoDuplicateCustomEvent,
  assertNoDuplicateTemplateName,
  requireFound,
  validateCampaignInput,
  validateCampaignPatch,
  validateCustomEventInput,
  validateNoteBody,
  validateTemplateInput,
} from "./validation";

/**
 * Supabase implementation of BusinessRepository (MM4 production path).
 *
 * Every method takes a server-resolved `TenantScope`; merchant queries filter by
 * `scope.workspaceId` AND are gated by RLS (`is_workspace_member`) as a second,
 * independent tenant gate — a client-supplied id is never trusted (D23). Deletes
 * are SOFT (set `deleted_at`); reads exclude soft-deleted rows. The client is the
 * RLS-scoped user client (see supabase.server.ts), bound per request.
 *
 * NOTE: code-complete but not exercised by the default test suite — it needs a live
 * Supabase project (documented external gate). The in-memory adapter enforces the
 * identical contract and IS tested (see test/db/persistence.test.ts).
 */
type Row = Record<string, unknown>;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function createSupabaseRepository(client: SupabaseClient): BusinessRepository {
  const ws = (scope: TenantScope) => scope.workspaceId;

  async function fetchCampaign(scope: TenantScope, id: string): Promise<Campaign> {
    const res = await client
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", ws(scope))
      .is("deleted_at", null)
      .maybeSingle();
    return rowToCampaign(requireFound(unwrap(res) as Row | null, "Campaign"));
  }

  return {
    async loadCatalog(): Promise<Catalog> {
      const [countries, events] = await Promise.all([
        client.from("countries").select("*").order("code"),
        client.from("global_events").select("*").order("id"),
      ]);
      return {
        countries: (unwrap(countries) as Row[]).map(rowToCountry),
        plans: facadePlans, // façade display plans; enforcement uses @eventra/entitlements
        globalEvents: (unwrap(events) as Row[]).map(rowToGlobalEvent),
      };
    },

    async loadBundle(scope): Promise<StoreBundle> {
      const wid = ws(scope);
      const [sc, prefs, custom, campaigns, templates, notes, storePref, sub] =
        await Promise.all([
          client.from("workspace_countries").select("*").eq("workspace_id", wid),
          client.from("workspace_event_preferences").select("*").eq("workspace_id", wid),
          client.from("custom_events").select("*").eq("workspace_id", wid).is("deleted_at", null),
          client
            .from("campaigns")
            .select("*")
            .eq("workspace_id", wid)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false }),
          client.from("templates").select("*").eq("workspace_id", wid).is("deleted_at", null),
          client.from("workspace_notes").select("*").eq("workspace_id", wid).is("deleted_at", null),
          client.from("workspace_preferences").select("*").eq("workspace_id", wid).maybeSingle(),
          client
            .from("subscriptions")
            .select("*")
            .eq("organization_id", scope.organizationId)
            .maybeSingle(),
        ]);
      return {
        storeCountries: (unwrap(sc) as Row[]).map(rowToStoreCountry),
        eventPreferences: (unwrap(prefs) as Row[]).map(rowToEventPref),
        customEvents: (unwrap(custom) as Row[]).map(rowToCustomEvent),
        campaigns: (unwrap(campaigns) as Row[]).map(rowToCampaign),
        templates: (unwrap(templates) as Row[]).map(rowToTemplate),
        notes: (unwrap(notes) as Row[]).map(rowToWorkspaceNote),
        preferences: storePref.data
          ? rowToStorePreference(storePref.data as Row)
          : null,
        subscription: sub.data
          ? rowToSubscription(sub.data as Row, wid)
          : null,
      };
    },

    async setCountryEnabled(scope, countryCode, enabled) {
      unwrap(
        await client
          .from("workspace_countries")
          .upsert(
            { workspace_id: ws(scope), country_code: countryCode, enabled },
            { onConflict: "workspace_id,country_code" },
          )
          .select()
          .single(),
      );
    },

    async setEventHidden(scope, globalEventId, hidden) {
      unwrap(
        await client
          .from("workspace_event_preferences")
          .upsert(
            { workspace_id: ws(scope), global_event_id: globalEventId, hidden },
            { onConflict: "workspace_id,global_event_id" },
          )
          .select()
          .single(),
      );
    },

    async createCustomEvent(scope, input, id) {
      validateCustomEventInput(input);
      const existing = (unwrap(
        await client.from("custom_events").select("*").eq("workspace_id", ws(scope)).is("deleted_at", null),
      ) as Row[]).map(rowToCustomEvent);
      assertNoDuplicateCustomEvent(existing, input);
      const row = customEventToRow({ ...input, storeId: ws(scope), ...(id ? { id } : {}) });
      return rowToCustomEvent(
        unwrap(await client.from("custom_events").insert(row).select().single()) as Row,
      );
    },
    async updateCustomEvent(scope, id, patch) {
      const existing = (unwrap(
        await client.from("custom_events").select("*").eq("workspace_id", ws(scope)).is("deleted_at", null),
      ) as Row[]).map(rowToCustomEvent);
      const current = requireFound(existing.find((e) => e.id === id), "Custom event");
      const next = { ...current, ...patch };
      validateCustomEventInput(next);
      assertNoDuplicateCustomEvent(existing, next, id);
      const row = customEventToRow({ ...next, storeId: ws(scope), id });
      delete row.id;
      delete row.workspace_id;
      return rowToCustomEvent(
        unwrap(
          await client
            .from("custom_events")
            .update(row)
            .eq("id", id)
            .eq("workspace_id", ws(scope))
            .is("deleted_at", null)
            .select()
            .single(),
        ) as Row,
      );
    },
    async deleteCustomEvent(scope, id) {
      unwrap(
        await client
          .from("custom_events")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("workspace_id", ws(scope))
          .select(),
      );
    },

    async createCampaign(scope, input, id) {
      validateCampaignInput(input);
      const row = campaignToRow({ ...input, storeId: ws(scope), version: 1, ...(id ? { id } : {}) });
      return rowToCampaign(
        unwrap(await client.from("campaigns").insert(row).select().single()) as Row,
      );
    },
    async updateCampaign(scope, id, patch) {
      const current = await fetchCampaign(scope, id);
      validateCampaignPatch(patch, current);
      const row = campaignToRow(patch);
      delete row.id;
      delete row.workspace_id;
      delete row.version;
      delete row.created_from_id;
      return rowToCampaign(
        unwrap(
          await client
            .from("campaigns")
            .update(row)
            .eq("id", id)
            .eq("workspace_id", ws(scope))
            .is("deleted_at", null)
            .select()
            .single(),
        ) as Row,
      );
    },
    async deleteCampaign(scope, id) {
      unwrap(
        await client
          .from("campaigns")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("workspace_id", ws(scope))
          .select(),
      );
    },
    async duplicateCampaign(scope, id, overrides) {
      const source = await fetchCampaign(scope, id);
      const copy = buildDuplicate(source, overrides);
      copy.storeId = ws(scope);
      copy.version = (source.version ?? 1) + 1;
      const { id: _id, createdAt: _c, updatedAt: _u, ...insertable } = copy;
      const row = campaignToRow(insertable);
      return rowToCampaign(
        unwrap(await client.from("campaigns").insert(row).select().single()) as Row,
      );
    },
    async setCampaignStatus(scope, id, status: CampaignStatus) {
      return this.updateCampaign(scope, id, { status });
    },
    async moveCampaign(scope, id, startDate, endDate) {
      return this.updateCampaign(scope, id, { startDate, endDate });
    },

    async addTemplate(scope, template) {
      validateTemplateInput(template);
      const existing = (unwrap(
        await client.from("templates").select("*").eq("workspace_id", ws(scope)).is("deleted_at", null),
      ) as Row[]).map(rowToTemplate);
      assertNoDuplicateTemplateName(existing, template.name);
      const full: Template = { ...template, storeId: ws(scope), id: template.id ?? "" };
      const row = templateToRow(full);
      if (!full.id) delete row.id;
      return rowToTemplate(
        unwrap(await client.from("templates").insert(row).select().single()) as Row,
      );
    },
    async deleteTemplate(scope, id) {
      unwrap(
        await client
          .from("templates")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("workspace_id", ws(scope))
          .select(),
      );
    },

    async createNote(scope, body, id) {
      const clean = validateNoteBody(body);
      return rowToWorkspaceNote(
        unwrap(
          await client
            .from("workspace_notes")
            .insert({ workspace_id: ws(scope), body: clean, ...(id ? { id } : {}) })
            .select()
            .single(),
        ) as Row,
      );
    },
    async updateNote(scope, id, body) {
      const clean = validateNoteBody(body);
      return rowToWorkspaceNote(
        unwrap(
          await client
            .from("workspace_notes")
            .update({ body: clean })
            .eq("id", id)
            .eq("workspace_id", ws(scope))
            .is("deleted_at", null)
            .select()
            .single(),
        ) as Row,
      );
    },
    async deleteNote(scope, id) {
      unwrap(
        await client
          .from("workspace_notes")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("workspace_id", ws(scope))
          .select(),
      );
    },

    async updatePreferences(scope, patch): Promise<StorePreference> {
      const row: Row = { workspace_id: ws(scope) };
      if (patch.weekStartsOn !== undefined) row.week_starts_on = patch.weekStartsOn;
      if (patch.calendarFormat !== undefined) row.calendar_format = patch.calendarFormat;
      if (patch.reminderDefaults !== undefined) row.reminder_defaults = patch.reminderDefaults;
      if (patch.accent !== undefined) row.accent = patch.accent;
      if (patch.density !== undefined) row.density = patch.density;
      return rowToStorePreference(
        unwrap(
          await client
            .from("workspace_preferences")
            .upsert(row, { onConflict: "workspace_id" })
            .select()
            .single(),
        ) as Row,
      );
    },
    async setPlan(scope, planId): Promise<Subscription> {
      const row = unwrap(
        await client
          .from("subscriptions")
          .upsert(
            {
              organization_id: scope.organizationId,
              plan_id: toLockedPlanId(planId),
              status: "active",
            },
            { onConflict: "organization_id" },
          )
          .select()
          .single(),
      ) as Row;
      return rowToSubscription(row, ws(scope));
    },
  };
}
