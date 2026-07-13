/**
 * Server-side authorization for Business data mutations (Bloque 2).
 *
 * Single mapping from a {@link DataIntent} to the canonical permission it requires,
 * enforced against the request's SERVER-RESOLVED tenant role (`TenantScope.role`,
 * never a client value). The role → permission matrix itself lives once in
 * `@eventra/identity` (`ROLE_PERMISSIONS`); this module only maps intents to keys.
 *
 * The UI hides/disables controls as a convenience, but this is the real gate: it
 * runs in `dispatchDataAction`, the single choke point every write passes through
 * (mock, file, and supabase modes alike).
 */
import {
  BUSINESS_PERMISSIONS as P,
  roleCan,
  type BusinessPermission,
  type OrgRole,
} from "@eventra/identity";
import type { DataIntent } from "~/db/dataActions";

/** The permission required to perform each write intent. */
export function requiredPermission(intent: DataIntent): BusinessPermission {
  switch (intent.intent) {
    case "setCountryEnabled":
      return P.countryWrite;
    case "setEventHidden":
    case "createCustomEvent":
    case "updateCustomEvent":
      return P.eventWrite;
    case "deleteCustomEvent":
      return P.eventDelete;
    case "createCampaign":
    case "updateCampaign":
    case "duplicateCampaign":
    case "setCampaignStatus":
    case "moveCampaign":
      return P.campaignWrite;
    case "deleteCampaign":
      return P.campaignDelete;
    case "addTemplate":
      return P.templateWrite;
    case "deleteTemplate":
      return P.templateDelete;
    case "createNote":
    case "updateNote":
      return P.noteWrite;
    case "deleteNote":
      return P.noteDelete;
    case "updatePreferences":
      return P.preferencesWrite;
    case "setPlan":
      return P.planManage;
    default: {
      // Exhaustiveness guard — a new intent must declare its permission above.
      const exhaustive: never = intent;
      throw new Error(`No permission mapping for intent: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** True when the resolved role may perform the intent. */
export function canPerform(role: OrgRole, intent: DataIntent): boolean {
  return roleCan(role, requiredPermission(intent));
}
