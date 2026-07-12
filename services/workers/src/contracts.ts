/**
 * @eventra/workers — background worker contracts (FOUNDATION ONLY).
 * Typed job/worker interfaces. NO queue, NO scheduler, NO external calls here.
 * Implemented in later Mega Modules.
 */

/** Worker domains + ownership (see docs/PLATFORM_ARCHITECTURE.md). */
export const WORKER_DOMAINS = [
  "notifications", // fan-out, retries, delivery status
  "deal_monitoring", // legal/approved source polling → candidates
  "verification", // deal review support (human-gated)
  "billing_reconciliation", // provider webhooks → entitlements
  "analytics_aggregation",
  "cleanup_retention", // downgrade/archival retention jobs
  "integration_sync", // commerce connection sync
] as const;
export type WorkerDomain = (typeof WORKER_DOMAINS)[number];

export interface JobContext {
  jobId: string;
  /** idempotency key — workers must dedupe on this. */
  dedupeKey: string;
  scheduledAt: string;
}

export interface Worker<TInput = unknown> {
  readonly domain: WorkerDomain;
  /** narrow, task-specific access only (least privilege). Implemented later. */
  run(input: TInput, ctx: JobContext): Promise<void>;
}
