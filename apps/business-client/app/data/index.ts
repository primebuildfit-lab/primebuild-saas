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
export { customEvents } from "./mockCustomEvents";
export { templates } from "./mockTemplates";
export { storeEventPreferences } from "./mockStoreEventPreferences";
export {
  mockProducts,
  mockCollections,
  catalogRefs,
  getCatalogRef,
} from "./mockCatalog";
export type { MockProduct, MockCollection, CatalogRef } from "./mockCatalog";

// ── Business UI reorg — opportunity engine + new module data ──
export {
  opportunitySignals,
  getOpportunitySignal,
} from "./mockOpportunitySignals";
export type {
  OpportunitySignal,
  DiscoverySignalState,
} from "./mockOpportunitySignals";
export { contentItems } from "./mockContent";
export type {
  ContentItem,
  ContentKind,
  ContentFormat,
  ContentStatus,
} from "./mockContent";
export { mediaAssets } from "./mockMedia";
export type { MediaAsset, MediaType, MediaLicense } from "./mockMedia";
export { sources } from "./mockSources";
export type { Source, SourceType, SourceStatus, SyncFrequency } from "./mockSources";
export { integrations } from "./mockIntegrations";
export type {
  Integration,
  IntegrationCategory,
  IntegrationStatus,
} from "./mockIntegrations";
export { automations, jobs } from "./mockAutomations";
export type {
  Automation,
  AutomationKind,
  AutomationStatus,
  Job,
  JobStatus,
} from "./mockAutomations";
export { aiModels, aiPrompts, aiTasks, aiUsage } from "./mockAi";
export type { AiModel, AiPrompt, AiTask, AiTaskStatus } from "./mockAi";
export { teamMembers } from "./mockTeam";
export type { TeamMember } from "./mockTeam";
export { audiences } from "./mockAudiences";
export type { Audience, AudienceType } from "./mockAudiences";
