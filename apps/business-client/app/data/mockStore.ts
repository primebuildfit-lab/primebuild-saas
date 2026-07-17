import type {
  Store,
  User,
  Membership,
  StoreCountry,
  StorePreference,
  Subscription,
} from "~/types/domain";

/**
 * A single FICTIONAL demo merchant (D26). No PrimeBuild names/domains/IDs.
 * Phase 5 replaces this with the real Shopify session + server-validated Membership.
 */
export const DEMO_STORE_ID = "store_demo";
export const DEMO_USER_ID = "user_demo";

export const demoUser: User = {
  id: DEMO_USER_ID,
  email: "owner@demo-store.example",
  name: "Demo Owner",
};

export const demoStore: Store = {
  id: DEMO_STORE_ID,
  shopDomain: "demo-store.example",
  name: "Demo Store",
};

export const demoMembership: Membership = {
  userId: DEMO_USER_ID,
  storeId: DEMO_STORE_ID,
  role: "owner",
};

/** US + CA both enabled for the demo store. Enablement is per-store (D25). */
export const demoStoreCountries: StoreCountry[] = [
  { storeId: DEMO_STORE_ID, countryCode: "US", enabled: true },
  { storeId: DEMO_STORE_ID, countryCode: "CA", enabled: true },
];

export const demoStorePreference: StorePreference = {
  storeId: DEMO_STORE_ID,
  weekStartsOn: 0,
  calendarFormat: "month",
  reminderDefaults: [30, 14, 7, 1],
};

/**
 * New stores start on **Free** (product decision): no charge until the merchant
 * chooses a paid plan, which then begins a 45-day free trial. Preview/tests can
 * switch plans from the Billing screen.
 */
export const demoSubscription: Subscription = {
  storeId: DEMO_STORE_ID,
  planId: "free",
  status: "active",
};
