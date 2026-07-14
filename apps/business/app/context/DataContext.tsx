import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Campaign,
  CampaignStatus,
  Country,
  CustomEvent,
  GlobalEvent,
  Membership,
  Plan,
  PlanId,
  Store,
  StoreCountry,
  StoreEventPreference,
  StorePreference,
  Subscription,
  Template,
  User,
} from "~/types/domain";
import {
  campaigns as seedCampaigns,
  countries as catalog,
  customEvents as seedCustomEvents,
  demoMembership,
  demoStore,
  demoStoreCountries,
  demoStorePreference,
  demoSubscription,
  demoUser,
  globalEvents as seedGlobalEvents,
  plans,
  storeEventPreferences as seedEventPrefs,
  templates as seedTemplates,
} from "~/data";
import { getPlan, canAddCountry as canAddCountryFor } from "~/lib/planEntitlements";
import { createId } from "~/lib/id";
import { duplicateCampaign } from "~/lib/campaigns";
import { AdvertisingProvider } from "./AdvertisingContext";
import type { Catalog, StoreBundle } from "~/db/repository";
import type { DataIntent } from "~/db/dataActions";

/**
 * Mutable tenant store for the Business surface. Seeded from typed mock data by
 * default (Phases 2–4 behaviour, used by tests) OR hydrated from server loader
 * data + persisted through a server action seam when the `/app` route supplies
 * `initialData` + `onPersist` (MM5, Part 3).
 *
 * The persistence seam is OPTIMISTIC: each mutation updates local state
 * synchronously (unchanged component contracts) and, when `onPersist` is present,
 * emits a `DataIntent` that the route POSTs to `/app/data`. On a persistence
 * failure the route reconciles by revalidating the loader — local data is never
 * silently lost or faked. With no props the provider is pure-client (mock).
 */

// ─────────────────────────── persistence seam ───────────────────────────
export interface InitialData {
  catalog: Catalog;
  bundle: StoreBundle;
}
type Persist = (intent: DataIntent) => void;

const PersistCtx = createContext<Persist | undefined>(undefined);
/** The route's persistence dispatcher (undefined in pure-mock/test mode). */
export function usePersist(): Persist {
  const p = useContext(PersistCtx);
  return p ?? (() => {});
}

// ─────────────────────────── Identity + Plan ───────────────────────────
interface PlanContextValue {
  user: User;
  store: Store;
  membership: Membership;
  plans: Plan[];
  planId: PlanId;
  plan: Plan;
  subscription: Subscription;
  setPlanId: (id: PlanId) => void;
  canAddCountry: (currentCount: number) => boolean;
}
const PlanCtx = createContext<PlanContextValue | null>(null);

function PlanProviderInner({
  children,
  initial,
  onPersist,
}: {
  children: ReactNode;
  initial?: InitialData;
  onPersist?: Persist;
}) {
  const [planId, setPlanIdState] = useState<PlanId>(
    initial?.bundle.subscription?.planId ?? demoSubscription.planId,
  );

  const setPlanId = useCallback(
    (id: PlanId) => {
      setPlanIdState(id);
      onPersist?.({ intent: "setPlan", planId: id });
    },
    [onPersist],
  );

  const plan = useMemo(() => getPlan(planId), [planId]);
  const subscription = useMemo<Subscription>(
    () => ({ storeId: demoStore.id, planId, status: "active" }),
    [planId],
  );
  const canAddCountry = useCallback(
    (currentCount: number) => canAddCountryFor(plan, currentCount),
    [plan],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      user: demoUser,
      store: demoStore,
      membership: demoMembership,
      plans,
      planId,
      plan,
      subscription,
      setPlanId,
      canAddCountry,
    }),
    [planId, plan, subscription, canAddCountry, setPlanId],
  );
  return <PlanCtx.Provider value={value}>{children}</PlanCtx.Provider>;
}

// ─────────────────────────── Catalog (countries, events, prefs) ───────────────────────────
interface CatalogContextValue {
  countries: Country[];
  storeCountries: StoreCountry[];
  enabledCountryCodes: string[];
  setCountryEnabled: (code: string, enabled: boolean) => void;
  globalEvents: GlobalEvent[];
  eventPreferences: StoreEventPreference[];
  isEventHidden: (globalEventId: string) => boolean;
  hideEvent: (globalEventId: string) => void;
  restoreEvent: (globalEventId: string) => void;
  customEvents: CustomEvent[];
  addCustomEvent: (input: Omit<CustomEvent, "id" | "storeId">) => CustomEvent;
  updateCustomEvent: (id: string, patch: Partial<CustomEvent>) => void;
  deleteCustomEvent: (id: string) => void;
  preferences: StorePreference;
  updatePreferences: (patch: Partial<StorePreference>) => void;
}
const CatalogCtx = createContext<CatalogContextValue | null>(null);

