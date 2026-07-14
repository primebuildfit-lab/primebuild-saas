import { describe, it, expect } from "vitest";
import type { Campaign, GlobalEvent, StoreEventPreference } from "~/types/domain";
import {
  buildOpportunities,
  countByState,
  opportunityScore,
  sortOpportunities,
  urgentOpportunities,
} from "~/lib/opportunities";

const TODAY = new Date("2026-07-13T12:00:00Z");

function evt(partial: Partial<GlobalEvent> & Pick<GlobalEvent, "id">): GlobalEvent {
  return {
    name: partial.name ?? partial.id,
    countryCodes: partial.countryCodes ?? ["US"],
    startRule: partial.startRule ?? { kind: "fixed", month: 12, day: 25 },
    category: partial.category ?? "seasonal",
    importance: partial.importance ?? "medium",
    recommendedLeadDays: partial.recommendedLeadDays ?? 21,
    recurring: true,
    ...partial,
  } as GlobalEvent;
}

describe("opportunityScore", () => {
  it("is bounded to 0–100", () => {
    const s = opportunityScore({
      importance: "high",
      category: "major_sales",
      daysUntil: 5,
      leadDays: 45,
      reachCount: 3,
      reliability: 100,
    });
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(100);
  });

  it("ranks a high-importance major sale above a low cultural date", () => {
    const strong = opportunityScore({
      importance: "high",
      category: "major_sales",
      daysUntil: 20,
      leadDays: 45,
      reachCount: 2,
      reliability: 99,
    });
    const weak = opportunityScore({
      importance: "low",
      category: "cultural",
      daysUntil: 200,
      leadDays: 14,
      reachCount: 1,
      reliability: 80,
    });
    expect(strong).toBeGreaterThan(weak);
  });

  it("lower reliability shaves the score of an otherwise identical opportunity", () => {
    const base = {
      importance: "high" as const,
      category: "major_sales" as const,
      daysUntil: 20,
      leadDays: 45,
      reachCount: 2,
    };
    expect(opportunityScore({ ...base, reliability: 99 })).toBeGreaterThan(
      opportunityScore({ ...base, reliability: 60 }),
    );
  });
});

describe("buildOpportunities", () => {
  const events = [
    evt({ id: "e_soon", startRule: { kind: "fixed", month: 8, day: 1 }, importance: "high", category: "major_sales", recommendedLeadDays: 45 }),
    evt({ id: "e_far", startRule: { kind: "fixed", month: 12, day: 25 }, importance: "medium" }),
  ];

  it("only surfaces events in enabled countries", () => {
    const out = buildOpportunities({
      globalEvents: [evt({ id: "e_ca", countryCodes: ["CA"] })],
      enabledCodes: ["US"],
      prefs: [],
      campaigns: [],
      planHorizonMonths: 12,
      today: TODAY,
    });
    expect(out).toHaveLength(0);
  });

  it("marks merchant-hidden events as cancelled rather than dropping them", () => {
    const prefs: StoreEventPreference[] = [
      { storeId: "s", globalEventId: "e_far", hidden: true },
    ];
    const out = buildOpportunities({
      globalEvents: events,
      enabledCodes: ["US"],
      prefs,
      campaigns: [],
      planHorizonMonths: 12,
      today: TODAY,
    });
    const far = out.find((o) => o.event.id === "e_far");
    expect(far?.state).toBe("cancelled");
  });

  it("flags an opportunity with a linked campaign", () => {
    const campaigns: Campaign[] = [
      {
        id: "c1",
        storeId: "s",
        name: "BTS",
        globalEventId: "e_soon",
        country: "US",
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        status: "active",
        createdAt: "2026-07-01T00:00:00Z",
        updatedAt: "2026-07-01T00:00:00Z",
      },
    ];
    const out = buildOpportunities({
      globalEvents: events,
      enabledCodes: ["US"],
      prefs: [],
      campaigns,
      planHorizonMonths: 12,
      today: TODAY,
    });
    expect(out.find((o) => o.event.id === "e_soon")?.hasCampaign).toBe(true);
  });

  it("is sorted by score descending by default", () => {
    const out = buildOpportunities({
      globalEvents: events,
      enabledCodes: ["US"],
      prefs: [],
      campaigns: [],
      planHorizonMonths: 12,
      today: TODAY,
    });
    for (let i = 1; i < out.length; i++) {
      expect(out[i - 1].score).toBeGreaterThanOrEqual(out[i].score);
    }
  });
});

describe("sortOpportunities / countByState / urgentOpportunities", () => {
  const events = [
    evt({ id: "e_soon", startRule: { kind: "fixed", month: 8, day: 1 }, importance: "high", category: "major_sales", recommendedLeadDays: 45 }),
    evt({ id: "e_far", startRule: { kind: "fixed", month: 12, day: 25 }, importance: "low", category: "cultural" }),
  ];
  const opps = buildOpportunities({
    globalEvents: events,
    enabledCodes: ["US"],
    prefs: [],
    campaigns: [],
    planHorizonMonths: 12,
    today: TODAY,
  });

  it("sorts soonest first", () => {
    const sorted = sortOpportunities(opps, "soonest");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].daysUntil).toBeLessThanOrEqual(sorted[i].daysUntil);
    }
  });

  it("counts every lifecycle state", () => {
    const counts = countByState(opps);
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(opps.length);
  });

  it("urgent list excludes anything already linked to a campaign", () => {
    const urgent = urgentOpportunities(opps);
    expect(urgent.every((o) => !o.hasCampaign)).toBe(true);
  });
});
