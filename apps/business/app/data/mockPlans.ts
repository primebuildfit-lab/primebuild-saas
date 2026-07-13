import type { Plan } from "~/types/domain";

/**
 * Business plan DISPLAY façade (legacy vocabulary: free|starter|growth|vip).
 *
 * ⚠️ SINGLE SOURCE OF TRUTH FOR AUTHORIZATION/ENFORCEMENT IS `@eventra/config`
 * (`BUSINESS_PLANS`, the locked model business.free/starter/growth/pro). This file
 * is ONLY the current merchant-facing display layer and is bridged to the canonical
 * model by `~/lib/planModel.ts`. Server enforcement reads the canonical config, not
 * these display fields (see docs/DECISIONS.md D70 and docs/STABILIZATION_2026-07-13.md).
 *
 * These display values still show the OLD working prices ($0/$10/$20/$50, month
 * horizons). Converging the merchant-facing display onto the locked model
 * ($0/$15/$30/$45, "Business Pro", year horizons) is an APPROVED-business-rule change
 * that is intentionally deferred to Brian's sign-off — do not flip silently.
 * Whenever these display values change, they must stay derivable from / consistent
 * with `@eventra/config`; never introduce a third set of numbers.
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