function CatalogProviderInner({
  children,
  initial,
  onPersist,
}: {
  children: ReactNode;
  initial?: InitialData;
  onPersist?: Persist;
}) {
  const [storeCountries, setStoreCountries] = useState<StoreCountry[]>(() =>
    (initial?.bundle.storeCountries ?? demoStoreCountries).map((c) => ({ ...c })),
  );
  const [eventPreferences, setEventPreferences] = useState<StoreEventPreference[]>(
    () => (initial?.bundle.eventPreferences ?? seedEventPrefs).map((p) => ({ ...p })),
  );
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() =>
    (initial?.bundle.customEvents ?? seedCustomEvents).map((e) => ({ ...e })),
  );
  const [preferences, setPreferences] = useState<StorePreference>(() => ({
    ...(initial?.bundle.preferences ?? {
      ...demoStorePreference,
      accent: "indigo",
      density: "comfortable",
    }),
  }));

  const countries = initial?.catalog.countries ?? catalog;
  const globalEvents = initial?.catalog.globalEvents ?? seedGlobalEvents;

  const enabledCountryCodes = useMemo(
    () => storeCountries.filter((c) => c.enabled).map((c) => c.countryCode),
    [storeCountries],
  );

  const setCountryEnabled = useCallback(
    (code: string, enabled: boolean) => {
      setStoreCountries((prev) => {
        const existing = prev.find((c) => c.countryCode === code);
        if (existing) {
          return prev.map((c) => (c.countryCode === code ? { ...c, enabled } : c));
        }
        return [...prev, { storeId: demoStore.id, countryCode: code, enabled }];
      });
      onPersist?.({ intent: "setCountryEnabled", countryCode: code, enabled });
    },
    [onPersist],
  );

  const isEventHidden = useCallback(
    (globalEventId: string) =>
      eventPreferences.some((p) => p.globalEventId === globalEventId && p.hidden),
    [eventPreferences],
  );

  const hideEvent = useCallback(
    (globalEventId: string) => {
      setEventPreferences((prev) => {
        const existing = prev.find((p) => p.globalEventId === globalEventId);
        if (existing) {
          return prev.map((p) =>
            p.globalEventId === globalEventId ? { ...p, hidden: true } : p,
          );
        }
        return [...prev, { storeId: demoStore.id, globalEventId, hidden: true }];
      });
      onPersist?.({ intent: "setEventHidden", globalEventId, hidden: true });
    },
    [onPersist],
  );

  const restoreEvent = useCallback(
    (globalEventId: string) => {
      setEventPreferences((prev) =>
        prev.map((p) =>
          p.globalEventId === globalEventId ? { ...p, hidden: false } : p,
        ),
      );
      onPersist?.({ intent: "setEventHidden", globalEventId, hidden: false });
    },
    [onPersist],
  );

  const addCustomEvent = useCallback(
    (input: Omit<CustomEvent, "id" | "storeId">) => {
      const event: CustomEvent = { ...input, id: createId("cev"), storeId: demoStore.id };
      setCustomEvents((prev) => [...prev, event]);
      onPersist?.({ intent: "createCustomEvent", input, id: event.id });
      return event;
    },
    [onPersist],
  );

  const updateCustomEvent = useCallback(
    (id: string, patch: Partial<CustomEvent>) => {
      setCustomEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      onPersist?.({ intent: "updateCustomEvent", id, patch });
    },
    [onPersist],
  );

  const deleteCustomEvent = useCallback(
    (id: string) => {
      setCustomEvents((prev) => prev.filter((e) => e.id !== id));
      onPersist?.({ intent: "deleteCustomEvent", id });
    },
    [onPersist],
  );

  const updatePreferences = useCallback(
    (patch: Partial<StorePreference>) => {
      setPreferences((prev) => ({ ...prev, ...patch }));
      onPersist?.({ intent: "updatePreferences", patch });
    },
    [onPersist],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      countries,
      storeCountries,
      enabledCountryCodes,
      setCountryEnabled,
      globalEvents,
      eventPreferences,
      isEventHidden,
      hideEvent,
      restoreEvent,
      customEvents,
      addCustomEvent,
      updateCustomEvent,
      deleteCustomEvent,
      preferences,
      updatePreferences,
    }),
    [
      countries,
      storeCountries,
      enabledCountryCodes,
      setCountryEnabled,
      globalEvents,
      eventPreferences,
      isEventHidden,
      hideEvent,
      restoreEvent,
      customEvents,
      addCustomEvent,
      updateCustomEvent,
      deleteCustomEvent,
      preferences,
      updatePreferences,
    ],
  );
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}

// ─────────────────────────── Campaigns + templates ───────────────────────────
interface CampaignsContextValue {
  campaigns: Campaign[];
  createCampaign: (
    input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">,
  ) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (
    id: string,
    overrides?: Partial<Campaign>,
  ) => Campaign | undefined;
  setCampaignStatus: (id: string, status: CampaignStatus) => void;
  moveCampaign: (id: string, startDate: string, endDate: string) => void;
  templates: Template[];
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
}
const CampaignsCtx = createContext<CampaignsContextValue | null>(null);

