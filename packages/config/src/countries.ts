/**
 * @eventra/config — Country & locale catalog: the SINGLE source of truth for the
 * platform's markets, their languages (locales), currencies, timezones, region and
 * activation status.
 *
 * SAFE TO SHARE IN CODE. Pure data + pure resolvers. This catalog is consumed by:
 *   · Internal OS (apps/admin) — the "Países" screen renders it; the admin decides
 *     the primary language, secondary languages, coverage and status of a country.
 *   · Eventra Business Client (apps/business-client) — its market list is a projection of the
 *     ACTIVE countries here (never a duplicated list).
 *   · Eventra Mobile (apps/consumer) — resolves its country + display language from
 *     the same catalog.
 *
 * There is exactly ONE list of countries in the codebase — this one. If the primary
 * language of a country changes here, every module that reads `primaryLocale()`
 * uses the new value automatically (ORDER §6). Runtime admin-editable overrides
 * (SystemSetting) are a future step; today the catalog is the authoritative config.
 *
 * Locale codes are standard BCP-47 (`en-US`, `fr-CA`, …); labels are human-readable
 * so the UI never shows a bare code (ORDER §5).
 */

/** Activation status of a country. Business shows only `active` markets. */
export type CountryStatus = "active" | "beta" | "planned";

/** How complete the event/data coverage is for a country (config decision, not a metric). */
export type CountryCoverage = "complete" | "partial" | "basic";

/** A language available in a country: standard locale code + a readable label. */
export interface CountryLocale {
  /** BCP-47 locale, e.g. "en-US", "fr-CA". Stored internally (ORDER §5). */
  code: string;
  /** Human-readable name shown in the UI, e.g. "English (US)". */
  label: string;
}

/** A country in the platform catalog. */
export interface CountryDef {
  /** ISO 3166-1 alpha-2, uppercase, e.g. "US". */
  code: string;
  /** Canonical English name, e.g. "United States". */
  name: string;
  /** Spanish display name, e.g. "Estados Unidos". */
  nameEs: string;
  /** Flag emoji. */
  flag: string;
  /** Region label (Spanish, matches the Internal OS taxonomy). */
  region: string;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  /** Representative IANA timezone for the market, e.g. "America/New_York". */
  timezone: string;
  /** Primary language of the country (ORDER §5). */
  primaryLocale: CountryLocale;
  /** Additional supported languages, may be empty. */
  secondaryLocales: CountryLocale[];
  /** Activation status. */
  status: CountryStatus;
  /** Data/event coverage level (config decision). */
  coverage: CountryCoverage;
}

// Standard locales, defined once and referenced below so labels never drift.
const EN_US: CountryLocale = { code: "en-US", label: "English (US)" };
const ES_US: CountryLocale = { code: "es-US", label: "Español" };
const EN_CA: CountryLocale = { code: "en-CA", label: "English (Canada)" };
const FR_CA: CountryLocale = { code: "fr-CA", label: "Français" };
const ES_ES: CountryLocale = { code: "es-ES", label: "Español" };
const ES_MX: CountryLocale = { code: "es-MX", label: "Español (México)" };
const EN_GB: CountryLocale = { code: "en-GB", label: "English (UK)" };

/**
 * The country catalog — the single source of truth.
 * Only `active` countries are exposed to Business/Mobile as selectable markets.
 */
export const COUNTRIES: CountryDef[] = [
  {
    code: "US", name: "United States", nameEs: "Estados Unidos", flag: "🇺🇸",
    region: "Norteamérica", currency: "USD", timezone: "America/New_York",
    primaryLocale: EN_US, secondaryLocales: [ES_US],
    status: "active", coverage: "complete",
  },
  {
    code: "CA", name: "Canada", nameEs: "Canadá", flag: "🇨🇦",
    region: "Norteamérica", currency: "CAD", timezone: "America/Toronto",
    primaryLocale: EN_CA, secondaryLocales: [FR_CA],
    status: "active", coverage: "partial",
  },
  {
    code: "GB", name: "United Kingdom", nameEs: "Reino Unido", flag: "🇬🇧",
    region: "Europa", currency: "GBP", timezone: "Europe/London",
    primaryLocale: EN_GB, secondaryLocales: [],
    status: "beta", coverage: "partial",
  },
  {
    code: "ES", name: "Spain", nameEs: "España", flag: "🇪🇸",
    region: "Europa", currency: "EUR", timezone: "Europe/Madrid",
    primaryLocale: ES_ES, secondaryLocales: [],
    status: "planned", coverage: "basic",
  },
  {
    code: "MX", name: "Mexico", nameEs: "México", flag: "🇲🇽",
    region: "Latinoamérica", currency: "MXN", timezone: "America/Mexico_City",
    primaryLocale: ES_MX, secondaryLocales: [],
    status: "planned", coverage: "basic",
  },
];

// ─────────────────────────── Resolvers (pure) ───────────────────────────

/** Look up a country by ISO code (case-insensitive). */
export function getCountry(code: string): CountryDef | undefined {
  const up = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === up);
}

/** Countries with a given status. */
export function countriesByStatus(status: CountryStatus): CountryDef[] {
  return COUNTRIES.filter((c) => c.status === status);
}

/** The markets Business/Mobile may actually select — `active` only. */
export function activeCountries(): CountryDef[] {
  return countriesByStatus("active");
}

/**
 * The BCP-47 primary locale of a country (ORDER §6). Every module that needs the
 * language of a market reads this — change it in the catalog and all follow.
 * Falls back to `en-US` for an unknown code so callers never get `undefined`.
 */
export function primaryLocale(code: string): string {
  return getCountry(code)?.primaryLocale.code ?? EN_US.code;
}

/** All locales (primary + secondary) supported in a country, primary first. */
export function localesOf(code: string): CountryLocale[] {
  const c = getCountry(code);
  if (!c) return [];
  return [c.primaryLocale, ...c.secondaryLocales];
}

/**
 * The default market for a phone/consumer session: the first `active` country.
 * Real consumption point for Eventra Mobile's header (ORDER §6).
 */
export function defaultCountry(): CountryDef {
  return activeCountries()[0] ?? COUNTRIES[0];
}

/** Minimal projection used by Eventra Business's market list. */
export interface CountryMarket {
  code: string;
  name: string;
  flag: string;
}

/**
 * Business market list — a PROJECTION of the active catalog, never a second list
 * (ORDER §6). Business filters/plan-gates on top of this; it does not redefine it.
 */
export function businessMarkets(): CountryMarket[] {
  return activeCountries().map((c) => ({ code: c.code, name: c.name, flag: c.flag }));
}
