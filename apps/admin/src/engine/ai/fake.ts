/**
 * Deterministic fake AI provider (Phase 7, Bloque 28). Same input → same output,
 * always, so tests and dev are stable and NO paid model is called. Confidence is
 * derived deterministically; some inputs fall below HUMAN_REVIEW_THRESHOLD so the
 * human-review path is always exercised. Cost is always 0. NEVER auto-publishes.
 */
import {
  type AIProvider,
  type AIRequest,
  type AIResult,
  HUMAN_REVIEW_THRESHOLD,
} from "./port";

const PROMPT_VERSION = "fake-v1";

/** Small stable string hash (FNV-1a) → 0..1. */
function hash01(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // >>> 0 to unsigned, then normalize
  return ((h >>> 0) % 1000) / 1000;
}

const CATEGORIES = ["major_sales", "seasonal", "national_holiday", "cultural"] as const;

export class DeterministicFakeAI implements AIProvider {
  readonly id = "fake";

  async run<TInput, TOutput>(req: AIRequest<TInput>): Promise<AIResult<TOutput>> {
    const key = `${req.task}:${req.locale ?? ""}:${stableStringify(req.input)}`;
    const seed = hash01(key);
    // Confidence 0.5..0.95; ~20% of inputs land under the review threshold.
    const confidence = Math.round((0.5 + seed * 0.45) * 100) / 100;

    let output: unknown;
    switch (req.task) {
      case "classify":
        output = { category: CATEGORIES[Math.floor(seed * CATEGORIES.length)] };
        break;
      case "deduplicate":
        output = { isDuplicate: seed > 0.85, ofOfferId: null };
        break;
      case "score_suggest":
        output = {
          factors: {
            reliability: round(seed),
            relevance: round(1 - seed),
            reach: round((seed + 0.3) % 1),
            commercialPotential: round((seed + 0.5) % 1),
            difficulty: round(seed * 0.4),
            competition: round(seed * 0.5),
            risk: round(seed * 0.3),
          },
        };
        break;
      case "summarize":
        output = { summary: `Summary (fake) of ${describe(req.input)}` };
        break;
      case "translate":
        output = { text: `[${req.locale ?? "xx"}] ${describe(req.input)}` };
        break;
      case "detect_change":
        output = { changed: seed > 0.5, semantic: seed > 0.9 ? "major" : "minor" };
        break;
      case "content_suggest":
        output = { title: `Offer (fake) ${describe(req.input)}`, cta: "Learn more" };
        break;
      default:
        output = {};
    }

    return {
      task: req.task,
      output: output as TOutput,
      confidence,
      requiresHumanReview: confidence < HUMAN_REVIEW_THRESHOLD,
      model: "deterministic-fake",
      costUsd: 0,
      promptVersion: PROMPT_VERSION,
    };
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
function describe(input: unknown): string {
  const s = stableStringify(input);
  return s.length > 40 ? `${s.slice(0, 37)}...` : s;
}
/** Stable key regardless of property order. */
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const obj = v as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}
