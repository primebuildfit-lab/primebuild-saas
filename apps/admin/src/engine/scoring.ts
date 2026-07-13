/**
 * Deterministic offer scoring (Phase 7, Bloque 5/6). Pure, no I/O, no AI call —
 * the AI can *suggest* factors, but the composite is a transparent, auditable
 * formula so a human can always explain a score.
 */
import type { OfferScoreFactors, OfferPriority, OfferScore } from "./types";

// Positive factors add; penalty factors subtract. Weights sum to a 0..100 scale.
const WEIGHTS = {
  reliability: 22,
  relevance: 22,
  reach: 18,
  commercialPotential: 22,
  // penalties (subtracted)
  difficulty: 8,
  competition: 8,
  risk: 8,
} as const;

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Composite 0..100 from the seven factors (positives add, penalties subtract). */
export function compositeScore(f: OfferScoreFactors): number {
  const positive =
    clamp01(f.reliability) * WEIGHTS.reliability +
    clamp01(f.relevance) * WEIGHTS.relevance +
    clamp01(f.reach) * WEIGHTS.reach +
    clamp01(f.commercialPotential) * WEIGHTS.commercialPotential;
  const penalty =
    clamp01(f.difficulty) * WEIGHTS.difficulty +
    clamp01(f.competition) * WEIGHTS.competition +
    clamp01(f.risk) * WEIGHTS.risk;
  return Math.round(Math.min(100, Math.max(0, positive - penalty)));
}

export function priorityFor(value: number): OfferPriority {
  if (value >= 80) return "critical";
  if (value >= 60) return "high";
  if (value >= 35) return "medium";
  return "low";
}

/** Build a full OfferScore (auto). `manualOverride` marks human-set scores. */
export function scoreOffer(
  factors: OfferScoreFactors,
  opts: { manualOverride?: boolean; at?: string } = {},
): OfferScore {
  const value = compositeScore(factors);
  return {
    value,
    priority: priorityFor(value),
    factors,
    manualOverride: opts.manualOverride,
    scoredAt: opts.at ?? new Date().toISOString(),
  };
}

/** Sort offers best-first by composite score (stable for equal scores). */
export function byScoreDesc<T extends { score?: { value: number } }>(a: T, b: T): number {
  return (b.score?.value ?? -1) - (a.score?.value ?? -1);
}
