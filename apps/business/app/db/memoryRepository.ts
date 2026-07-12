/**
 * In-memory BusinessRepository (MM4). A real persistence engine — not a stub —
 * backing the default `mock`/`memory` modes and every persistence test. Data is
 * held per workspace, so two workspaces are fully ISOLATED (Part 6). A serializable
 * `snapshot()` / restore round-trip proves "survives reload" without a live DB
 * (Part 4). Soft-delete + audit + campaign versioning match the SQL schema (Part 7).
 *
 * No server-only or secret imports — usable in jsdom/node tests directly.
 */
import type {
  Campaign,
  CampaignStatus,
  CustomEvent,
  StoreCountry,
  StoreEventPreference,
  StorePreference,
  Subscription,
  Template,
  TenantScope,
  WorkspaceNote,
} from "~/types/domain";
import {
  campaigns as seedCampaigns,
  customEvents as seedCustomEvents,
  countries as catalogCountries,
  globalEvents as seedGlobalEvents,
  plans as facadePlans,
  demoStoreCountries,
  demoStorePreference,
  demoSubscription,
  storeEventPreferences as seedEventPrefs,
  templates as seedTemplates,
} from "~/data";
import { createId } from "~/lib/id";
import { duplicateCampaign as buildDuplicate } from "~/lib/campaigns";
import type { BusinessRepository, Catalog, StoreBundle } from "./repository";
import { RepositoryError } from "./repository";
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

type Soft<T> = T & { deletedAt?: string | null };

interface WorkspaceState {
  storeCountries: StoreCountry[];
  eventPreferences: StoreEventPreference[];
  customEvents: Soft<CustomEvent>[];
  campaigns: Soft<Campaign>[];
  templates: Soft<Template>[];
  notes: Soft<WorkspaceNote>[];
  preferences: StorePreference | null;
  subscription: Subscription | null;
}

export interface MemorySnapshot {
  workspaces: Record<string, WorkspaceState>;
}

function emptyState(): WorkspaceState {
  return {
    storeCountries: [],
    eventPreferences: [],
    customEvents: [],
    campaigns: [],
    templates: [],
    notes: [],
    preferences: null,
    subscription: null,
  };
}

/** Build demo-seeded state for a workspace, stamping every record with its id. */
export function buildSeedState(workspaceId: string): WorkspaceState {
  const stamp = <T extends { storeId: string }>(rows: readonly T[]): T[] =>
    rows.map((r) => ({ ...r, storeId: workspaceId }));
  return {
    storeCountries: demoStoreCountries.map((c) => ({ ...c, storeId: workspaceId })),
    eventPreferences: seedEventPrefs.map((p) => ({ ...p, storeId: workspaceId })),
    customEvents: stamp(seedCustomEvents),
    campaigns: stamp(seedCampaigns),
    templates: stamp(seedTemplates),
    notes: [],
    preferences: {
      ...demoStorePreference,
      storeId: workspaceId,
      accent: "indigo",
      density: "comfortable",
    },
    subscription: { ...demoSubscription, storeId: workspaceId },
  };
}

const clone: <T>(v: T) => T =
  typeof structuredClone === "function"
    ? (v) => structuredClone(v)
    : (v) => JSON.parse(JSON.stringify(v));

const catalog: Catalog = {
  countries: catalogCountries,
  plans: facadePlans,
  globalEvents: seedGlobalEvents,
};

export interface InMemoryBusinessRepository extends BusinessRepository {
  /** Deep, serializable copy of all workspaces (retention-faithful: keeps soft-deleted). */
  snapshot(): MemorySnapshot;
  /** Seed a workspace with demo data (idempotent — no-op if it already has state). */
  seedWorkspace(workspaceId: string): void;
}

export interface MemoryRepositoryOptions {
  snapshot?: MemorySnapshot;
  /** workspace ids to auto-seed with demo data at construction. */
  seedWorkspaceIds?: string[];
}

