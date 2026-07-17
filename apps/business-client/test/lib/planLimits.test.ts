import { describe, it, expect } from "vitest";
import {
  readOnlyCampaignIds,
  isCampaignReadOnly,
  campaignsOverLimit,
  overLimitCountryCodes,
  planningHorizonEnd,
  withinPlanningHorizon,
} from "~/lib/planLimits";
import { getPlan } from "~/lib/planEntitlements";
import type { Campaign } from "~/types/domain";

function campaign(id: string, updatedAt: string): Campaign {
  return {
    id,
    storeId: "store_demo",
    name: id,
    startDate: "2026-07-01",
    endDate: "2026-07-02",
    status: "draft",
    createdAt: updatedAt,
    updatedAt,
  };
}

describe("readOnlyCampaignIds (downgrade retention)", () => {
  const free = getPlan("free"); // savedCampaignLimit = 5

  it("marks nothing read-only when within the limit", () => {
    const list = [campaign("a", "2026-01-01T00:00:00Z")];
    expect(readOnlyCampaignIds(list, free).size).toBe(0);
  });

  it("keeps the newest N editable and marks older excess read-only", () => {
    // 7 campaigns, free limit 5 -> 2 oldest become read-only.
    const list = Array.from({ length: 7 }, (_, i) =>
      campaign(`c${i}`, `2026-01-0${i + 1}T00:00:00Z`),
    );
    const ro = readOnlyCampaignIds(list, free);
    expect(ro.size).toBe(2);
    expect(ro.has("c0")).toBe(true); // oldest
    expect(ro.has("c1")).toBe(true);
    expect(ro.has("c6")).toBe(false); // newest stays editable
    expect(campaignsOverLimit(list, free)).toBe(2);
  });

  it("never marks anything read-only on an unlimited (VIP) plan", () => {
    const vip = getPlan("vip");
    const list = Array.from({ length: 200 }, (_, i) =>
      campaign(`c${i}`, `2026-01-01T00:00:0${i % 10}Z`),
    );
    expect(readOnlyCampaignIds(list, vip).size).toBe(0);
    expect(isCampaignReadOnly(list[0], list, vip)).toBe(false);
  });
});

describe("overLimitCountryCodes", () => {
  it("identifies enabled markets beyond the plan cap", () => {
    expect(overLimitCountryCodes(["US", "CA", "GB"], getPlan("free"))).toEqual([
      "CA",
      "GB",
    ]); // free = 1
    expect(overLimitCountryCodes(["US", "CA"], getPlan("starter"))).toEqual([]); // starter = 2
    expect(overLimitCountryCodes(["US", "CA", "GB", "AU"], getPlan("vip"))).toEqual([]); // unlimited
  });
});

describe("planning horizon", () => {
  const from = new Date(2026, 0, 1); // Jan 1 2026

  it("computes the horizon end from the plan", () => {
    // Growth = 8 months -> Sep 1 2026
    expect(planningHorizonEnd(getPlan("growth"), from).getMonth()).toBe(8); // September (0-indexed)
  });

  it("accepts dates within and rejects dates beyond the horizon", () => {
    const growth = getPlan("growth");
    expect(withinPlanningHorizon("2026-06-01", growth, from)).toBe(true);
    expect(withinPlanningHorizon("2026-12-01", growth, from)).toBe(false); // beyond 8 months
  });
});
