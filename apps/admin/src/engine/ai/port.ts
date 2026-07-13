/**
 * AI provider PORT (Phase 7, Bloque 28). The Internal OS never calls a paid model
 * directly — it goes through this abstract port. A deterministic fake implements it
 * for dev/tests; a real provider (behind OBSERVABILITY/AI credentials) is added
 * later, ONLY with Brian's authorization. Rules baked into the contract:
 *   - every result carries a confidence + cost + prompt version (auditable);
 *   - low-confidence results REQUIRE human review and must never auto-publish;
 *   - output is structured/typed, never free-form that the app blindly trusts.
 */

export type AITask =
  | "classify"
  | "deduplicate"
  | "score_suggest"
  | "summarize"
  | "translate"
  | "detect_change"
  | "content_suggest";

/** Below this confidence, a human MUST review before anything is published/acted on. */
export const HUMAN_REVIEW_THRESHOLD = 0.7;

export interface AIRequest<TInput = unknown> {
  task: AITask;
  input: TInput;
  /** target locale for translate/content tasks */
  locale?: string;
}

export interface AIResult<TOutput = unknown> {
  task: AITask;
  output: TOutput;
  /** 0..1 model confidence */
  confidence: number;
  /** requiresHumanReview is TRUE whenever confidence < HUMAN_REVIEW_THRESHOLD */
  requiresHumanReview: boolean;
  model: string;
  /** estimated cost in USD (0 for the fake) */
  costUsd: number;
  promptVersion: string;
}

export interface AIProvider {
  readonly id: string;
  run<TInput, TOutput>(req: AIRequest<TInput>): Promise<AIResult<TOutput>>;
}

/** Never let a low-confidence AI output be published/applied automatically. */
export function mayAutoApply(result: AIResult): boolean {
  return !result.requiresHumanReview && result.confidence >= HUMAN_REVIEW_THRESHOLD;
}
