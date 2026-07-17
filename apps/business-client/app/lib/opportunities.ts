import { differenceInCalendarDays, startOfDay } from "date-fns";
import type {
  Campaign,
  EventCategory,
  EventPrepStatus,
  GlobalEvent,
  Importance,
  StoreEventPreference,
} from "~/types/domain";
import {
  eventInCountries,
  eventOccurrence,
  eventPrepStatus,
  type Occurrence,
} from "~/lib/events";
import {
  getOpportunitySignal,
  type OpportunitySignal,
} from "~/data/mockOpportunitySignals";

/**
 * Opportunity engine — the heart of the reorganised Business product.
 *
 * Eventra is a system for *discovering marketing opportunities*; the calendar is
 * only one lens on them. This module turns the raw official-date catalog into
 * ranked, scored, stateful opportunities by combining, for a given store:
 *   • the event's commercial importance + category (how big the moment is),
 *   • timing/urgency relative to today and the recommended lead time,
 *   • market reach (how many enabled countries it touches),
 *   • a discovery signal (source + reliability + freshness), and
 *   • the store's own actions (linked campaigns, dismissals).
 *
 * Everything here is pure and deterministic so it is unit-testable and so the
 * same numbers appear on the dashboard, the Opportunities screen, and analytics.
 */

/** Discovery lifecycle of an opportunity for a store. */
export type OpportunityState =
  | "verified"
  | "new"
  | "modified"
  | "cancelled"
  | "archived";

export type OpportunityPriority = "urgent" | "high" | "medium" | "low";
export type OpportunityDifficulty = "easy" | "moderate" | "hard";

export interface ScoredOpportunity {
  /** stable id: `${eventId}:${year}` */
  id: string;
  event: GlobalEvent;
  year: number;
  occurrence: Occurrence;
  category: EventCategory;
  importance: Importance;
  countryCodes: string[];
  /** enabled markets this opportunity applies to */
  reachCodes: string[];
  daysUntil: number;
  /** 0–100 composite opportunity score */
  score: number;
  priority: OpportunityPriority;
  difficulty: OpportunityDifficulty;
  /** 0–100 source/date confidence */
  reliability: number;
  state: OpportunityState;
  source: string;
  hasCampaign: boolean;
  prepStatus: EventPrepStatus;
  /** true when it sits within the plan's planning horizon */
  withinPlanHorizon: boolean;
}

const IMPORTANCE_BASE: Record<Importance, number> = {
  high: 55,
  medium: 40,
  low: 25,
};

