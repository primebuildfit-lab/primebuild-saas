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

/**
 * Mutable tenant store for Phases 2–4, seeded from typed mock data.
 *
 * State is split into three domain contexts — Identity/Plan, Catalog, and
 * Campaigns — so a mutation in one domain does not re-render consumers of
 * another (e.g. editing a campaign no longer re-renders the app shell, which
 * only reads identity/plan/countries). `useData()` composes all three for
 * backward compatibility. In Phase 5 each context is replaced by React Router
 * route loaders/actions backed by Supabase (see docs/STATE_ARCHITECTURE.md);
 * the split mirrors the natural loader boundaries.
 */

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

function PlanProviderInner({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState<PlanId>(demoSubscription.planId);

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
    [planId, plan, subscription, canAddCountry],
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

function CatalogProviderInner({ children }: { children: ReactNode }) {
  const [storeCountries, setStoreCountries] = useState<StoreCountry[]>(() =>
    demoStoreCountries.map((c) => ({ ...c })),
  );
  const [eventPreferences, setEventPreferences] = useState<StoreEventPreference[]>(
    () => seedEventPrefs.map((p) => ({ ...p })),
  );
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() =>
    seedCustomEvents.map((e) => ({ ...e })),
  );
  const [preferences, setPreferences] = useState<StorePreference>(() => ({
    ...demoStorePreference,
    accent: "indigo",
    density: "comfortable",
  }));

  const enabledCountryCodes = useMemo(
    () => storeCountries.filter((c) => c.enabled).map((c) => c.countryCode),
    [storeCountries],
  );

  const setCountryEnabled = useCallback((code: string, enabled: boolean) => {
    setStoreCountries((prev) => {
      const existing = prev.find((c) => c.countryCode === code);
      if (existing) {
        return prev.map((c) => (c.countryCode === code ? { ...c, enabled } : c));
      }
      return [...prev, { storeId: demoStore.id, countryCode: code, enabled }];
    });
  }, []);

  const isEventHidden = useCallback(
    (globalEventId: string) =>
      eventPreferences.some((p) => p.globalEventId === globalEventId && p.hidden),
    [eventPreferences],
  );

  const hideEvent = useCallback((globalEventId: string) => {
    setEventPreferences((prev) => {
      const existing = prev.find((p) => p.globalEventId === globalEventId);
      if (existing) {
        return prev.map((p) =>
          p.globalEventId === globalEventId ? { ...p, hidden: true } : p,
        );
      }
      return [...prev, { storeId: demoStore.id, globalEventId, hidden: true }];
    });
  }, []);

  const restoreEvent = useCallback((globalEventId: string) => {
    setEventPreferences((prev) =>
      prev.map((p) =>
        p.globalEventId === globalEventId ? { ...p, hidden: false } : p,
      ),
    );
  }, []);

  const addCustomEvent = useCallback((input: Omit<CustomEvent, "id" | "storeId">) => {
    const event: CustomEvent = { ...input, id: createId("cev"), storeId: demoStore.id };
    setCustomEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const updateCustomEvent = useCallback((id: string, patch: Partial<CustomEvent>) => {
    setCustomEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteCustomEvent = useCallback((id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updatePreferences = useCallback((patch: Partial<StorePreference>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      countries: catalog,
      storeCountries,
      enabledCountryCodes,
      setCountryEnabled,
      globalEvents: seedGlobalEvents,
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
      storeCountries,
      enabledCountryCodes,
      setCountryEnabled,
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

function CampaignsProviderInner({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    seedCampaigns.map((c) => ({ ...c })),
  );
  const [templates, setTemplates] = useState<Template[]>(() =>
    seedTemplates.map((t) => ({ ...t })),
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
      return campaign;
    },
    [],
  );

  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
      ),
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Functional update keeps this action referentially stable (no `campaigns` dep),
  // so consumers memoized on it don't re-render on every campaign change.
  const duplicate = useCallback((id: string, overrides?: Partial<Campaign>) => {
    let copy: Campaign | undefined;
    setCampaigns((prev) => {
      const source = prev.find((c) => c.id === id);
      if (!source) return prev;
      copy = duplicateCampaign(source, overrides);
      return [copy, ...prev];
    });
    return copy;
  }, []);

  const setCampaignStatus = useCallback(
    (id: string, status: CampaignStatus) => updateCampaign(id, { status }),
    [updateCampaign],
  );

  const moveCampaign = useCallback(
    (id: string, startDate: string, endDate: string) =>
      updateCampaign(id, { startDate, endDate }),
    [updateCampaign],
  );

  const addTemplate = useCallback((template: Template) => {
    setTemplates((prev) => [template, ...prev]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <PlanProviderInner>
      <CatalogProviderInner>
        <CampaignsProviderInner>{children}</CampaignsProviderInner>
      </CatalogProviderInner>
    </PlanProviderInner>
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
