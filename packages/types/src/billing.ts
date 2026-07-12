/** Provider-independent billing types (see @eventra/... billing orchestration, MM2). */

export type BillingProviderId =
  | "google_play"
  | "apple_app_store"
  | "stripe"
  | "shopify"
  | "manual";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "grace"
  | "canceled";

/** A normalized external subscription mapped to internal entitlements. */
export interface BillingSource {
  provider: BillingProviderId;
  externalId: string;
  product: string; // maps to a PlanId / add-on
  status: SubscriptionStatus;
}
