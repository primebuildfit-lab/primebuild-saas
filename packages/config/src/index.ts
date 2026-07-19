/**
 * @eventra/config — the single, shareable source of truth for platform commercial
 * definitions (products, plans, add-ons, entitlements, limits, trials, environments)
 * and the country & locale catalog (markets, languages, currencies, timezones — see
 * ./countries; consumed by Internal OS, Business and Mobile, never duplicated).
 *
 * SAFE TO SHARE IN CODE. Contains NO secrets, API keys, or provider credentials.
 * Prices/limits live here once and are consumed by @eventra/entitlements + apps —
 * never duplicated. Admin-editable overrides come from SystemSetting at runtime (MM2).
 */
import type {
  BusinessPlanId,
  ConsumerAddOnId,
  ConsumerProductId,
  EnvironmentName,
} from "@eventra/types";

// ─────────────────────────── Consumer ───────────────────────────
export const CONSUMER_PRODUCTS: Record<
  ConsumerProductId,
  { id: ConsumerProductId; label: string; priceMonthly: number }
> = {
  "consumer.core": { id: "consumer.core", label: "Consumer Core", priceMonthly: 0 },
  "consumer.deal_intelligence": {
    id: "consumer.deal_intelligence",
    label: "Deal Intelligence",
    priceMonthly: 30,
  },
};

/** Ad-Free is an INDEPENDENT add-on — it is NOT part of any consumer product. */
export const CONSUMER_ADDONS: Record<
  ConsumerAddOnId,
  { id: ConsumerAddOnId; label: string; priceMonthly: number }
> = {
  "addon.ad_free": { id: "addon.ad_free", label: "Ad-Free", priceMonthly: 15 },
};

// ─────────────────────────── Business ───────────────────────────
export interface BusinessPlanConfig {
  id: BusinessPlanId;
  label: string;
  priceMonthly: number;
  /** number of workspaces/store connections; null = unlimited (fair-use). */
  workspaceLimit: number | null;
  /** active countries; 0 = manual only; null = unlimited. */
  countryLimit: number | null;
  /** forward planning horizon in years. */
  planningHorizonYears: number;
}

export const BUSINESS_PLANS: Record<BusinessPlanId, BusinessPlanConfig> = {
  "business.free": {
    id: "business.free", label: "Free", priceMonthly: 0,
    workspaceLimit: 1, countryLimit: 0, planningHorizonYears: 0,
  },
  "business.starter": {
    id: "business.starter", label: "Starter", priceMonthly: 15,
    workspaceLimit: 2, countryLimit: 1, planningHorizonYears: 1,
  },
  "business.growth": {
    id: "business.growth", label: "Growth", priceMonthly: 30,
    workspaceLimit: 3, countryLimit: null, planningHorizonYears: 4,
  },
  "business.pro": {
    id: "business.pro", label: "Business Pro", priceMonthly: 45,
    workspaceLimit: null, countryLimit: null, planningHorizonYears: 10,
  },
};

export const BUSINESS_PLAN_ORDER: BusinessPlanId[] = [
  "business.free", "business.starter", "business.growth", "business.pro",
];

// ─────────────────────────── Trials ───────────────────────────
export const TRIALS = {
  "consumer.deal_intelligence": { days: 30, grants: "consumer.deal_intelligence" as const },
  "business.pro": { days: 45, grants: "business.pro" as const },
} as const;

// ─────────────────────────── Entitlement + feature keys ───────────────────────────
export const ENTITLEMENTS = {
  consumerCore: "consumer.core",
  dealIntelligence: "consumer.deal_intelligence",
  companyFollow: "consumer.company_follow",
  offerNotifications: "consumer.offer_notifications",
  adFree: "addon.ad_free",
  adsSuppressed: "ads.suppressed",
  businessEventCatalogMain: "business.event_catalog.main",
  businessEventCatalogBroad: "business.event_catalog.broad",
  businessMemoryBasic: "business.memory.basic",
  businessMemoryAdvanced: "business.memory.advanced",
  businessTemplates: "business.templates",
  businessCustomDates: "business.custom_dates",
  businessSupplierIntel: "business.supplier_intel",
  businessCompetitorIntel: "business.competitor_intel",
  businessConsumerPromo: "business.consumer_promo",
  businessStorefrontWidgets: "business.storefront_widgets",
  businessMultiStrategy: "business.multi_strategy",
} as const;

// ─────────────────────────── Products / surfaces / envs ───────────────────────────
export const PRODUCTS = {
  consumer: { id: "consumer", name: "Eventra", routeBase: "/" },
  business: { id: "business", name: "Eventra Business", routeBase: "/business" },
  admin: { id: "admin", name: "Eventra Admin Console", routeBase: "/admin" },
} as const;

export const ENVIRONMENTS: EnvironmentName[] = [
  "local", "test", "development", "staging", "production",
];

// ─────────────────────────── Fair-use defaults (non-secret) ───────────────────────────
export const FAIR_USE = {
  /** consumer follow cap for Deal Intelligence (Admin-configurable). */
  consumerFollowLimit: 100,
  /** consumer multi-region cap for Deal Intelligence. */
  consumerCountryLimit: 3,
} as const;

// ─────────────────────────── Getters ───────────────────────────
export function getBusinessPlan(id: BusinessPlanId): BusinessPlanConfig {
  return BUSINESS_PLANS[id];
}
export function consumerProductPrice(id: ConsumerProductId): number {
  return CONSUMER_PRODUCTS[id].priceMonthly;
}
export function adFreePrice(): number {
  return CONSUMER_ADDONS["addon.ad_free"].priceMonthly;
}

// ─────────────────────────── Company reputation & ranking ───────────────────────────
// Single source of truth for the approved reputation numbers + level bands (ORDER §27).
export {
  REPUTATION_CONFIG,
  REPUTATION_LEVELS,
  clampScore,
  resolveReputationLevel,
  reputationFactor,
} from "./reputation";
export type {
  ReputationConfig,
  CancellationPenaltyConfig,
  ReputationLevelId,
  ReputationLevelDef,
} from "./reputation";

// ─────────────────────────── Country & locale catalog ───────────────────────────
// Single source of truth for markets, languages, currencies, timezones (ORDER §4–§6).
export {
  COUNTRIES,
  getCountry,
  countriesByStatus,
  activeCountries,
  primaryLocale,
  localesOf,
  defaultCountry,
  businessMarkets,
} from "./countries";
export type {
  CountryDef,
  CountryLocale,
  CountryStatus,
  CountryCoverage,
  CountryMarket,
} from "./countries";

// ─────────────────────────── Cross-product app links ───────────────────────────
// Single source of truth for navigation/launch between the four Eventra apps
// (Internal OS, Business Admin, Mobile = Tauri; Business Client = web). Pure
// validators + allowlists — no hardcoded URLs scattered across components (ORDER §7/§10).
export {
  EVENTRA_APP_LINKS,
  EVENTRA_TAURI_APPS,
  ALLOWED_APP_IDENTIFIERS,
  ALLOWED_APP_SCHEMES,
  ALLOWED_WEB_HOSTS,
  ALLOWED_WEB_HOST_SUFFIXES,
  isAllowedAppIdentifier,
  isAllowedAppScheme,
  tauriAppByIdentifier,
  isValidDeepLinkRoute,
  buildDeepLink,
  deepLinkFor,
  validateWebTarget,
  resolveBusinessClientUrl,
} from "./appLinks";
export type {
  EventraAppKey,
  EventraTauriApp,
  EventraWebApp,
  EventraAppLink,
} from "./appLinks";
