/** Products, plans, add-ons, entitlements, trials (platform monetization types). */

export type ProductSurface = "consumer" | "business";

/** Consumer intelligence products + the independent Ad-Free add-on. */
export type ConsumerProductId = "consumer.core" | "consumer.deal_intelligence";
export type ConsumerAddOnId = "addon.ad_free";

/** Business plan tiers (Free/Starter/Growth/Pro). */
export type BusinessPlanId =
  | "business.free"
  | "business.starter"
  | "business.growth"
  | "business.pro";

export type PlanId = ConsumerProductId | BusinessPlanId;

/** Stable entitlement identifiers resolved by @eventra/entitlements. */
export type EntitlementKey = string;

export interface Entitlement {
  key: EntitlementKey;
  /** source that granted it (subscription/add-on/trial/grant). */
  source: "subscription" | "addon" | "trial" | "grant";
  expiresAt?: string;
}

/** Numeric/feature limits resolved for a principal. null = unlimited. */
export interface LimitSet {
  workspaceLimit?: number | null;
  countryLimit?: number | null;
  planningHorizonYears?: number | null;
  followLimit?: number | null;
  savedCampaignLimit?: number | null;
}

export type TrialKind = "consumer.deal_intelligence" | "business.pro";

export type TrialStateName =
  | "eligible"
  | "active"
  | "ending_soon"
  | "expired"
  | "converted"
  | "cancelled"
  | "grace"
  | "previously_used";

export interface TrialState {
  kind: TrialKind;
  state: TrialStateName;
  startedAt?: string;
  endsAt?: string;
}
