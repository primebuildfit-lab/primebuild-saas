import { describe, it, expect } from "vitest";
import { compositeScore, scoreOffer, priorityFor, byScoreDesc } from "../src/engine/scoring";
import {
  clampRate,
  isRateAuthorized,
  computeCommission,
  modelCommission,
  COMMISSION_MIN_RATE,
  COMMISSION_MAX_RATE,
} from "../src/engine/commissions";
import { expandOccurrences, confirmedCount, DEFAULT_HORIZON_YEARS } from "../src/engine/occurrences";
import { detectOfferChange, isAlertable } from "../src/engine/changeDetection";
import { DeterministicFakeAI } from "../src/engine/ai/fake";
import { mayAutoApply, HUMAN_REVIEW_THRESHOLD } from "../src/engine/ai/port";
import type { Offer, OfferScoreFactors } from "../src/engine/types";

const strong: OfferScoreFactors = { reliability: 1, relevance: 1, reach: 1, commercialPotential: 1, difficulty: 0, competition: 0, risk: 0 };
const weak: OfferScoreFactors = { reliability: 0.1, relevance: 0.1, reach: 0.1, commercialPotential: 0.1, difficulty: 1, competition: 1, risk: 1 };

describe("offer scoring", () => {
  it("is deterministic and bounded 0..100", () => {
    expect(compositeScore(strong)).toBe(84); // 22+22+18+22 = 84, no penalties
    expect(compositeScore(weak)).toBe(0); // penalties exceed positives → clamped
    expect(compositeScore(strong)).toBe(compositeScore(strong));
  });
  it("maps to priority bands", () => {
    expect(priorityFor(85)).toBe("critical");
    expect(priorityFor(65)).toBe("high");
    expect(priorityFor(40)).toBe("medium");
    expect(priorityFor(10)).toBe("low");
  });
  it("sorts best-first", () => {
    const a = { score: scoreOffer(strong) };
    const b = { score: scoreOffer(weak) };
    expect([b, a].sort(byScoreDesc)[0]).toBe(a);
  });
  it("clamps out-of-range factor inputs", () => {
    expect(compositeScore({ ...strong, reliability: 5 })).toBe(84);
  });
});

describe("commissions clamp to the authorized 1%–2% band", () => {
  it("never allows a rate outside 1%..2%", () => {
    expect(clampRate(0)).toBe(COMMISSION_MIN_RATE);
    expect(clampRate(0.5)).toBe(COMMISSION_MAX_RATE);
    expect(clampRate(0.015)).toBe(0.015);
    expect(isRateAuthorized(0.03)).toBe(false);
    expect(isRateAuthorized(0.015)).toBe(true);
  });
  it("computes and clamps the amount", () => {
    expect(computeCommission(100000, 0.02)).toBe(2000);
    expect(computeCommission(100000, 0.5)).toBe(2000); // clamped to 2%
    expect(computeCommission(0, 0.02)).toBe(0);
    expect(computeCommission(-5, 0.02)).toBe(0);
  });
  it("models a record as 'modeled', never 'applied'", () => {
    const rec = modelCommission({ id: "c", ruleId: "r", organizationId: "o", operation: "automated_offer", baseAmount: 100000, rate: 0.09, currency: "USD" });
    expect(rec.status).toBe("modeled");
    expect(rec.rate).toBe(COMMISSION_MAX_RATE); // 0.09 clamped
    expect(rec.amount).toBe(2000);
  });
});

const recurring: Offer = {
  id: "o1", title: "BF", startDate: "2026-11-27", recurring: true, sourceId: "s", status: "verified",
  certainty: "confirmed", reliability: 0.9, createdAt: "", updatedAt: "",
};

describe("four-year horizon expansion", () => {
  it("keeps the anchor year confirmed and projects the rest", () => {
    const occ = expandOccurrences(recurring, { fromYear: 2026, horizonYears: DEFAULT_HORIZON_YEARS });
    expect(occ).toHaveLength(5); // 2026..2030 inclusive
    expect(occ[0]).toMatchObject({ year: 2026, certainty: "confirmed", date: "2026-11-27" });
    expect(occ[1]).toMatchObject({ year: 2027, certainty: "historical_projection", date: "2027-11-27" });
    expect(confirmedCount(occ)).toBe(1); // only the anchor is safe to advertise
  });
  it("non-recurring yields a single in-range occurrence", () => {
    const once: Offer = { ...recurring, recurring: false };
    expect(expandOccurrences(once, { fromYear: 2026, horizonYears: 4 })).toHaveLength(1);
    expect(expandOccurrences(once, { fromYear: 2030, horizonYears: 4 })).toHaveLength(0);
  });
});

describe("change & cancellation detection", () => {
  const prev: Offer = { ...recurring, contentHash: "h1" };
  it("flags a cancellation as critical + alertable", () => {
    const c = detectOfferChange(prev, { ...prev, status: "cancelled" });
    expect(c.cancelled).toBe(true);
    expect(c.impact).toBe("critical");
    expect(isAlertable(c)).toBe(true);
  });
  it("flags a date change as major", () => {
    const c = detectOfferChange(prev, { ...prev, startDate: "2026-11-28" });
    expect(c.fields).toContain("startDate");
    expect(c.impact).toBe("major");
  });
  it("reports no change when identical", () => {
    expect(detectOfferChange(prev, { ...prev }).changed).toBe(false);
  });
});

describe("AI fake provider", () => {
  const ai = new DeterministicFakeAI();
  it("is deterministic (same input → same output/confidence)", async () => {
    const a = await ai.run({ task: "classify", input: { title: "Black Friday" } });
    const b = await ai.run({ task: "classify", input: { title: "Black Friday" } });
    expect(a).toEqual(b);
    expect(a.costUsd).toBe(0);
  });
  it("marks low-confidence results for human review and blocks auto-apply", async () => {
    // scan several inputs; at least one must require review, and never auto-apply below threshold
    let sawReview = false;
    for (let i = 0; i < 30; i++) {
      const r = await ai.run({ task: "score_suggest", input: { i } });
      if (r.requiresHumanReview) {
        sawReview = true;
        expect(r.confidence).toBeLessThan(HUMAN_REVIEW_THRESHOLD);
        expect(mayAutoApply(r)).toBe(false);
      }
    }
    expect(sawReview).toBe(true);
  });
});
