import { describe, it, expect } from "vitest";
import {
  REPUTATION_CONFIG,
  REPUTATION_LEVELS,
  clampScore,
  resolveReputationLevel,
  reputationFactor,
} from "../src/index";

describe("@eventra/config — reputation single source of truth (ORDER §27)", () => {
  it("holds the approved numbers", () => {
    expect(REPUTATION_CONFIG).toMatchObject({
      minimumScore: 100,
      maximumScore: 1000,
      initialScore: 800,
      completedPromotionReward: 10,
      cancellationPenalty: {
        fourOrMoreDays: 0,
        threeDays: -10,
        twoDays: -20,
        oneDay: -30,
        sameDayOrAfter: -60,
      },
    });
  });

  it("defines five non-overlapping, gap-free level bands (§4)", () => {
    expect(REPUTATION_LEVELS.map((l) => l.label)).toEqual([
      "Deplorable",
      "Bien",
      "Bueno",
      "Mejor",
      "Máxima calidad",
    ]);
    // contiguous and non-overlapping from 100..1000
    for (let i = 1; i < REPUTATION_LEVELS.length; i++) {
      expect(REPUTATION_LEVELS[i].min).toBe(REPUTATION_LEVELS[i - 1].max + 1);
    }
    expect(REPUTATION_LEVELS[0].min).toBe(100);
    expect(REPUTATION_LEVELS.at(-1)!.max).toBe(1000);
    // "Máxima calidad" is exact-1000 only.
    expect(REPUTATION_LEVELS.at(-1)).toMatchObject({ min: 1000, max: 1000 });
  });

  it("clampScore bounds to [100, 1000]", () => {
    expect(clampScore(0)).toBe(100);
    expect(clampScore(99)).toBe(100);
    expect(clampScore(1001)).toBe(1000);
    expect(clampScore(800)).toBe(800);
  });

  it("resolveReputationLevel picks the right band, edges included", () => {
    expect(resolveReputationLevel(499).id).toBe("deplorable");
    expect(resolveReputationLevel(500).id).toBe("bien");
    expect(resolveReputationLevel(849).id).toBe("bueno");
    expect(resolveReputationLevel(850).id).toBe("mejor");
    expect(resolveReputationLevel(1000).id).toBe("maxima_calidad");
  });

  it("reputationFactor is score / maximum (Mobile ranking input, §14)", () => {
    expect(reputationFactor(800)).toBeCloseTo(0.8, 5);
    expect(reputationFactor(1000)).toBe(1);
  });
});
