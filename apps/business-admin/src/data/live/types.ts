/**
 * Real-data load states for the Business Admin supervision screens.
 *
 * These screens show EXCLUSIVELY real data from the central API / platform
 * database. When there is no real data — or no runtime connection — they render
 * an honest state, NEVER DEV fixtures, mocks or fabricated numbers (owner's hard
 * rule). The only permitted states are the four below. There is intentionally no
 * "demo"/"fallback" branch.
 */
export type LoadState<T> =
  | { kind: "loading" }
  /** No runtime connection to the central API / platform database is configured or authorised. */
  | { kind: "not_connected"; reason?: string }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: T };

/** True only when we actually have real rows to show. */
export function isReady<T>(s: LoadState<T>): s is { kind: "ready"; data: T } {
  return s.kind === "ready";
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical monitoring domain types. These describe what the Business Admin
// READS about the commercial Business Client. No field is ever fabricated: a
// value that has no real source is `null` and renders as "Sin datos".
// ─────────────────────────────────────────────────────────────────────────────

export type CompanyStatus = "ACTIVE" | "TRIAL" | "SUSPENDED" | "DISABLED" | "PENDING_SETUP";

/** A client company (tenant) as monitored by the admin. */
export interface AdminCompany {
  id: string;
  name: string;
  countryCode: string | null;
  status: CompanyStatus;
  plan: string | null;
  subscriptionStatus: string | null;
  ownerEmail: string | null;
  members: number | null;
  stores: number | null;
  orders: number | null;
  sales: number | null;
  campaigns: number | null;
  integrations: number | null;
  alerts: number | null;
  lastActivityAt: string | null;
}

export type StoreConnection = "CONNECTED" | "ERROR" | "DISCONNECTED" | "PENDING";

/** A commerce store connected to a client company. */
export interface AdminStore {
  id: string;
  name: string;
  domain: string | null;
  platform: string | null; // shopify | woocommerce | custom …
  companyName: string | null;
  countryCode: string | null;
  currency: string | null;
  status: CompanyStatus;
  connection: StoreConnection;
  orders: number | null;
  sales: number | null;
  products: number | null;
  integrations: number | null;
  lastSyncAt: string | null;
  errors: number | null;
}

/** An internal member of a client company (as monitored, never impersonated). */
export interface AdminMember {
  id: string;
  name: string;
  email: string | null;
  companyName: string | null;
  role: string | null;
  status: string | null;
  lastSeenAt: string | null;
}

export type OrderState = "LIVE" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "FAILED" | "PARTIAL";

export interface AdminOrder {
  id: string;
  companyName: string | null;
  storeName: string | null;
  customer: string | null;
  placedAt: string | null;
  payment: string | null;
  fulfillment: string | null;
  total: number | null;
  currency: string | null;
  channel: string | null;
  risk: string | null;
  state: OrderState;
  errors: number | null;
}

/** A monitored marketing object (advertisement / campaign / offer / content). */
export interface AdminMarketingItem {
  id: string;
  kind: "advertisement" | "campaign" | "offer" | "content";
  name: string;
  companyName: string | null;
  status: string | null;
  channel: string | null;
  budget: number | null;
  conversions: number | null;
  startAt: string | null;
  endAt: string | null;
  errors: number | null;
}

export interface AdminSubscription {
  id: string;
  companyName: string | null;
  plan: string | null;
  status: string | null;
  startedAt: string | null;
  renewsAt: string | null;
  usage: string | null;
  lastPayment: string | null;
  pendingPayment: number | null;
}

export interface AdminIntegration {
  id: string;
  companyName: string | null;
  provider: string | null;
  status: string | null;
  lastSyncAt: string | null;
  errors: number | null;
}

export interface AdminAlert {
  id: string;
  severity: "critical" | "major" | "minor" | "info";
  title: string;
  companyName: string | null;
  source: string | null;
  raisedAt: string | null;
  status: string | null;
}

export interface AdminAuditEvent {
  id: string;
  at: string | null;
  actor: string | null;
  action: string | null;
  target: string | null;
  result: string | null;
}

/** Dashboard summary — every number is nullable; null → "Sin datos". */
export interface AdminOverview {
  companiesRegistered: number | null;
  companiesActive: number | null;
  companiesSuspended: number | null;
  storesConnected: number | null;
  storesWithErrors: number | null;
  ordersLive: number | null;
  ordersCompleted: number | null;
  ordersCancelled: number | null;
  refunds: number | null;
  salesPeriod: number | null;
  adsActive: number | null;
  campaignsActive: number | null;
  subscriptionsActive: number | null;
  paymentsPending: number | null;
  integrationsWithErrors: number | null;
  alerts: number | null;
  incidents: number | null;
  lastSyncAt: string | null;
}