function CampaignsProviderInner({
  children,
  initial,
  onPersist,
}: {
  children: ReactNode;
  initial?: InitialData;
  onPersist?: Persist;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    (initial?.bundle.campaigns ?? seedCampaigns).map((c) => ({ ...c })),
  );
  const [templates, setTemplates] = useState<Template[]>(() =>
    (initial?.bundle.templates ?? seedTemplates).map((t) => ({ ...t })),
  );

  const createCampaign = useCallback(
    (input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const campaign: Campaign = {
        ...input,
        id: createId("cmp"),
        storeId: demoStore.id,
        createdAt: now,
        updatedAt: now,
      };
      setCampaigns((prev) => [campaign, ...prev]);
      onPersist?.({ intent: "createCampaign", input, id: campaign.id });
      return campaign;
    },
    [onPersist],
  );

  const updateCampaign = useCallback(
    (id: string, patch: Partial<Campaign>) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
        ),
      );
      onPersist?.({ intent: "updateCampaign", id, patch });
    },
    [onPersist],
  );

  const deleteCampaign = useCallback(
    (id: string) => {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      onPersist?.({ intent: "deleteCampaign", id });
    },
    [onPersist],
  );

  // Functional update keeps this action referentially stable (no `campaigns` dep),
  // so consumers memoized on it don't re-render on every campaign change.
  const duplicate = useCallback(
    (id: string, overrides?: Partial<Campaign>) => {
      let copy: Campaign | undefined;
      setCampaigns((prev) => {
        const source = prev.find((c) => c.id === id);
        if (!source) return prev;
        copy = duplicateCampaign(source, overrides);
        return [copy, ...prev];
      });
      if (copy) {
        // Pass id parity so the persisted duplicate matches the optimistic copy.
        onPersist?.({
          intent: "duplicateCampaign",
          id,
          overrides: { ...overrides, id: copy.id, name: copy.name },
        });
      }
      return copy;
    },
    [onPersist],
  );

  const setCampaignStatus = useCallback(
    (id: string, status: CampaignStatus) => updateCampaign(id, { status }),
    [updateCampaign],
  );

  const moveCampaign = useCallback(
    (id: string, startDate: string, endDate: string) =>
      updateCampaign(id, { startDate, endDate }),
    [updateCampaign],
  );

  const addTemplate = useCallback(
    (template: Template) => {
      setTemplates((prev) => [template, ...prev]);
      onPersist?.({ intent: "addTemplate", template });
    },
    [onPersist],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      onPersist?.({ intent: "deleteTemplate", id });
    },
    [onPersist],
  );

  const value = useMemo<CampaignsContextValue>(
    () => ({
      campaigns,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      duplicateCampaign: duplicate,
      setCampaignStatus,
      moveCampaign,
      templates,
      addTemplate,
      deleteTemplate,
    }),
    [
      campaigns,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      duplicate,
      setCampaignStatus,
      moveCampaign,
      templates,
      addTemplate,
      deleteTemplate,
    ],
  );
  return <CampaignsCtx.Provider value={value}>{children}</CampaignsCtx.Provider>;
}

// ─────────────────────────── Composed provider ───────────────────────────
export function DataProvider({
  children,
  initialData,
  onPersist,
}: {
  children: ReactNode;
  /** Server-loaded catalog + bundle. When omitted, the provider seeds from mock. */
  initialData?: InitialData;
  /** Persistence dispatcher from the route. When omitted, the provider is pure-client. */
  onPersist?: Persist;
}) {
  return (
    <PersistCtx.Provider value={onPersist}>
      <PlanProviderInner initial={initialData} onPersist={onPersist}>
        <CatalogProviderInner initial={initialData} onPersist={onPersist}>
          <CampaignsProviderInner initial={initialData} onPersist={onPersist}>
            <AdvertisingProvider>{children}</AdvertisingProvider>
          </CampaignsProviderInner>
        </CatalogProviderInner>
      </PlanProviderInner>
    </PersistCtx.Provider>
  );
}

// ─────────────────────────── Focused hooks ───────────────────────────
export function usePlanData(): PlanContextValue {
  const v = useContext(PlanCtx);
  if (!v) throw new Error("usePlanData must be used within <DataProvider>");
  return v;
}
export function useCatalog(): CatalogContextValue {
  const v = useContext(CatalogCtx);
  if (!v) throw new Error("useCatalog must be used within <DataProvider>");
  return v;
}
export function useCampaignData(): CampaignsContextValue {
  const v = useContext(CampaignsCtx);
  if (!v) throw new Error("useCampaignData must be used within <DataProvider>");
  return v;
}

/** Composite of all three domains — backward-compatible with existing consumers. */
export type DataContextValue = PlanContextValue &
  CatalogContextValue &
  CampaignsContextValue;

export function useData(): DataContextValue {
  return { ...usePlanData(), ...useCatalog(), ...useCampaignData() };
}

/**
 * Shell tenant selector — reads identity + countries only (NOT campaigns), so the
 * persistent shell does not re-render when campaigns/templates change.
 */
export function useCurrentStore() {
  const { store, membership } = usePlanData();
  const { storeCountries, enabledCountryCodes } = useCatalog();
  return { store, membership, storeCountries, enabledCountryCodes };
}

/** Shell plan selector — reads the plan domain only. */
export function usePlan() {
  const { subscription, plan, canAddCountry } = usePlanData();
  return { subscription, plan, canAddCountry };
}
