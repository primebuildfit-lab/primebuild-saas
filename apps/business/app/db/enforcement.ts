/**
 * Server-side entitlement enforcement (MM5, Part 6). Pure guards used INSIDE the
 * repository write path so plan limits are enforced by the server, not just shown
 * by the client. Authoritative limits come from `@eventra/entitlements` via
 * `planModel` (the locked model) — never the legacy mock display fields.
 *
 * Downgrade is non-destructive: over-limit resources become READ-ONLY (writes
 * blocked with a clear reason), never deleted (D51).
 */
import type { PlanId, StoreCountry } from "~/types/domain";
import { lockedCountryLimit, lockedWorkspaceLimit } from "~/lib/planModel";
import { RepositoryError } from "./repository";

/**
 * Guard enabling another country. `currentEnabledCount` excludes the target.
 * countryLimit: Free 0 (manual only) · Starter 1 · Growth/Pro unlimited (null).
 */
export function assertCanEnableCountry(planId: PlanId, currentEnabledCount: number): void {
  const limit = lockedCountryLimit(planId);
  if (limit !== null && currentEnabledCount >= limit) {
    const noun = limit === 1 ? "country" : "countries";
    throw new RepositoryError(
      limit === 0
        ? "Your plan is manual-only (0 managed countries). Upgrade to enable countries; your data is retained."
        : `Your plan allows ${limit} active ${noun}. Upgrade to enable more; existing data is retained.`,
      "forbidden",
    );
  }
}

/**
 * Which enabled countries are over the plan limit and therefore READ-ONLY after a
 * downgrade (kept, never deleted). Returns the read-only country codes.
 */
export function readOnlyCountryCodes(
  planId: PlanId,
  storeCountries: readonly StoreCountry[],
): string[] {
  const limit = lockedCountryLimit(planId);
  if (limit === null) return [];
  return storeCountries
    .filter((c) => c.enabled)
    .slice(limit)
    .map((c) => c.countryCode);
}

/** Guard creating another workspace (V1 Business slice = 1 workspace; here for completeness). */
export function assertCanAddWorkspace(planId: PlanId, currentCount: number): void {
  const limit = lockedWorkspaceLimit(planId);
  if (limit !== null && currentCount >= limit) {
    throw new RepositoryError(
      `Your plan allows ${limit} workspace${limit === 1 ? "" : "s"}. Upgrade to add more.`,
      "forbidden",
    );
  }
}
