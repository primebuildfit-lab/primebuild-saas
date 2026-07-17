import { describe, it, expect } from "vitest";
import type { Campaign, Country } from "~/types/domain";
import { buildOpportunities } from "~/lib/opportunities";
import {
  buildSeries,
  measureApplies,
} from "~/lib/analyticsBuilder";
import { globalEvents } from "~/data";

const TODAY = new Date("2026-07-13T12:00:00Z");
const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const campaigns: Campaign[] = [
  {
    id: "c1",
    storeId: "s",
    name: "A",
    country: "US",
    startDate: "2026-08-01",
    endDate: "2026-08-02",
    status: "active",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "c2",
    storeId: "s",
    name: "B",
    country: "CA",
    startDate: "2026-09-01",
    endDate: "2026-09-02",
    status: "draft",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
];

const opportunities = buildOpportunities({
  globalEvents,
  enabledCodes: ["US", "CA"],
  prefs: [],
  campaigns,
  planHorizonMonths: 12,
  today: TODAY,
});

describe("measureApplies", () => {
  it("avg_score requires an opportunity dimension", () => {
    expect(measureApplies("campaign_status", "avg_score")).toBe(false);
    expect(measureApplies("opportunity_category", "avg_score")).toBe(true);
    expect(measureApplies("campaign_status", "count")).toBe(true);
  });
});

describe("buildSeries", () => {
  it("groups campaigns by status with a bucket per status", () => {
    const series = buildSeries({
      dimension: "campaign_status",
      measure: "count",
      campaigns,
      opportunities,
      countries,
    });
    const total = series.reduce((s, p) => s + p.value, 0);
    expect(total).toBe(campaigns.length);
  });

  it("groups opportunities by category and sums to the opportunity count", () => {
    const series = buildSeries({
      dimension: "opportunity_category",
      measure: "count",
      campaigns,
      opportunities,
      countries,
    });
    const total = series.reduce((s, p) => s + p.value, 0);
    expect(total).toBe(opportunities.length);
  });

  it("avg_score yields values within 0–100", () => {
    const series = buildSeries({
      dimension: "opportunity_priority",
      measure: "avg_score",
      campaigns,
      opportunities,
      countries,
    });
    for (const p of series) {
      expect(p.value).toBeGreaterThanOrEqual(0);
      expect(p.value).toBeLessThanOrEqual(100);
    }
  });

  it("falls back to count when avg_score is asked of a campaign dimension", () => {
    const series = buildSeries({
      dimension: "campaign_status",
      measure: "avg_score",
      campaigns,
      opportunities,
      countries,
    });
    const total = series.reduce((s, p) => s + p.value, 0);
    expect(total).toBe(campaigns.length);
  });
});