export function createMemoryRepository(
  opts: MemoryRepositoryOptions = {},
): InMemoryBusinessRepository {
  const db: Map<string, WorkspaceState> = new Map();
  if (opts.snapshot) {
    for (const [ws, state] of Object.entries(opts.snapshot.workspaces)) {
      db.set(ws, clone(state));
    }
  }

  const stateFor = (scope: TenantScope): WorkspaceState => {
    let s = db.get(scope.workspaceId);
    if (!s) {
      s = emptyState();
      db.set(scope.workspaceId, s);
    }
    return s;
  };

  const live = <T extends Soft<{ id: string }>>(rows: T[]): T[] =>
    rows.filter((r) => !r.deletedAt);

  const strip = <T>(row: Soft<T & { id: string }>): T => {
    const { deletedAt: _d, ...rest } = row;
    return rest as unknown as T;
  };

  const seedWorkspace = (workspaceId: string) => {
    if (!db.has(workspaceId)) db.set(workspaceId, buildSeedState(workspaceId));
  };

  for (const ws of opts.seedWorkspaceIds ?? []) seedWorkspace(ws);

  const repo: InMemoryBusinessRepository = {
    snapshot() {
      const workspaces: Record<string, WorkspaceState> = {};
      for (const [ws, state] of db.entries()) workspaces[ws] = clone(state);
      return { workspaces };
    },

    seedWorkspace,

    async loadCatalog() {
      return clone(catalog);
    },

    async loadBundle(scope) {
      const s = stateFor(scope);
      const bundle: StoreBundle = {
        storeCountries: clone(s.storeCountries),
        eventPreferences: clone(s.eventPreferences),
        customEvents: live(s.customEvents).map((e) => clone(strip<CustomEvent>(e))),
        campaigns: live(s.campaigns)
          .map((c) => clone(strip<Campaign>(c)))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        templates: live(s.templates).map((t) => clone(strip<Template>(t))),
        notes: live(s.notes).map((n) => clone(strip<WorkspaceNote>(n))),
        preferences: s.preferences ? clone(s.preferences) : null,
        subscription: s.subscription ? clone(s.subscription) : null,
      };
      return bundle;
    },

    // ── countries ──
    async setCountryEnabled(scope, countryCode, enabled) {
      const s = stateFor(scope);
      const existing = s.storeCountries.find((c) => c.countryCode === countryCode);
      if (existing) existing.enabled = enabled;
      else s.storeCountries.push({ storeId: scope.workspaceId, countryCode, enabled });
    },

    // ── events ──
    async setEventHidden(scope, globalEventId, hidden) {
      const s = stateFor(scope);
      const existing = s.eventPreferences.find((p) => p.globalEventId === globalEventId);
      if (existing) existing.hidden = hidden;
      else s.eventPreferences.push({ storeId: scope.workspaceId, globalEventId, hidden });
    },

    // ── custom events ──
    async createCustomEvent(scope, input, id) {
      const s = stateFor(scope);
      validateCustomEventInput(input);
      assertNoDuplicateCustomEvent(live(s.customEvents), input);
      const event: CustomEvent = { ...input, id: id ?? createId("cev"), storeId: scope.workspaceId };
      s.customEvents.push({ ...event });
      return clone(event);
    },
    async updateCustomEvent(scope, id, patch) {
      const s = stateFor(scope);
      const row = requireFound(
        live(s.customEvents).find((e) => e.id === id),
        "Custom event",
      );
      const next = { ...strip<CustomEvent>(row), ...patch, id, storeId: scope.workspaceId };
      validateCustomEventInput(next);
      assertNoDuplicateCustomEvent(live(s.customEvents), next, id);
      Object.assign(row, next);
      return clone(strip<CustomEvent>(row));
    },
    async deleteCustomEvent(scope, id) {
      const s = stateFor(scope);
      const row = requireFound(live(s.customEvents).find((e) => e.id === id), "Custom event");
      row.deletedAt = new Date().toISOString();
    },

    // ── campaigns ──
    async createCampaign(scope, input, id) {
      const s = stateFor(scope);
      validateCampaignInput(input);
      const now = new Date().toISOString();
      const campaign: Campaign = {
        ...input,
        id: id ?? createId("cmp"),
        storeId: scope.workspaceId,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      s.campaigns.push({ ...campaign });
      return clone(campaign);
    },
    async updateCampaign(scope, id, patch) {
      const s = stateFor(scope);
      const row = requireFound(live(s.campaigns).find((c) => c.id === id), "Campaign");
      validateCampaignPatch(patch, strip<Campaign>(row));
      // Never allow client to overwrite identity/audit/memory-link fields.
      const { id: _i, storeId: _s, createdAt: _c, createdFromId: _f, version: _v, ...safe } = patch;
      Object.assign(row, safe, { updatedAt: new Date().toISOString() });
      return clone(strip<Campaign>(row));
    },
    async deleteCampaign(scope, id) {
      const s = stateFor(scope);
      const row = requireFound(live(s.campaigns).find((c) => c.id === id), "Campaign");
      row.deletedAt = new Date().toISOString();
    },
    async duplicateCampaign(scope, id, overrides) {
      const s = stateFor(scope);
      const source = requireFound(live(s.campaigns).find((c) => c.id === id), "Campaign");
      const copy = buildDuplicate(strip<Campaign>(source), overrides);
      copy.storeId = scope.workspaceId;
      copy.version = (source.version ?? 1) + 1; // memory chain version (never overwrites source)
      s.campaigns.push({ ...copy });
      return clone(copy);
    },
    async setCampaignStatus(scope, id, status: CampaignStatus) {
      return repo.updateCampaign(scope, id, { status });
    },
    async moveCampaign(scope, id, startDate, endDate) {
      return repo.updateCampaign(scope, id, { startDate, endDate });
    },

    // ── templates ──
    async addTemplate(scope, template) {
      const s = stateFor(scope);
      validateTemplateInput(template);
      assertNoDuplicateTemplateName(live(s.templates), template.name);
      const full: Template = { ...template, storeId: scope.workspaceId };
      if (!full.id) full.id = createId("tpl");
      s.templates.push({ ...full });
      return clone(full);
    },
    async deleteTemplate(scope, id) {
      const s = stateFor(scope);
      const row = requireFound(live(s.templates).find((t) => t.id === id), "Template");
      row.deletedAt = new Date().toISOString();
    },

    // ── notes ──
    async createNote(scope, body, id) {
      const s = stateFor(scope);
      const clean = validateNoteBody(body);
      const now = new Date().toISOString();
      const note: WorkspaceNote = {
        id: id ?? createId("note"),
        storeId: scope.workspaceId,
        body: clean,
        createdAt: now,
        updatedAt: now,
      };
      s.notes.push({ ...note });
      return clone(note);
    },
    async updateNote(scope, id, body) {
      const s = stateFor(scope);
      const clean = validateNoteBody(body);
      const row = requireFound(live(s.notes).find((n) => n.id === id), "Note");
      row.body = clean;
      row.updatedAt = new Date().toISOString();
      return clone(strip<WorkspaceNote>(row));
    },
    async deleteNote(scope, id) {
      const s = stateFor(scope);
      const row = requireFound(live(s.notes).find((n) => n.id === id), "Note");
      row.deletedAt = new Date().toISOString();
    },

    // ── preferences + plan ──
    async updatePreferences(scope, patch) {
      const s = stateFor(scope);
      const base: StorePreference = s.preferences ?? {
        storeId: scope.workspaceId,
        weekStartsOn: 0,
        calendarFormat: "month",
        reminderDefaults: [30, 14, 7, 1],
        accent: "indigo",
        density: "comfortable",
      };
      s.preferences = { ...base, ...patch, storeId: scope.workspaceId };
      return clone(s.preferences);
    },
    async setPlan(scope, planId) {
      const s = stateFor(scope);
      s.subscription = { storeId: scope.workspaceId, planId, status: "active" };
      return clone(s.subscription);
    },
  };

  return repo;
}

/** Guard export so callers can detect the not-found/duplicate error type. */
export { RepositoryError };
