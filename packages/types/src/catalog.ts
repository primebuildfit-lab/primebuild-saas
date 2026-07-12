/** Platform-owned shared catalog (countries, categories, official events). */

export type CountryCode = string; // ISO 3166-1 alpha-2

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
}

export interface Region {
  countryCode: CountryCode;
  name: string;
}

export type EventCategory =
  | "major_sales"
  | "national_holiday"
  | "seasonal"
  | "cultural";

/** Commercial importance of an official date: high=green, medium=amber, low=red. */
export type Importance = "high" | "medium" | "low";

/**
 * Recurrence rule resolved to a concrete date per year. `offsetDays` shifts the
 * resolved date (e.g. Black Friday = 4th Thursday of Nov + 1). See @eventra/calendar.
 */
export interface DateRule {
  kind: "fixed" | "nth_weekday";
  month: number; // 1–12
  day?: number; // fixed
  weekday?: number; // nth_weekday: 0=Sun..6=Sat
  nth?: number; // 1–5 or -1 = last
  offsetDays?: number;
}

export interface GlobalEvent {
  id: string;
  name: string;
  countryCodes: CountryCode[];
  startRule: DateRule;
  endRule?: DateRule;
  category: EventCategory;
  importance: Importance;
  description?: string;
  recommendedLeadDays?: number;
  recurring: boolean;
}
