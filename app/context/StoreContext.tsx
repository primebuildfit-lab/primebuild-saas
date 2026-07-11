/**
 * Tenant selector. State now lives in DataContext (the single mutable mock store);
 * this thin re-export keeps existing `~/context/StoreContext` imports valid.
 * Phase 5: DataContext is replaced by real Shopify-session + Supabase reads.
 */
export { useCurrentStore, DataProvider as StoreProvider } from "./DataContext";
