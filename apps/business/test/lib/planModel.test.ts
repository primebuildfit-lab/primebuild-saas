import { describe, it, expect } from "vitest";
import {
  toLockedPlanId,
  toFacadePlanId,
  normalizeToLocked,
  isBusinessPlanId,
  toLockedRole,
  toFacadeRole,
  lockedCountryLimit,
  lockedWorkspaceLimit,
  lockedPlanningHorizonYears,
  resolveBusinessEntitlements,
} from "~/lib/planModel";
import type { PlanId } from "~/types/domain";

describe("plan id bridge (facade <-> locked)", () => {
  const pairs: [PlanId, string][] = [
    ["free", "business.free"],
    ["starter", "business.starter"],
    ["growth", "business.growth"],
    ["vip", "business.pro"], // legacy alias
  ];

  it("maps every facade id to its locked id and back", () => {
    for (const [facade, locked] of pairs) {
      expect(toLockedPlanId(facade)).toBe(locked);
      expect(toFacadePlanId(locked as never)).toBe(facade);
    }
  });

  it("normalizeToLocked accepts either vocabulary", () => {
    expect(normalizeToLocked("growth")).toBe("business.growth");
    expect(normalizeToLocked("business.growth")).toBe("business.growth");
    expect(() => normalizeToLocked("bogus")).toThrow();
  });

  it("isBusinessPlanId recognizes only locked ids", () => {
    expect(isBusinessPlanId("business.pro")).toBe(true);
    expect(isBusinessPlanId("vip")).toBe(false);
  });
});

describe("role bridge", () => {
  it("maps staff <-> editor and keeps owner/admin", () => {
    expect(toLockedRole("staff")).toBe("editor");
    expect(toLockedRole("owner")).toBe("owner");
    expect(toFacadeRole("editor")).toBe("staff");
    expect(toFacadeRole("viewer")).toBe("staff");
  });
});

describe("locked enforcement limits (authoritative, not the mock display)", () => {
  it("Free enforces 0 managed countries + 1 workspace + 0-year horizon", () => {
    expect(lockedCountryLimit("free")).toBe(0);
    expect(lockedWorkspaceLimit("free")).toBe(1);
    expect(lockedPlanningHorizonYears("free")).toBe(0);
  });

  it("Pro (vip alias) is unlimited workspaces + countries, 10-year horizon", () => {
    expect(lockedWorkspaceLimit("vip")).toBeNull();
    expect(lockedCountryLimit("vip")).toBeNull();
    expect(lockedPlanningHorizonYears("vip")).toBe(10);
  });

  it("resolves a business entitlement set for a facade plan", () => {
    const set = resolveBusinessEntitlements("growth");
    expect(set.surface).toBe("business");
    expect(set.effectivePlan).toBe("business.growth");
    expect(set.limits.countryLimit).toBeNull();
  });
});
