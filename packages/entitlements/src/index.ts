/**
 * @eventra/entitlements — pure, deterministic entitlement resolver.
 *
 * No billing-provider, database, or UI dependencies. Prices/limits come from
 * @eventra/config. Implements the two-axis consumer model and the business plan
 * model from docs/ENTITLEMENTS.md. The server enforces from the resolved set;
 * the client only *displays* from it.
 */
import type { BusinessPlanId, TrialState } from "@eventra/types";
import { BUSINESS_PLANS, ENTITLEMENTS as E, FAIR_USE } from "@eventra/config";

export interface ConsumerAccessInput {
  surface: "consumer";
  /** Deal Intelligence subscription active. */
  dealIntelligence: boolean;
  /** Ad-Free add-on active (INDEPENDENT of dealIntelligence). */
  adFree: boolean;
  /** Consumer Deal-Intelligence trial, if any. */
  trial?: TrialState;
  /** Admin-granted entitlement keys (promotional/temporary). */
  grants?: string[];
}

export interface BusinessAccessInput {
  surface: "business";
  plan: BusinessPlanId;
  /** Business Pro trial, if any. */
  trial?: TrialState;
  grants?: string[];
}

export type AccessInput = ConsumerAccessInput | BusinessAccessInput;

export interface Limits {
  workspaceLimit: number | null;
  countryLimit: number | null;
  planningHorizonYears: number | null;
  followLimit: number | null;
}

export interface EntitlementSet {
  surface: "consumer" | "business";
  features: ReadonlySet<string>;
  limits: Limits;
  /** ads are removed ONLY by the Ad-Free add-on (consumer). */
  adsSuppressed: boolean;
  trial?: TrialState;
  /** effective business plan after trial resolution (business only). */
  effectivePlan?: BusinessPlanId;
}

function trialActive(trial?: TrialState): boolean {
  return trial?.state === "active" || trial?.state === "ending_soon";
}

// ─────────────────────────── resolve ───────────────────────────
export function resolveEntitlements(input: AccessInput): EntitlementSet {
  return input.surface === "consumer"
    ? resolveConsumer(input)
    : resolveBusiness(input);
}

function resolveConsumer(input: ConsumerAccessInput): EntitlementSet {
  const features = new Set<string>([E.consumerCore]);
  const grants = new Set(input.grants ?? []);

  const diActive =
    input.dealIntelligence ||
    (trialActive(input.trial) && input.trial?.kind === "consumer.deal_intelligence") ||
    grants.has(E.dealIntelligence);

  if (diActive) {
    features.add(E.dealIntelligence);
    features.add(E.companyFollow);
    features.add(E.offerNotifications);
  }
  // Ad-Free is orthogonal — the trial NEVER grants it.
  const adFree = input.adFree || grants.has(E.adFree);
  if (adFree) features.add(E.adFree);

  return {
    surface: "consumer",
    features,
    adsSuppressed: adFree,
    trial: input.trial,
    limits: {
      workspaceLimit: null,
      countryLimit: diActive ? FAIR_USE.consumerCountryLimit : 1,
      planningHorizonYears: null,
      followLimit: diActive ? FAIR_USE.consumerFollowLimit : 0,
    },
  };
}

function resolveBusiness(input: BusinessAccessInput): EntitlementSet {
  const proTrial =
    trialActive(input.trial) && input.trial?.kind === "business.pro";
  const effectivePlan: BusinessPlanId = proTrial ? "business.pro" : input.plan;
  const cfg = BUSINESS_PLANS[effectivePlan];
  const grants = new Set(input.grants ?? []);

  const features = new Set<string>();
  const add = (k: string) => features.add(k);
  // Tiered feature flags.
  if (effectivePlan !== "business.free") {
    add(E.businessEventCatalogMain);
    add(E.businessMemoryBasic);
  }
  if (effectivePlan === "business.growth" || effectivePlan === "business.pro") {
    add(E.businessEventCatalogBroad);
    add(E.businessMemoryAdvanced);
    add(E.businessTemplates);
    add(E.businessCustomDates);
    add(E.businessSupplierIntel);
    add(E.businessCompetitorIntel);
  }
  if (effectivePlan === "business.pro") {
    add(E.businessConsumerPromo);
    add(E.businessStorefrontWidgets);
    add(E.businessMultiStrategy);
  }
  for (const g of grants) features.add(g);

  return {
    surface: "business",
    features,
    adsSuppressed: false, // no ads in Business surface
    trial: input.trial,
    effectivePlan,
    limits: {
      workspaceLimit: cfg.workspaceLimit,
      countryLimit: cfg.countryLimit,
      planningHorizonYears: cfg.planningHorizonYears,
      followLimit: null,
    },
  };
}

// ─────────────────────────── selectors ───────────────────────────
export function hasEntitlement(set: EntitlementSet, key: string): boolean {
  return set.features.has(key);
}
export function getWorkspaceLimit(set: EntitlementSet): number | null {
  return set.limits.workspaceLimit;
}
export function getPlanningHorizon(set: EntitlementSet): number | null {
  return set.limits.planningHorizonYears;
}
export function getCountryLimit(set: EntitlementSet): number | null {
  return set.limits.countryLimit;
}
export function getTrialState(set: EntitlementSet): TrialState | undefined {
  return set.trial;
}
export function shouldShowAds(set: EntitlementSet): boolean {
  return set.surface === "consumer" && !set.adsSuppressed;
}
export function canUseDealIntelligence(set: EntitlementSet): boolean {
  return set.features.has(E.dealIntelligence);
}
export function canUseStorefrontWidgets(set: EntitlementSet): boolean {
  return set.features.has(E.businessStorefrontWidgets);
}

/**
 * Why a resource is read-only under the resolved plan (downgrade/grace), or null.
 * `index` is the 0-based position of the resource among same-kind resources.
 */
export function getReadOnlyReason(
  set: EntitlementSet,
  kind: "workspace" | "country",
  index: number,
): string | null {
  const limit =
    kind === "workspace" ? set.limits.workspaceLimit : set.limits.countryLimit;
  if (limit === null) return null; // unlimited
  if (index < limit) return null;
  return `Over your plan's ${kind} limit (${limit}). This ${kind} is read-only until you upgrade; your data is retained.`;
}
