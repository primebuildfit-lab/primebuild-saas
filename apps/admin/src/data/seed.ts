/**
 * Internal OS DEV SEED (Phase 7, Bloque 30). Clearly-marked fictional data for
 * building/inspecting the admin UI. Every record carries `isDev: true` and generic
 * names — NEVER PrimeBuild, never real merchants. A production guard (see
 * `isProdLike`) refuses to expose this data outside development.
 */
import type { Offer, OfferSource } from "../engine/types";
import { scoreOffer } from "../engine/scoring";
import { modelCommission, type CommissionRecord } from "../engine/commissions";

export const DEV_SEED = true;

/** Belt-and-suspenders: dev seed must never render in a production build. */
export function isProdLike(): boolean {
  // Vite exposes import.meta.env.PROD; default to false in non-Vite contexts.
  try {
    return Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD);
  } catch {
    return false;
  }
}

export interface DevCompany {
  id: string;
  name: string;
  plan: string;
  country: string;
  industry: string;
  status: "active" | "trial" | "suspended";
  registeredAt: string;
  monthlySpendMinor: number;
  riskScore: number; // 0..1
  openIssues: number;
  isDev: true;
}

export interface DevUser {
  id: string;
  name: string;
  companyId: string;
  role: string;
  status: "active" | "invited" | "disabled";
  lastActiveAt: string;
  isDev: true;
}

export interface DevJob {
  id: string;
  name: string;
  status: "idle" | "running" | "failed" | "succeeded";
  lastRunAt: string;
  nextRunAt: string;
  errorCount: number;
  isDev: true;
}

export const devSources: OfferSource[] = [
  { id: "src_gov_us", name: "US Public Holidays Feed", country: "US", method: "public_calendar", status: "healthy", frequencyHours: 24, reliability: 0.95, errorCount: 0, lastSyncAt: "2026-07-13T04:00:00Z", nextSyncAt: "2026-07-14T04:00:00Z", isDev: true },
  { id: "src_retail_cal", name: "Retail Calendar API", country: "US", method: "api", status: "degraded", frequencyHours: 12, reliability: 0.72, errorCount: 3, lastSyncAt: "2026-07-13T02:00:00Z", nextSyncAt: "2026-07-13T14:00:00Z", isDev: true },
  { id: "src_ca_events", name: "Canada Events Feed", country: "CA", method: "feed", status: "healthy", frequencyHours: 24, reliability: 0.88, errorCount: 0, lastSyncAt: "2026-07-13T05:00:00Z", nextSyncAt: "2026-07-14T05:00:00Z", isDev: true },
  { id: "src_manual", name: "Manual Curation", method: "manual", status: "healthy", frequencyHours: 0, reliability: 1, errorCount: 0, isDev: true },
  { id: "src_partner_feed", name: "Partner Submissions", country: "GB", method: "collaborator", status: "down", frequencyHours: 24, reliability: 0.6, errorCount: 11, lastSyncAt: "2026-07-10T05:00:00Z", nextSyncAt: "2026-07-14T05:00:00Z", isDev: true },
];

