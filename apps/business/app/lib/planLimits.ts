import type { Campaign, Plan } from "~/types/domain";
import { addMonths, isAfter, parseISO, startOfDay } from "date-fns";

/**
 * Plan-limit enforcement helpers (mock layer). These identify *excess* data
 * after a downgrade so the UI can make it read-only without ever deleting it
 * (D16 / roadmap "Plan enforcement & storage"). In Phase 5 the same predicates
 * run server-side in loaders/actions — see docs/PLAN_ENFORCEMENT.md.
 *
 * Retention policy: the most-recently-updated records within the limit stay
 * editable; anything beyond the limit is retained but read-only until the
 * merchant upgrades (restoring edit access) or removes records to get back
 * under the cap.
 */

/** Ids of campaigns that are over the plan's saved-campaign limit (read-only). */
export function readOnlyCampaignIds(campaigns: Campaign[], plan: Plan): Set<string> {
  const limit = plan.savedCampaignLimit;
  if (limit === null || campaigns.length <= limit) return new Set();
  const orderedNewestFirst = [...campaigns].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return new Set(orderedNewestFirst.slice(limit).map((c) => c.id));
}

export function isCampaignReadOnly(
  campaign: Campaign,
  campaigns: Campaign[],
  plan: Plan,
): boolean {
  return readOnlyCampaignIds(campaigns, plan).has(campaign.id);
}

/** How many saved campaigns exceed the plan limit (0 when within limit). */
export function campaignsOverLimit(campaigns: Campaign[], plan: Plan): number {
  return readOnlyCampaignIds(campaigns, plan).size;
}

/**
 * Enabled country codes that exceed the plan's country limit (read-only markets).
 * Excess = the codes beyond the limit in stable (given) order; the merchant
 * chooses which to disable to get back under the cap.
 */
export function overLimitCountryCodes(
  enabledCodes: string[],
  plan: Plan,
): string[] {
  const limit = plan.countryLimit;
  if (limit === null || enabledCodes.length <= limit) return [];
  return enabledCodes.slice(limit);
}

/** The last date a merchant may plan to under a plan's horizon. */
export function planningHorizonEnd(plan: Plan, from: Date = new Date()): Date {
  return addMonths(startOfDay(from), plan.planningHorizonMonths);
}

/** Whether a target date is within the plan's planning horizon. */
export function withinPlanningHorizon(
  dateISO: string,
  plan: Plan,
  from: Date = new Date(),
): boolean {
  return !isAfter(parseISO(dateISO), planningHorizonEnd(plan, from));
}