const CATEGORY_WEIGHT: Record<EventCategory, number> = {
  major_sales: 20,
  seasonal: 12,
  national_holiday: 8,
  cultural: 6,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/** Urgency bonus: peaks when the recommended prep window is open right now. */
function urgencyBonus(daysUntil: number, leadDays: number): number {
  if (daysUntil < 0) return 0;
  if (daysUntil <= leadDays) {
    // Inside the prep window — the closer to the event, the more urgent.
    const ratio = 1 - daysUntil / Math.max(leadDays, 1);
    return Math.round(6 + ratio * 9); // 6..15
  }
  // Approaching but not yet in-window — a small, decaying nudge.
  const beyond = daysUntil - leadDays;
  return clamp(6 - Math.floor(beyond / 30), 0, 6);
}

/** Reach bonus: broader market coverage is worth a little more. */
function reachBonus(reachCount: number): number {
  if (reachCount <= 0) return 0;
  return Math.min(10, 3 + (reachCount - 1) * 3); // 3, 6, 9, 10…
}

export function opportunityScore(params: {
  importance: Importance;
  category: EventCategory;
  daysUntil: number;
  leadDays: number;
  reachCount: number;
  reliability: number;
}): number {
  const { importance, category, daysUntil, leadDays, reachCount, reliability } =
    params;
  const raw =
    IMPORTANCE_BASE[importance] +
    CATEGORY_WEIGHT[category] +
    urgencyBonus(daysUntil, leadDays) +
    reachBonus(reachCount);
  // Low-confidence signals shave a little off the top so shaky finds rank below
  // verified ones of equal size.
  const confidenceFactor = 0.85 + (reliability / 100) * 0.15; // 0.85..1.0
  return clamp(Math.round(raw * confidenceFactor));
}

function derivePriority(
  score: number,
  daysUntil: number,
  leadDays: number,
): OpportunityPriority {
  const inWindow = daysUntil >= 0 && daysUntil <= leadDays;
  if (inWindow && score >= 60) return "urgent";
  if (score >= 78) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function deriveDifficulty(leadDays: number): OpportunityDifficulty {
  if (leadDays <= 14) return "easy";
  if (leadDays <= 30) return "moderate";
  return "hard";
}

const DEFAULT_RELIABILITY: Record<Importance, number> = {
  high: 95,
  medium: 88,
  low: 80,
};

/**
 * Build the full scored opportunity set for a store.
 *
 * Considers current-year and next-year occurrences of every official event that
 * touches an enabled country, keeping the nearest not-yet-archived occurrence per
 * event (plus recently-passed ones as `archived`). Merchant-hidden events surface
 * as `cancelled` (dismissed) rather than disappearing, so nothing is silently lost.
 */
export function buildOpportunities(params: {
  globalEvents: GlobalEvent[];
  enabledCodes: string[];
  prefs: StoreEventPreference[];
  campaigns: Campaign[];
  planHorizonMonths: number;
  today?: Date;
  /** how many days back a passed occurrence still shows as "archived" */
  archiveWindowDays?: number;
}): ScoredOpportunity[] {
  const {
    globalEvents,
    enabledCodes,
    prefs,
    campaigns,
    planHorizonMonths,
    today = new Date(),
    archiveWindowDays = 60,
  } = params;

  const from = startOfDay(today);
  const horizonEnd = new Date(from);
  horizonEnd.setMonth(horizonEnd.getMonth() + planHorizonMonths);
  const hiddenIds = new Set(
    prefs.filter((p) => p.hidden).map((p) => p.globalEventId),
  );
  const linkedEventIds = new Set(
    campaigns.map((c) => c.globalEventId).filter(Boolean) as string[],
  );

  const years = [from.getFullYear(), from.getFullYear() + 1];
  const result: ScoredOpportunity[] = [];
  const seen = new Set<string>();

  for (const event of globalEvents) {
    if (!eventInCountries(event, enabledCodes)) continue;
    const reachCodes = event.countryCodes.filter((c) => enabledCodes.includes(c));
    const leadDays = event.recommendedLeadDays ?? 21;
    const signal = getOpportunitySignal(event.id);

    // Choose the most relevant single occurrence: the soonest one that is either
    // upcoming or within the recent archive window.
    let chosen: { year: number; occ: Occurrence; daysUntil: number } | null = null;
    for (const year of years) {
      const occ = eventOccurrence(event, year);
      const daysUntil = differenceInCalendarDays(occ.start, from);
      if (daysUntil < -archiveWindowDays) continue;
      if (!chosen || daysUntil < chosen.daysUntil) {
        // Prefer upcoming (>=0); only fall back to a recently-passed one.
        if (daysUntil >= 0 || !chosen) chosen = { year, occ, daysUntil };
      }
    }
    if (!chosen) continue;

    const id = `${event.id}:${chosen.year}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const reliability =
      signal?.reliability ?? DEFAULT_RELIABILITY[event.importance];
    const score = opportunityScore({
      importance: event.importance,
      category: event.category,
      daysUntil: chosen.daysUntil,
      leadDays,
      reachCount: reachCodes.length,
      reliability,
    });

    const state = deriveState({
      hidden: hiddenIds.has(event.id),
      daysUntil: chosen.daysUntil,
      signal,
    });

    result.push({
      id,
      event,
      year: chosen.year,
      occurrence: chosen.occ,
      category: event.category,
      importance: event.importance,
      countryCodes: event.countryCodes,
      reachCodes,
      daysUntil: chosen.daysUntil,
      score,
      priority: derivePriority(score, chosen.daysUntil, leadDays),
      difficulty: deriveDifficulty(leadDays),
      reliability,
      state,
      source: signal?.source ?? "Eventra Verified Calendar",
      hasCampaign: linkedEventIds.has(event.id),
      prepStatus: eventPrepStatus(event, chosen.year, campaigns, from),
      withinPlanHorizon: chosen.occ.start >= from && chosen.occ.start <= horizonEnd,
    });
  }

  return result.sort((a, b) => b.score - a.score);
}

function deriveState(params: {
  hidden: boolean;
  daysUntil: number;
  signal?: OpportunitySignal;
}): OpportunityState {
  const { hidden, daysUntil, signal } = params;
  if (hidden) return "cancelled";
  if (daysUntil < 0) return "archived";
  return signal?.discoveryState ?? "verified";
}

// ─────────────────────────── sorting + filtering ───────────────────────────

export type OpportunitySort =
  | "score"
  | "score_asc"
  | "soonest"
  | "priority"
  | "reliability";

const PRIORITY_RANK: Record<OpportunityPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortOpportunities(
  items: ScoredOpportunity[],
  sort: OpportunitySort,
): ScoredOpportunity[] {
  const copy = [...items];
  switch (sort) {
    case "score":
      return copy.sort((a, b) => b.score - a.score);
    case "score_asc":
      return copy.sort((a, b) => a.score - b.score);
    case "soonest":
      return copy.sort((a, b) => a.daysUntil - b.daysUntil);
    case "priority":
      return copy.sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          b.score - a.score,
      );
    case "reliability":
      return copy.sort((a, b) => b.reliability - a.reliability);
    default:
      return copy;
  }
}

/** Count opportunities by lifecycle state — powers dashboard + filter counts. */
export function countByState(
  items: ScoredOpportunity[],
): Record<OpportunityState, number> {
  const base: Record<OpportunityState, number> = {
    verified: 0,
    new: 0,
    modified: 0,
    cancelled: 0,
    archived: 0,
  };
  for (const o of items) base[o.state] += 1;
  return base;
}

/** Opportunities that need action soon: urgent priority, not yet acted on. */
export function urgentOpportunities(
  items: ScoredOpportunity[],
): ScoredOpportunity[] {
  return items.filter(
    (o) =>
      o.priority === "urgent" &&
      !o.hasCampaign &&
      o.state !== "cancelled" &&
      o.state !== "archived",
  );
}

/** One real, weighted signal that contributed to the composite score. */
export interface ScoreFactor {
  key: string;
  label: string;
  /** the real contribution/value */
  value: number;
  /** the maximum this factor can contribute — for the bar */
  max: number;
}

/**
 * Decompose a score into the REAL signals the model used (D11-honest): no
 * invented dimensions — these are the same importance/category/reach/reliability
 * inputs `opportunityScore` combines. Lets the UI explain a score instead of
 * showing a mysterious number.
 */
export function scoreFactors(o: ScoredOpportunity): ScoreFactor[] {
  const urgencyValue = { urgent: 15, high: 11, medium: 6, low: 3 }[o.priority];
  const easeValue = { easy: 10, moderate: 6, hard: 3 }[o.difficulty];
  return [
    { key: "relevance", label: "Relevance", value: IMPORTANCE_BASE[o.importance], max: 55 },
    { key: "potential", label: "Potential (category)", value: CATEGORY_WEIGHT[o.category], max: 20 },
    { key: "urgency", label: "Urgency", value: urgencyValue, max: 15 },
    { key: "reach", label: "Audience reach", value: reachBonus(o.reachCodes.length), max: 10 },
    { key: "ease", label: "Ease of execution", value: easeValue, max: 10 },
    { key: "reliability", label: "Reliability", value: o.reliability, max: 100 },
  ];
}