function mkOffer(o: Omit<Offer, "createdAt" | "updatedAt" | "isDev" | "score"> & { factors: Parameters<typeof scoreOffer>[0] }): Offer {
  const { factors, ...rest } = o;
  return { ...rest, score: scoreOffer(factors, { at: "2026-07-13T00:00:00Z" }), createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-07-13T00:00:00Z", isDev: true };
}

export const devOffers: Offer[] = [
  mkOffer({ id: "off_bf", title: "Black Friday", description: "Peak retail sales weekend.", category: "major_sales", industry: "retail", country: "US", audience: "both", startDate: "2026-11-27", endDate: "2026-11-27", recurring: true, sourceId: "src_retail_cal", status: "verified", certainty: "confirmed", reliability: 0.9, eligiblePlans: ["business.free", "business.starter", "business.growth", "business.pro"], factors: { reliability: 0.9, relevance: 0.98, reach: 0.95, commercialPotential: 0.97, difficulty: 0.4, competition: 0.9, risk: 0.2 } }),
  mkOffer({ id: "off_cm", title: "Cyber Monday", category: "major_sales", industry: "ecommerce", country: "US", audience: "both", startDate: "2026-11-30", recurring: true, sourceId: "src_retail_cal", status: "verified", certainty: "confirmed", reliability: 0.9, eligiblePlans: ["business.starter", "business.growth", "business.pro"], factors: { reliability: 0.9, relevance: 0.95, reach: 0.9, commercialPotential: 0.95, difficulty: 0.3, competition: 0.85, risk: 0.2 } }),
  mkOffer({ id: "off_boxing", title: "Boxing Day", category: "seasonal", industry: "retail", country: "CA", audience: "consumer", startDate: "2026-12-26", recurring: true, sourceId: "src_ca_events", status: "active", certainty: "confirmed", reliability: 0.85, eligiblePlans: ["business.growth", "business.pro"], factors: { reliability: 0.85, relevance: 0.7, reach: 0.6, commercialPotential: 0.65, difficulty: 0.3, competition: 0.5, risk: 0.2 } }),
  mkOffer({ id: "off_summer", title: "Summer Sale (projected)", category: "seasonal", industry: "apparel", country: "US", audience: "both", startDate: "2026-07-01", recurring: true, sourceId: "src_manual", status: "pending_review", certainty: "estimated", reliability: 0.6, factors: { reliability: 0.6, relevance: 0.6, reach: 0.5, commercialPotential: 0.55, difficulty: 0.3, competition: 0.6, risk: 0.35 } }),
  mkOffer({ id: "off_localfair", title: "Local Trade Fair", category: "cultural", industry: "events", country: "GB", region: "London", city: "London", audience: "business", startDate: "2026-09-15", recurring: false, sourceId: "src_partner_feed", status: "discovered", certainty: "pending", reliability: 0.45, factors: { reliability: 0.45, relevance: 0.4, reach: 0.3, commercialPotential: 0.4, difficulty: 0.6, competition: 0.3, risk: 0.5 } }),
  mkOffer({ id: "off_cancelled", title: "Regional Expo (cancelled)", category: "cultural", industry: "events", country: "US", audience: "business", startDate: "2026-08-20", recurring: false, sourceId: "src_partner_feed", status: "cancelled", certainty: "confirmed", reliability: 0.7, factors: { reliability: 0.7, relevance: 0.5, reach: 0.4, commercialPotential: 0.4, difficulty: 0.4, competition: 0.3, risk: 0.6 } }),
];

export const devCompanies: DevCompany[] = [
  { id: "co_northwind", name: "Northwind Retail", plan: "business.growth", country: "US", industry: "retail", status: "active", registeredAt: "2026-02-11", monthlySpendMinor: 3000, riskScore: 0.12, openIssues: 0, isDev: true },
  { id: "co_acme", name: "Acme Goods", plan: "business.pro", country: "US", industry: "ecommerce", status: "active", registeredAt: "2026-03-02", monthlySpendMinor: 4500, riskScore: 0.2, openIssues: 1, isDev: true },
  { id: "co_globex", name: "Globex Supply", plan: "business.starter", country: "CA", industry: "wholesale", status: "trial", registeredAt: "2026-06-20", monthlySpendMinor: 0, riskScore: 0.45, openIssues: 2, isDev: true },
  { id: "co_initech", name: "Initech Software", plan: "business.free", country: "GB", industry: "saas", status: "suspended", registeredAt: "2026-01-05", monthlySpendMinor: 0, riskScore: 0.8, openIssues: 4, isDev: true },
  { id: "co_demo", name: "Demo Store", plan: "business.free", country: "US", industry: "retail", status: "active", registeredAt: "2026-07-01", monthlySpendMinor: 0, riskScore: 0.1, openIssues: 0, isDev: true },
];

export const devUsers: DevUser[] = [
  { id: "u_1", name: "Alex Owner", companyId: "co_northwind", role: "owner", status: "active", lastActiveAt: "2026-07-13T08:00:00Z", isDev: true },
  { id: "u_2", name: "Sam Editor", companyId: "co_northwind", role: "editor", status: "active", lastActiveAt: "2026-07-12T17:00:00Z", isDev: true },
  { id: "u_3", name: "Jordan Admin", companyId: "co_acme", role: "admin", status: "active", lastActiveAt: "2026-07-13T09:30:00Z", isDev: true },
  { id: "u_4", name: "Riya Viewer", companyId: "co_globex", role: "viewer", status: "invited", lastActiveAt: "2026-07-11T10:00:00Z", isDev: true },
];

export const devJobs: DevJob[] = [
  { id: "job_discover", name: "Discover offers", status: "succeeded", lastRunAt: "2026-07-13T04:00:00Z", nextRunAt: "2026-07-14T04:00:00Z", errorCount: 0, isDev: true },
  { id: "job_verify", name: "Verify sources", status: "running", lastRunAt: "2026-07-13T10:00:00Z", nextRunAt: "2026-07-13T22:00:00Z", errorCount: 0, isDev: true },
  { id: "job_cancel", name: "Detect cancellations", status: "failed", lastRunAt: "2026-07-13T06:00:00Z", nextRunAt: "2026-07-13T18:00:00Z", errorCount: 2, isDev: true },
  { id: "job_scores", name: "Recalculate scores", status: "idle", lastRunAt: "2026-07-12T04:00:00Z", nextRunAt: "2026-07-14T04:00:00Z", errorCount: 0, isDev: true },
];

export const devCommissions: CommissionRecord[] = [
  modelCommission({ id: "cm_1", ruleId: "rule_auto_offer", organizationId: "co_northwind", operation: "automated_offer", baseAmount: 120000, rate: 0.015, currency: "USD", at: "2026-07-01T00:00:00Z", isDev: true }),
  modelCommission({ id: "cm_2", ruleId: "rule_recurring", organizationId: "co_acme", operation: "recurring_campaign", baseAmount: 250000, rate: 0.02, currency: "USD", at: "2026-07-05T00:00:00Z", isDev: true }),
];

/** Platform KPIs derived from the dev seed (for the operational Home). */
export function devPlatformMetrics() {
  return {
    companies: devCompanies.length,
    activeCompanies: devCompanies.filter((c) => c.status === "active").length,
    trials: devCompanies.filter((c) => c.status === "trial").length,
    users: devUsers.length,
    offersActive: devOffers.filter((o) => o.status === "active" || o.status === "verified").length,
    offersNew: devOffers.filter((o) => o.status === "discovered" || o.status === "pending_review").length,
    offersCancelled: devOffers.filter((o) => o.status === "cancelled").length,
    sourcesDown: devSources.filter((s) => s.status === "down").length,
    jobsFailed: devJobs.filter((j) => j.status === "failed").length,
    commissionMinor: devCommissions.reduce((s, c) => s + c.amount, 0),
    countries: [...new Set(devOffers.map((o) => o.country).filter(Boolean))].length,
  };
}
