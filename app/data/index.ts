/**
 * Mock data barrel. All fake data lives under app/data (SOP: never scatter mock
 * data in components). Shapes match app/types/domain.ts so Phase 5 can swap these
 * for real Supabase/API reads without changing components.
 */
export * from "./mockStore";
export { plans } from "./mockPlans";
export { countries, getCountry } from "./mockCountries";
export { globalEvents } from "./mockGlobalEvents";
export { campaigns } from "./mockCampaigns";
export { templates } from "./mockTemplates";
export { storeEventPreferences } from "./mockStoreEventPreferences";
