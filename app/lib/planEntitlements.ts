import type { Plan, PlanId } from "~/types/domain";
import { plans } from "~/data";

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** True when the store has reached its country limit for the given plan. */
export function countryLimitReached(plan: Plan, currentCount: number): boolean {
  return plan.countryLimit !== null && currentCount >= plan.countryLimit;
}

/** True when the store may enable another country. */
export function canAddCountry(plan: Plan, currentCount: number): boolean {
  return !countryLimitReached(plan, currentCount);
}

/** Human-readable limit ("Unlimited" for null). */
export function formatLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : String(limit);
}
