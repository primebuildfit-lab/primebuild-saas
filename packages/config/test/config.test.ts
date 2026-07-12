import { describe, it, expect } from "vitest";
import {
  CONSUMER_PRODUCTS,
  CONSUMER_ADDONS,
  BUSINESS_PLANS,
  TRIALS,
  adFreePrice,
  getBusinessPlan,
} from "../src/index";

describe("@eventra/config — approved commercial rules (single source)", () => {
  it("consumer prices: Core $0, Deal Intelligence $30, Ad-Free add-on $15", () => {
    expect(CONSUMER_PRODUCTS["consumer.core"].priceMonthly).toBe(0);
    expect(CONSUMER_PRODUCTS["consumer.deal_intelligence"].priceMonthly).toBe(30);
    expect(adFreePrice()).toBe(15);
  });

  it("Ad-Free is INDEPENDENT: not a consumer product, and Deal Intelligence does not imply it", () => {
    // Ad-Free exists only as an add-on, never as a product tier.
    expect(Object.keys(CONSUMER_PRODUCTS)).not.toContain("addon.ad_free");
    expect(CONSUMER_ADDONS["addon.ad_free"]).toBeDefined();
    // Nothing in the Deal Intelligence product references ad removal.
    expect(JSON.stringify(CONSUMER_PRODUCTS["consumer.deal_intelligence"]))
      .not.toMatch(/ad[_-]?free|ads?/i);
  });

  it("business plans: Free/Starter/Growth/Pro with correct prices, workspaces, horizons", () => {
    expect(getBusinessPlan("business.free")).toMatchObject({ priceMonthly: 0, workspaceLimit: 1, planningHorizonYears: 0 });
    expect(getBusinessPlan("business.starter")).toMatchObject({ priceMonthly: 15, workspaceLimit: 2, planningHorizonYears: 1 });
    expect(getBusinessPlan("business.growth")).toMatchObject({ priceMonthly: 30, workspaceLimit: 3, countryLimit: null, planningHorizonYears: 4 });
    expect(getBusinessPlan("business.pro")).toMatchObject({ priceMonthly: 45, workspaceLimit: null, planningHorizonYears: 10 });
  });

  it("trial durations: consumer 30 days, business 45 days", () => {
    expect(TRIALS["consumer.deal_intelligence"].days).toBe(30);
    expect(TRIALS["business.pro"].days).toBe(45);
  });

  it("no deprecated plan names remain active (VIP / Pro-as-consumer / $10 / $20 / $50)", () => {
    const blob = JSON.stringify({ CONSUMER_PRODUCTS, CONSUMER_ADDONS, BUSINESS_PLANS });
    expect(blob).not.toMatch(/\bVIP\b/i);
    expect(Object.values(BUSINESS_PLANS).map((p) => p.priceMonthly)).not.toContain(10);
    expect(Object.values(BUSINESS_PLANS).map((p) => p.priceMonthly)).not.toContain(20);
    expect(Object.values(BUSINESS_PLANS).map((p) => p.priceMonthly)).not.toContain(50);
  });
});
