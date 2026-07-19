/**
 * @eventra/config — Company reputation & ranking: the SINGLE source of truth for
 * the approved reputation numbers (initial/min/max score, completion reward,
 * late-cancellation penalties) and the reputation level bands.
 *
 * SAFE TO SHARE IN CODE. Pure data + three pure, data-driven classifiers (clamp,
 * level, factor). All behavioural logic (timezone-aware penalty calc, the
 * append-only ledger, idempotency, transactions) lives in the Internal-OS engine
 * (`apps/admin/src/engine/reputation*.ts`) and reads these values — the numbers are
 * NEVER duplicated. Admin-editable overrides come from SystemSetting at runtime
 * later (§27 "preparar la configuración para que puedan cambiarse").
 *
 * Approved values (ORDER §27). Do not change without updating docs/DECISIONS.md.
 */

/** The five late-cancellation penalty buckets, keyed by days of anticipation (§6). */
export interface CancellationPenaltyConfig {
  /** 4+ days of anticipation — the company warned in time. */
  fourOrMoreDays: number;
  threeDays: number;
  twoDays: number;
  oneDay: number;
  /** same day, at the activation time, or after it should have started. */
  sameDayOrAfter: number;
}

export interface ReputationConfig {
  minimumScore: number;
  maximumScore: number;
  initialScore: number;
  /** points awarded when a promotion is confirmed completed (§5). */
  completedPromotionReward: number;
  cancellationPenalty: CancellationPenaltyConfig;
}

/** The approved reputation configuration (ORDER §27). */
export const REPUTATION_CONFIG: ReputationConfig = {
  minimumScore: 100,
  maximumScore: 1000,
  initialScore: 800,
  completedPromotionReward: 10,
  cancellationPenalty: {
    fourOrMoreDays: 0,
    threeDays: -10,
    twoDays: -20,
    oneDay: -30,
    sameDayOrAfter: -60,
  },
};

// ─────────────────────────── Reputation levels (§4) ───────────────────────────

export type ReputationLevelId =
  | "deplorable"
  | "bien"
  | "bueno"
  | "mejor"
  | "maxima_calidad";

export interface ReputationLevelDef {
  id: ReputationLevelId;
  /** Spanish label shown in the product. */
  label: string;
  /** inclusive lower bound */
  min: number;
  /** inclusive upper bound */
  max: number;
}

/**
 * Five non-overlapping bands. `maxima_calidad` is reached ONLY when the score is
 * exactly the maximum (1000). Order matters: bands are scanned in ascending order.
 */
export const REPUTATION_LEVELS: readonly ReputationLevelDef[] = [
  { id: "deplorable", label: "Deplorable", min: 100, max: 499 },
  { id: "bien", label: "Bien", min: 500, max: 699 },
  { id: "bueno", label: "Bueno", min: 700, max: 849 },
  { id: "mejor", label: "Mejor", min: 850, max: 999 },
  { id: "maxima_calidad", label: "Máxima calidad", min: 1000, max: 1000 },
];

// ─────────────────────────── Pure, data-driven classifiers ───────────────────────────

/**
 * Safe bound (§3): never below the minimum, never above the maximum. NaN → minimum.
 * `effectiveScore = Math.max(min, Math.min(max, calculatedScore))`.
 */
export function clampScore(
  score: number,
  cfg: ReputationConfig = REPUTATION_CONFIG,
): number {
  if (Number.isNaN(score)) return cfg.minimumScore;
  return Math.max(cfg.minimumScore, Math.min(cfg.maximumScore, Math.round(score)));
}

/** Resolve the reputation level band for a score (clamped first, so always defined). */
export function resolveReputationLevel(
  score: number,
  cfg: ReputationConfig = REPUTATION_CONFIG,
): ReputationLevelDef {
  const s = clampScore(score, cfg);
  const found = REPUTATION_LEVELS.find((l) => s >= l.min && s <= l.max);
  // Bands cover [min..max] exhaustively; the fallback keeps the return type total.
  return found ?? REPUTATION_LEVELS[0];
}

/**
 * Normalised ranking input for Eventra Mobile (§14): `score / maximumScore`, in
 * [minimum/maximum .. 1]. NOT a final ranking formula — a single input the future
 * ranking function combines with relevance, country, membership, etc.
 */
export function reputationFactor(
  score: number,
  cfg: ReputationConfig = REPUTATION_CONFIG,
): number {
  return clampScore(score, cfg) / cfg.maximumScore;
}
