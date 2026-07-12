/**
 * Server-action dispatcher (MM4, Part 5). Maps a named intent + payload to a
 * BusinessRepository call. Pure (types only), so it is exercised directly by
 * tests with the in-memory repository and reused by the resource route that backs
 * real HTTP form/fetcher submissions. Unknown intents throw (never a silent no-op).
 */
import type {
  Campaign,
  CampaignStatus,
  CustomEvent,
  StorePreference,
  Subscription,
  Template,
  TenantScope,
} from "~/types/domain";
import type { BusinessRepository } from "./repository";
import { RepositoryError } from "./repository";

export type DataIntent =
  | { intent: "setCountryEnabled"; countryCode: string; enabled: boolean }
  | { intent: "setEventHidden"; globalEventId: string; hidden: boolean }
  | { intent: "createCustomEvent"; input: Omit<CustomEvent, "id" | "storeId">; id?: string }
  | { intent: "updateCustomEvent"; id: string; patch: Partial<CustomEvent> }
  | { intent: "deleteCustomEvent"; id: string }
  | {
      intent: "createCampaign";
      input: Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt">;
      id?: string;
    }
  | { intent: "updateCampaign"; id: string; patch: Partial<Campaign> }
  | { intent: "deleteCampaign"; id: string }
  | { intent: "duplicateCampaign"; id: string; overrides?: Partial<Campaign> }
  | { intent: "setCampaignStatus"; id: string; status: CampaignStatus }
  | { intent: "moveCampaign"; id: string; startDate: string; endDate: string }
  | { intent: "addTemplate"; template: Omit<Template, "storeId"> }
  | { intent: "deleteTemplate"; id: string }
  | { intent: "createNote"; body: string; id?: string }
  | { intent: "updateNote"; id: string; body: string }
  | { intent: "deleteNote"; id: string }
  | { intent: "updatePreferences"; patch: Partial<StorePreference> }
  | { intent: "setPlan"; planId: Subscription["planId"] };

export async function dispatchDataAction(
  repo: BusinessRepository,
  scope: TenantScope,
  action: DataIntent,
): Promise<unknown> {
  switch (action.intent) {
    case "setCountryEnabled":
      return repo.setCountryEnabled(scope, action.countryCode, action.enabled);
    case "setEventHidden":
      return repo.setEventHidden(scope, action.globalEventId, action.hidden);
    case "createCustomEvent":
      return repo.createCustomEvent(scope, action.input, action.id);
    case "updateCustomEvent":
      return repo.updateCustomEvent(scope, action.id, action.patch);
    case "deleteCustomEvent":
      return repo.deleteCustomEvent(scope, action.id);
    case "createCampaign":
      return repo.createCampaign(scope, action.input, action.id);
    case "updateCampaign":
      return repo.updateCampaign(scope, action.id, action.patch);
    case "deleteCampaign":
      return repo.deleteCampaign(scope, action.id);
    case "duplicateCampaign":
      return repo.duplicateCampaign(scope, action.id, action.overrides);
    case "setCampaignStatus":
      return repo.setCampaignStatus(scope, action.id, action.status);
    case "moveCampaign":
      return repo.moveCampaign(scope, action.id, action.startDate, action.endDate);
    case "addTemplate":
      return repo.addTemplate(scope, action.template);
    case "deleteTemplate":
      return repo.deleteTemplate(scope, action.id);
    case "createNote":
      return repo.createNote(scope, action.body, action.id);
    case "updateNote":
      return repo.updateNote(scope, action.id, action.body);
    case "deleteNote":
      return repo.deleteNote(scope, action.id);
    case "updatePreferences":
      return repo.updatePreferences(scope, action.patch);
    case "setPlan":
      return repo.setPlan(scope, action.planId);
    default: {
      const exhaustive: never = action;
      throw new RepositoryError(
        `Unknown data intent: ${JSON.stringify(exhaustive)}`,
        "validation",
      );
    }
  }
}
