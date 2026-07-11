import type { Country } from "~/types/domain";

/**
 * Global country catalog (platform-owned, NO per-store enabled flag).
 * Per-store enablement lives in StoreCountry (see mockStoreCountries.ts).
 * V1 ships US + Canada (D22).
 */
export const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}
