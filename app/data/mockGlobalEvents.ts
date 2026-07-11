import type { GlobalEvent } from "~/types/domain";

/**
 * Platform-owned official date catalog (admin-managed in Phase 4).
 * US is complete for the initial release; Canada's catalog may be finished later (D22).
 * Importance: high=green, medium=amber, low=red (D11).
 */
export const globalEvents: GlobalEvent[] = [
  // ---- United States ----
  {
    id: "ge_us_newyear",
    name: "New Year's Day",
    countryCodes: ["US", "CA"],
    startRule: { kind: "fixed", month: 1, day: 1 },
    category: "national_holiday",
    importance: "medium",
    description: "Fresh-start and clearance shopping moment.",
    recommendedLeadDays: 14,
    recurring: true,
  },
  {
    id: "ge_us_valentines",
    name: "Valentine's Day",
    countryCodes: ["US", "CA"],
    startRule: { kind: "fixed", month: 2, day: 14 },
    category: "cultural",
    importance: "medium",
    description: "Gifting peak for many niches.",
    recommendedLeadDays: 21,
    recurring: true,
  },
  {
    id: "ge_us_independence",
    name: "Independence Day",
    countryCodes: ["US"],
    startRule: { kind: "fixed", month: 7, day: 4 },
    category: "national_holiday",
    importance: "high",
    description: "Major US summer sale anchor.",
    recommendedLeadDays: 21,
    recurring: true,
  },
  {
    id: "ge_us_backtoschool",
    name: "Back to School",
    countryCodes: ["US", "CA"],
    startRule: { kind: "fixed", month: 8, day: 1 },
    endRule: { kind: "fixed", month: 9, day: 15 },
    category: "seasonal",
    importance: "high",
    description: "Extended seasonal buying window.",
    recommendedLeadDays: 30,
    recurring: true,
  },
  {
    id: "ge_us_halloween",
    name: "Halloween",
    countryCodes: ["US", "CA"],
    startRule: { kind: "fixed", month: 10, day: 31 },
    category: "seasonal",
    importance: "medium",
    description: "Costume, décor, and themed-product spike.",
    recommendedLeadDays: 30,
    recurring: true,
  },
  {
    id: "ge_us_blackfriday",
    name: "Black Friday",
    countryCodes: ["US", "CA"],
    // Day after US Thanksgiving = 4th Thursday of November + 1 day.
    // Correct in every year (see docs/RECURRENCE.md).
    startRule: { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 1 },
    category: "major_sales",
    importance: "high",
    description: "The single biggest sales day of the year.",
    recommendedLeadDays: 45,
    recurring: true,
  },
  {
    id: "ge_us_cybermonday",
    name: "Cyber Monday",
    countryCodes: ["US", "CA"],
    // Monday after Thanksgiving = 4th Thursday of November + 4 days.
    startRule: { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 4 },
    category: "major_sales",
    importance: "high",
    description: "Online-focused follow-up to Black Friday.",
    recommendedLeadDays: 45,
    recurring: true,
  },
  {
    id: "ge_us_christmas",
    name: "Christmas",
    countryCodes: ["US", "CA"],
    startRule: { kind: "fixed", month: 12, day: 25 },
    category: "major_sales",
    importance: "high",
    description: "Peak holiday gifting period.",
    recommendedLeadDays: 45,
    recurring: true,
  },

  // ---- Canada ----
  {
    id: "ge_ca_canadaday",
    name: "Canada Day",
    countryCodes: ["CA"],
    startRule: { kind: "fixed", month: 7, day: 1 },
    category: "national_holiday",
    importance: "high",
    description: "Major Canadian summer sale anchor.",
    recommendedLeadDays: 21,
    recurring: true,
  },
  {
    id: "ge_ca_thanksgiving",
    name: "Canadian Thanksgiving",
    countryCodes: ["CA"],
    // 2nd Monday of October
    startRule: { kind: "nth_weekday", month: 10, weekday: 1, nth: 2 },
    category: "national_holiday",
    importance: "medium",
    description: "Autumn family and home spending moment.",
    recommendedLeadDays: 21,
    recurring: true,
  },
  {
    id: "ge_ca_boxingday",
    name: "Boxing Day",
    countryCodes: ["CA"],
    startRule: { kind: "fixed", month: 12, day: 26 },
    category: "major_sales",
    importance: "high",
    description: "Post-Christmas clearance peak in Canada.",
    recommendedLeadDays: 30,
    recurring: true,
  },
];
