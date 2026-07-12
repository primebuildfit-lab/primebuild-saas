import { describe, it, expect } from "vitest";
import {
  resolveEntitlements,
  shouldShowAds,
  canUseDealIntelligence,
  canUseStorefrontWidgets,
  getWorkspaceLimit,
  getPlanningHorizon,
  getCountryLimit,
  getReadOnlyReason,
  type ConsumerAccessInput,
} from "../src/index";
import type { TrialState } from "@eventra/types";

const consumer = (o: Partial<ConsumerAccessInput>): ConsumerAccessInput => ({
  surface: "consumer",
  dealIntelligence: false,
  adFree: false,
  ...o,
});

describe("consumer — two independent axes (all four states)", () => {
  it("State A ($0): Core, ads shown", () => {
    const s = resolveEntitlements(consumer({}));
    expect(canUseDealIntelligence(s)).toBe(false);
    expect(shouldShowAds(s)).toBe(true);
    expect(getCountryLimit(s)).toBe(1);
    expect(s.limits.followLimit).toBe(0);
  });
  it("State B ($15): Core + Ad-Free, ads hidden, still no intelligence", () => {
    const s = resolveEntitlements(consumer({ adFree: true }));
    expect(canUseDealIntelligence(s)).toBe(false);
    expect(shouldShowAds(s)).toBe(false);
  });
  it("State C ($30): Deal Intelligence WITHOUT Ad-Free → ads STILL shown", () => {
    const s = resolveEntitlements(consumer({ dealIntelligence: true }));
    expect(canUseDealIntelligence(s)).toBe(true);
    expect(shouldShowAds(s)).toBe(true); // the non-negotiable rule
    expect(getCountryLimit(s)).toBe(3);
    expect(s.limits.followLimit).toBeGreaterThan(0);
  });
  it("State D ($45): Deal Intelligence + Ad-Free → ads hidden", () => {
    const s = resolveEntitlements(consumer({ dealIntelligence: true, adFree: true }));
    expect(canUseDealIntelligence(s)).toBe(true);
    expect(shouldShowAds(s)).toBe(false);
  });
});

describe("consumer trial", () => {
  const trial = (state: TrialState["state"]): TrialState => ({
    kind: "consumer.deal_intelligence",
    state,
  });
  it("active trial grants Deal Intelligence but NOT Ad-Free (ads remain)", () => {
    const s = resolveEntitlements(consumer({ trial: trial("active") }));
    expect(canUseDealIntelligence(s)).toBe(true);
    expect(shouldShowAds(s)).toBe(true); // trial never grants ad-free
  });
  it("expired trial reverts to Core", () => {
    const s = resolveEntitlements(consumer({ trial: trial("expired") }));
    expect(canUseDealIntelligence(s)).toBe(false);
  });
});

describe("business plans", () => {
  const biz = (plan: any, trial?: TrialState) =>
    resolveEntitlements({ surface: "business", plan, trial });

  it("Free: 1 workspace, manual (0 countries, 0 horizon), no widgets, no ads in surface", () => {
    const s = biz("business.free");
    expect(getWorkspaceLimit(s)).toBe(1);
    expect(getCountryLimit(s)).toBe(0);
    expect(getPlanningHorizon(s)).toBe(0);
    expect(canUseStorefrontWidgets(s)).toBe(false);
    expect(shouldShowAds(s)).toBe(false);
  });
  it("Starter: 2 workspaces, 1 country, 1-year horizon, no templates", () => {
    const s = biz("business.starter");
    expect(getWorkspaceLimit(s)).toBe(2);
    expect(getCountryLimit(s)).toBe(1);
    expect(getPlanningHorizon(s)).toBe(1);
    expect(s.features.has("business.templates")).toBe(false);
  });
  it("Growth: 3 workspaces, unlimited countries, 4-year horizon, templates+intel", () => {
    const s = biz("business.growth");
    expect(getWorkspaceLimit(s)).toBe(3);
    expect(getCountryLimit(s)).toBeNull();
    expect(getPlanningHorizon(s)).toBe(4);
    expect(s.features.has("business.templates")).toBe(true);
    expect(canUseStorefrontWidgets(s)).toBe(false); // Pro-only
  });
  it("Business Pro: unlimited workspaces, 10-year horizon, widgets + consumer promo", () => {
    const s = biz("business.pro");
    expect(getWorkspaceLimit(s)).toBeNull();
    expect(getPlanningHorizon(s)).toBe(10);
    expect(canUseStorefrontWidgets(s)).toBe(true);
    expect(s.features.has("business.consumer_promo")).toBe(true);
  });
  it("active Pro trial grants Pro entitlements regardless of underlying plan", () => {
    const s = biz("business.free", { kind: "business.pro", state: "active" });
    expect(s.effectivePlan).toBe("business.pro");
    expect(canUseStorefrontWidgets(s)).toBe(true);
  });
});

describe("downgrade read-only reasons", () => {
  it("flags workspaces beyond the plan limit; retains data", () => {
    const s = resolveEntitlements({ surface: "business", plan: "business.starter" }); // limit 2
    expect(getReadOnlyReason(s, "workspace", 0)).toBeNull();
    expect(getReadOnlyReason(s, "workspace", 1)).toBeNull();
    expect(getReadOnlyReason(s, "workspace", 2)).toMatch(/read-only|retained/i);
  });
  it("never marks read-only when unlimited (Pro)", () => {
    const s = resolveEntitlements({ surface: "business", plan: "business.pro" });
    expect(getReadOnlyReason(s, "workspace", 999)).toBeNull();
  });
});

describe("admin grants", () => {
  it("temporary grant adds an entitlement", () => {
    const s = resolveEntitlements(consumer({ grants: ["consumer.deal_intelligence"] }));
    expect(canUseDealIntelligence(s)).toBe(true);
  });
});
