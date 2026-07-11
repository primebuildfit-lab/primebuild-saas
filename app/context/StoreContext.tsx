import { createContext, useContext, type ReactNode } from "react";
import type { Store, Membership, StoreCountry } from "~/types/domain";
import { demoStore, demoMembership, demoStoreCountries } from "~/data";

interface StoreContextValue {
  store: Store;
  membership: Membership;
  storeCountries: StoreCountry[];
  enabledCountryCodes: string[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

/**
 * Provides the current tenant. Phase 1: a single fictional demo store.
 * Phase 5: resolved from the Shopify session and a SERVER-validated Membership
 * (never from a client-supplied storeId). See docs/ARCHITECTURE_REVIEW.md §8.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const enabledCountryCodes = demoStoreCountries
    .filter((sc) => sc.enabled)
    .map((sc) => sc.countryCode);

  const value: StoreContextValue = {
    store: demoStore,
    membership: demoMembership,
    storeCountries: demoStoreCountries,
    enabledCountryCodes,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useCurrentStore(): StoreContextValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("useCurrentStore must be used within <StoreProvider>");
  }
  return value;
}
