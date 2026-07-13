/**
 * Offer change & cancellation detection (Phase 7, Bloque 8). Pure diff between a
 * previously-seen offer snapshot and a freshly-fetched one. Real source polling is
 * a job (mock for now); this is the deterministic core it calls, so change/cancel
 * classification is testable without any network.
 */
import type { Offer } from "./types";

export type ChangeImpact = "none" | "minor" | "major" | "critical";

export interface OfferChange {
  offerId: string;
  changed: boolean;
  cancelled: boolean;
  /** field names that differ (excludes bookkeeping timestamps) */
  fields: string[];
  impact: ChangeImpact;
}

// Fields that matter for merchants; date/status changes are the most impactful.
const WATCHED: (keyof Offer)[] = [
  "title", "description", "startDate", "endDate", "status", "country",
  "region", "city", "category", "industry", "contentHash",
];

const MAJOR_FIELDS = new Set<keyof Offer>(["startDate", "endDate"]);

export function detectOfferChange(prev: Offer, next: Offer): OfferChange {
  const cancelled = prev.status !== "cancelled" && next.status === "cancelled";
  const fields: string[] = [];
  for (const f of WATCHED) {
    if (prev[f] !== next[f]) fields.push(f);
  }
  const changed = fields.length > 0;

  let impact: ChangeImpact = "none";
  if (cancelled) impact = "critical";
  else if (fields.some((f) => MAJOR_FIELDS.has(f as keyof Offer))) impact = "major";
  else if (fields.some((f) => f !== "contentHash")) impact = "minor";
  else if (changed) impact = "minor";

  return { offerId: next.id, changed, cancelled, fields, impact };
}

/** True when a change warrants alerting affected companies immediately. */
export function isAlertable(change: OfferChange): boolean {
  return change.impact === "major" || change.impact === "critical";
}
