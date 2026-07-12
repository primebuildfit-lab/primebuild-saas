/** System/platform types (flags, config). */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  /** optional targeting: surface, cohort, or rollout percentage. */
  surface?: "consumer" | "business" | "admin";
  rolloutPct?: number;
}
