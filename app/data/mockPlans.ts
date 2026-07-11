import type { Plan } from "~/types/domain";

/**
 * Working prices/limits (D9). Single source of truth — never hardcode elsewhere.
 * Server-side enforcement of these limits arrives in Phase 5.
 */
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    countryLimit: 1,
    planningHorizonMonths: 2,
    savedCampaignLimit: 5,
    features: [
      "Core calendar",
      "Main events",
      "Manual campaigns",
      "Basic reminders",
      "1 country",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 10,
    countryLimit: 2,
    planningHorizonMonths: 4,
    savedCampaignLimit: 20,
    features: [
      "Everything in Free",
      "More categories & capacity",
      "Basic campaign history",
      "Campaign duplication",
      "2 countries",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 20,
    countryLimit: 3,
    planningHorizonMonths: 8,
    savedCampaignLimit: 100,
    features: [
      "Everything in Starter",
      "Longer history",
      "Plan up to 8 months ahead",
      "Better filters & organization",
      "3 countries",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    priceMonthly: 50,
    countryLimit: null,
    planningHorizonMonths: 12,
    savedCampaignLimit: null,
    features: [
      "Everything in Growth",
      "All countries",
      "Plan 12+ months ahead",
      "Recurring yearly workflows",
      "Advanced templates",
    ],
  },
];
