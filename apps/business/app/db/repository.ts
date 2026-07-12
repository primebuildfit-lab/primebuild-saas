/**
 * BusinessRepository — the persistence contract (MM4, Part 4/5).
 *
 * A single interface implemented by every persistence mode (in-memory/file for
 * dev + tests, Supabase for production). Server actions and the data context
 * depend ONLY on this contract, so switching modes never touches callers.
 *
 * Every write takes a server-resolved `TenantScope` (never a client id). The
 * repository returns FAÇADE domain objects (`storeId`), mapping to the persistent
 * org/workspace model internally. Pure types only — no IO here.
 */
import type {
  Campaign,
  CampaignStatus,
  Country,
  CustomEvent,
  GlobalEvent,
  Plan,
  StoreCountry,
  StoreEventPreference,
  StorePreference,
  Subscription,
  Template,
  TenantScope,
  WorkspaceNote,
} from "~/types/domain";

/** Platform-owned catalog (read-only, shared across tenants). */
export interface Catalog {
  countries: Country[];
  plans: Plan[];
  globalEvents: GlobalEvent[];
}

/** All merchant-owned data for one workspace (one loader payload). */
export interface StoreBundle {
  storeCountries: StoreCountry[];
  eventPreferences: StoreEventPreference[];
  customEvents: CustomEvent[];
  campaigns: Campaign[];
  templates: Template[];
  notes: WorkspaceNote[];
  preferences: StorePreference | null;
  subscription: Subscription | null;
}

export interface BusinessRepository {
  // ── reads ──
  loadCatalog(): Promise<Catalog>;
  loadBundle(scope: TenantScope): Promise<StoreBundle>;

  // ── countries ──
  setCountryEnabled(scope: TenantScope, countryCode: string, enabled: boolean): Promise<void>;

  // ── events (hide/restore, never global delete — D13) ──
  setEventHidden(scope: TenantScope, globalEventId: string, hidden: boolean): Promise<void>;

  // ── custom events ──
  createCustomEvent(
    scope: TenantScope,
    input: Omit<CustomEvent, "id" | "storeId">,
  ): Promise<CustomEvent>;
  updateCustomEvent(
    scope: TenantScope,
    id: string,
    patch: Partial<CustomEvent>,
  ): Promise<CustomEvent>;
  deleteCustomEvent(scope: TenantScope, id: string): Promise<void>;

  // ── campaigns (+ memory versioning — D15) ──
  createCampaign(
    scope: TenantScope,
    input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">,
  ): Promise<Campaign>;
  updateCampaign(scope: TenantScope, id: string, patch: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(scope: TenantScope, id: string): Promise<void>;
  duplicateCampaign(
    scope: TenantScope,
    id: string,
    overrides?: Partial<Campaign>,
  ): Promise<Campaign>;
  setCampaignStatus(scope: TenantScope, id: string, status: CampaignStatus): Promise<Campaign>;
  moveCampaign(
    scope: TenantScope,
    id: string,
    startDate: string,
    endDate: string,
  ): Promise<Campaign>;

  // ── templates ──
  addTemplate(scope: TenantScope, template: Omit<Template, "storeId">): Promise<Template>;
  deleteTemplate(scope: TenantScope, id: string): Promise<void>;

  // ── notes ──
  createNote(scope: TenantScope, body: string): Promise<WorkspaceNote>;
  updateNote(scope: TenantScope, id: string, body: string): Promise<WorkspaceNote>;
  deleteNote(scope: TenantScope, id: string): Promise<void>;

  // ── preferences + plan ──
  updatePreferences(
    scope: TenantScope,
    patch: Partial<StorePreference>,
  ): Promise<StorePreference>;
  setPlan(scope: TenantScope, planId: Subscription["planId"]): Promise<Subscription>;
}

/** Thrown for validation / integrity / authorization failures (Part 7). */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_found"
      | "duplicate"
      | "validation"
      | "forbidden"
      | "conflict",
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
