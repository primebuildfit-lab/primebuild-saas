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
 * The single mutable tenant store for Phases 2–4. Seeded from the typed mock
 * data; every merchant action mutates local React state so the whole product is
 * interactive without a backend. Shapes mirror app/types/domain.ts, so Phase 5
 * swaps this provider for real Supabase reads/writes without touching components.
 */
interface DataContextValue {
  // identity
  user: User;
  store: Store;
  membership: Membership;

  // plan / subscription (plan is switchable locally for the pricing UI)
  plans: Plan[];
  planId: PlanId;
  plan: Plan;
  subscription: Subscription;
  setPlanId: (id: PlanId) => void;
  canAddCountry: (currentCount: number) => boolean;

  // countries
  countries: Country[];
  storeCountries: StoreCountry[];
  enabledCountryCodes: string[];
  setCountryEnabled: (code: string, enabled: boolean) => void;

  // global events + per-store hide/restore
  globalEvents: GlobalEvent[];
  eventPreferences: StoreEventPreference[];
  isEventHidden: (globalEventId: string) => boolean;
  hideEvent: (globalEventId: string) => void;
  restoreEvent: (globalEventId: string) => void;

  // custom (merchant) events
  customEvents: CustomEvent[];
  addCustomEvent: (input: Omit<CustomEvent, "id" | "storeId">) => CustomEvent;
  updateCustomEvent: (id: string, patch: Partial<CustomEvent>) => void;
  deleteCustomEvent: (id: string) => void;

  // campaigns
  campaigns: Campaign[];
  createCampaign: (
    input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">,
  ) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string, overrides?: Partial<Campaign>) => Campaign | undefined;
  setCampaignStatus: (id: string, status: CampaignStatus) => void;
  moveCampaign: (id: string, startDate: string, endDate: string) => void;

  // templates
  templates: Template[];
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;

  // preferences
  preferences: StorePreference;
  updatePreferences: (patch: Partial<StorePreference>) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState<PlanId>(demoSubscription.planId);
  const [storeCountries, setStoreCountries] = useState<StoreCountry[]>(
    () => demoStoreCountries.map((c) => ({ ...c })),
  );
  const [eventPreferences, setEventPreferences] = useState<
    StoreEventPreference[]
  >(() => seedEventPrefs.map((p) => ({ ...p })));
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>(() =>
    seedCustomEvents.map((e) => ({ ...e })),
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    seedCampaigns.map((c) => ({ ...c })),
  );
  const [templates, setTemplates] = useState<Template[]>(() =>
    seedTemplates.map((t) => ({ ...t })),
  );
  const [preferences, setPreferences] = useState<StorePreference>(() => ({
    ...demoStorePreference,
    accent: "indigo",
    density: "comfortable",
  }));

  const plan = useMemo(() => getPlan(planId), [planId]);
  const subscription = useMemo<Subscription>(
    () => ({ storeId: demoStore.id, planId, status: "active" }),
    [planId],
  );

  const enabledCountryCodes = useMemo(
    () => storeCountries.filter((c) => c.enabled).map((c) => c.countryCode),
    [storeCountries],
  );

  // ---- countries ----
  const setCountryEnabled = useCallback((code: string, enabled: boolean) => {
    setStoreCountries((prev) => {
      const existing = prev.find((c) => c.countryCode === code);
      if (existing) {
        return prev.map((c) =>
          c.countryCode === code ? { ...c, enabled } : c,
        );
      }
      return [...prev, { storeId: demoStore.id, countryCode: code, enabled }];
    });
  }, []);

  // ---- event hide / restore (per-store, never a global delete: D13) ----
  const isEventHidden = useCallback(
    (globalEventId: string) =>
      eventPreferences.some(
        (p) => p.globalEventId === globalEventId && p.hidden,
      ),
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

  // ---- custom events ----
  const addCustomEvent = useCallback(
    (input: Omit<CustomEvent, "id" | "storeId">) => {
      const event: CustomEvent = {
        ...input,
        id: createId("cev"),
        storeId: demoStore.id,
      };
      setCustomEvents((prev) => [...prev, event]);
      return event;
    },
    [],
  );

  const updateCustomEvent = useCallback(
    (id: string, patch: Partial<CustomEvent>) => {
      setCustomEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
    },
    [],
  );

  const deleteCustomEvent = useCallback((id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---- campaigns ----
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
        c.id === id
          ? { ...c, ...patch, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const duplicate = useCallback(
    (id: string, overrides?: Partial<Campaign>) => {
      const source = campaigns.find((c) => c.id === id);
      if (!source) return undefined;
      const copy = duplicateCampaign(source, overrides);
      setCampaigns((prev) => [copy, ...prev]);
      return copy;
    },
    [campaigns],
  );

  const setCampaignStatus = useCallback(
    (id: string, status: CampaignStatus) => {
      updateCampaign(id, { status });
    },
    [updateCampaign],
  );

  const moveCampaign = useCallback(
    (id: string, startDate: string, endDate: string) => {
      updateCampaign(id, { startDate, endDate });
    },
    [updateCampaign],
  );

  // ---- templates ----
  const addTemplate = useCallback((template: Template) => {
    setTemplates((prev) => [template, ...prev]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- preferences ----
  const updatePreferences = useCallback((patch: Partial<StorePreference>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      user: demoUser,
      store: demoStore,
      membership: demoMembership,
      plans,
      planId,
      plan,
      subscription,
      setPlanId,
      canAddCountry: (currentCount: number) =>
        canAddCountryFor(plan, currentCount),
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
      preferences,
      updatePreferences,
    }),
    [
      planId,
      plan,
      subscription,
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
      preferences,
      updatePreferences,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) {
    throw new Error("useData must be used within <DataProvider>");
  }
  return value;
}

/** Back-compat tenant selector used by the shell. */
export function useCurrentStore() {
  const { store, membership, storeCountries, enabledCountryCodes } = useData();
  return { store, membership, storeCountries, enabledCountryCodes };
}

/** Back-compat plan selector used by the shell. */
export function usePlan() {
  const { subscription, plan, canAddCountry } = useData();
  return { subscription, plan, canAddCountry };
}
