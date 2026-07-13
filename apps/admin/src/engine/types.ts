/**
 * Eventra Internal OS — Offer Engine domain types (Phase 7, Nivel A).
 *
 * Platform-owned data curated by Eventra staff (NOT tenant data). These types are
 * the single in-code contract for the offer engine; the persistence shape mirrors
 * them in `supabase/migrations/0004_internal_os.sql`. Pure types — no I/O.
 */

export type OfferStatus =
  | "discovered"
  | "pending_review"
  | "verified"
  | "active"
  | "modified"
  | "cancelled"
  | "expired"
  | "archived"
  | "rejected"
  | "duplicate";

/** How trustworthy a date/offer is — never present an estimate as confirmed (Bloque 7). */
export type DateCertainty =
  | "confirmed" // officially published
  | "estimated" // inferred from recurrence, not yet published
  | "historical_projection" // projected from prior editions
  | "pending"; // expected but unknown

export type SourceMethod = "manual" | "api" | "feed" | "public_calendar" | "collaborator" | "ai" | "import";

export type SourceStatus = "healthy" | "degraded" | "down" | "disabled";

export interface OfferSource {
  id: string;
  name: string;
  country?: string;
  region?: string;
  method: SourceMethod;
  url?: string;
  status: SourceStatus;
  /** how often it is polled, in hours */
  frequencyHours: number;
  lastSyncAt?: string; // ISO
  nextSyncAt?: string; // ISO
  /** 0..1 trust in this source's data */
  reliability: number;
  errorCount: number;
  isDev?: boolean; // dev-seed marker — never in production
}

/** The seven weighted factors that drive an offer's composite score (0..100). */
export interface OfferScoreFactors {
  reliability: number; // 0..1  source/data trust
  relevance: number; // 0..1  fit to Eventra audiences
  reach: number; // 0..1  potential audience size
  commercialPotential: number; // 0..1
  difficulty: number; // 0..1  higher = harder (penalty)
  competition: number; // 0..1  higher = more crowded (penalty)
  risk: number; // 0..1  higher = riskier (penalty)
}

export type OfferPriority = "low" | "medium" | "high" | "critical";

export interface OfferScore {
  /** composite 0..100 */
  value: number;
  priority: OfferPriority;
  factors: OfferScoreFactors;
  /** true when a human confirmed/overrode the automatic score */
  manualOverride?: boolean;
  scoredAt: string; // ISO
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  category?: string;
  industry?: string;
  country?: string;
  region?: string;
  city?: string;
  audience?: "business" | "consumer" | "both";
  startDate: string; // ISO date
  endDate?: string; // ISO date
  /** annual by default; the horizon expander uses this */
  recurring: boolean;
  sourceId: string;
  status: OfferStatus;
  certainty: DateCertainty;
  reliability: number; // 0..1
  score?: OfferScore;
  /** plan ids eligible to receive this offer (canonical business.* ids) */
  eligiblePlans?: string[];
  lastVerifiedAt?: string; // ISO
  nextVerificationAt?: string; // ISO
  /** content hash of the source payload — drives change detection */
  contentHash?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isDev?: boolean; // dev-seed marker
}

/** A concrete dated instance of a (possibly recurring) offer within the horizon. */
export interface OfferOccurrence {
  offerId: string;
  year: number;
  date: string; // ISO date
  certainty: DateCertainty;
}
