import { describe, it, expect } from "vitest";
import {
  getPlan,
  countryLimitReached,
  canAddCountry,
  savedCampaignLimitReached,
  canSaveCampaign,
} from "~/lib/planEntitlements";
import { plans } from "~/data";

describe("plan config integrity (single source of truth)", () => {
  it("has exactly the four approved plans with correct names/prices/limits", () => {
    expect(plans.map((p) => p.id)).toEqual(["free", "starter", "growth", "vip"]);
    expect(plans.map((p) => p.name)).toEqual(["Free", "Starter", "Growth", "VIP"]);
    expect(plans.map((p) => p.priceMonthly)).toEqual([0, 10, 20, 50]);
    expect(plans.map((p) => p.countryLimit)).toEqual([1, 2, 3, null]);
  });

  it("never uses deprecated 'Pro'/'Advanced' names", () => {
    expect(plans.some((p) => /pro|advanced/i.test(p.name))).toBe(false);
  });
});

describe("country limits", () => {
  it("enforces per-plan country caps", () => {
    expect(canAddCountry(getPlan("free"), 0)).toBe(true);
    expect(canAddCountry(getPlan("free"), 1)).toBe(false); // free = 1
    expect(canAddCountry(getPlan("starter"), 1)).toBe(true);
    expect(canAddCountry(getPlan("starter"), 2)).toBe(false); // starter = 2
    expect(canAddCountry(getPlan("growth"), 2)).toBe(true);
    expect(canAddCountry(getPlan("growth"), 3)).toBe(false); // growth = 3
  });

  it("treats VIP (null limit) as unlimited", () => {
    expect(countryLimitReached(getPlan("vip"), 999)).toBe(false);
    expect(canAddCountry(getPlan("vip"), 999)).toBe(true);
  });
});

describe("saved-campaign limits", () => {
  it("enforces per-plan saved-campaign caps", () => {
    expect(canSaveCampaign(getPlan("free"), 4)).toBe(true);
    expect(canSaveCampaign(getPlan("free"), 5)).toBe(false); // free = 5
    expect(savedCampaignLimitReached(getPlan("starter"), 20)).toBe(true);
    expect(savedCampaignLimitReached(getPlan("growth"), 99)).toBe(false);
  });

  it("treats VIP (null limit) as unlimited saved campaigns", () => {
    expect(canSaveCampaign(getPlan("vip"), 100_000)).toBe(true);
  });
});

describe("getPlan", () => {
  it("throws on an unknown plan id", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getPlan("enterprise")).toThrow();
  });
});
