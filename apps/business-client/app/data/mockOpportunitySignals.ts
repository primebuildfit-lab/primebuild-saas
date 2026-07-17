/**
 * Discovery-signal overlay for the opportunity engine (Business UI reorg).
 *
 * Eventra's product thesis is that the real value is *opportunity discovery*, not
 * the calendar. Each official global event carries a discovery signal describing
 * where it came from, how reliable the source is, and whether the source has
 * revised, retracted, or freshly surfaced it. This lives in a dedicated app/data
 * mock file (SOP §7) keyed by existing `globalEvents` ids — it does NOT invent new
 * events. Events with no signal default to a high-reliability "verified" state,
 * because they come from Eventra's own verified calendar.
 *
 * `discoveryState` intentionally omits "cancelled" and "archived": those are
 * derived from real store data (a merchant-hidden event is "dismissed"; a passed
 * occurrence is "archived") in lib/opportunities.ts — not baked in here.
 */
export type DiscoverySignalState = "verified" | "new" | "modified";

export interface OpportunitySignal {
  globalEventId: string;
  /** the feed/source that surfaced or confirmed this opportunity */
  source: string;
  /** 0–100 confidence in the source + date */
  reliability: number;
  discoveryState: DiscoverySignalState;
  /** when the opportunity was first surfaced to the store (ISO) */
  firstSeenISO: string;
  /** how many times the source has revised it since first seen */
  revisions: number;
}

export const opportunitySignals: OpportunitySignal[] = [
  {
    globalEventId: "ge_us_blackfriday",
    source: "Eventra Verified Calendar",
    reliability: 99,
    discoveryState: "verified",
    firstSeenISO: "2026-01-05",
    revisions: 0,
  },
  {
    globalEventId: "ge_us_cybermonday",
    source: "Eventra Verified Calendar",
    reliability: 98,
    discoveryState: "verified",
    firstSeenISO: "2026-01-05",
    revisions: 0,
  },
  {
    globalEventId: "ge_us_christmas",
    source: "Eventra Verified Calendar",
    reliability: 99,
    discoveryState: "verified",
    firstSeenISO: "2026-01-05",
    revisions: 0,
  },
  {
    globalEventId: "ge_us_backtoschool",
    source: "Seasonal Retail Index",
    reliability: 90,
    discoveryState: "new",
    firstSeenISO: "2026-07-01",
    revisions: 0,
  },
  {
    globalEventId: "ge_ca_boxingday",
    source: "Seasonal Retail Index",
    reliability: 88,
    discoveryState: "new",
    firstSeenISO: "2026-07-08",
    revisions: 0,
  },
  {
    globalEventId: "ge_us_halloween",
    source: "Cultural Trends Feed",
    reliability: 92,
    discoveryState: "modified",
    firstSeenISO: "2026-02-10",
    revisions: 2,
  },
  {
    globalEventId: "ge_ca_thanksgiving",
    source: "Cultural Trends Feed",
    reliability: 85,
    discoveryState: "modified",
    firstSeenISO: "2026-03-01",
    revisions: 1,
  },
  {
    globalEventId: "ge_us_valentines",
    source: "Eventra Verified Calendar",
    reliability: 94,
    discoveryState: "verified",
    firstSeenISO: "2026-01-05",
    revisions: 0,
  },
  {
    globalEventId: "ge_us_independence",
    source: "Eventra Verified Calendar",
    reliability: 96,
    discoveryState: "verified",
    firstSeenISO: "2026-01-05",
    revisions: 0,
  },
];

const byId = new Map(opportunitySignals.map((s) => [s.globalEventId, s]));

/** Signal for an event id, or undefined (caller supplies the verified default). */
export function getOpportunitySignal(
  globalEventId: string,
): OpportunitySignal | undefined {
  return byId.get(globalEventId);
}
