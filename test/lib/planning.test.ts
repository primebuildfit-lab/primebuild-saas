import { describe, it, expect } from "vitest";
import {
  visibleGlobalEvents,
  upcomingOpportunities,
  preparationNeeded,
  entriesOnDay,
  entriesForYear,
} from "~/lib/planning";
import { globalEvents, campaigns } from "~/data";
import type { StoreEventPreference } from "~/types/domain";

describe("visibleGlobalEvents", () => {
  it("includes only events in an enabled country", () => {
    const usOnly = visibleGlobalEvents(globalEvents, ["US"], []);
    const ids = usOnly.map((e) => e.id);
    expect(ids).toContain("ge_us_independence");
    expect(ids).not.toContain("ge_ca_canadaday"); // CA-only
    expect(ids).not.toContain("ge_ca_boxingday");
  });

  it("excludes per-store hidden events without deleting them globally (D13)", () => {
    const prefs: StoreEventPreference[] = [
      { storeId: "store_demo", globalEventId: "ge_us_blackfriday", hidden: true },
    ];
    const visible = visibleGlobalEvents(globalEvents, ["US", "CA"], prefs);
    expect(visible.some((e) => e.id === "ge_us_blackfriday")).toBe(false);
    // The catalog itself is untouched — the event still exists globally.
    expect(globalEvents.some((e) => e.id === "ge_us_blackfriday")).toBe(true);
  });
});

describe("upcomingOpportunities", () => {
  const today = new Date(2026, 0, 1); // Jan 1 2026

  it("returns future events within the horizon, soonest first", () => {
    const opps = upcomingOpportunities({
      globalEvents,
      enabledCodes: ["US"],
      prefs: [],
      campaigns: [],
      today,
      horizonMonths: 3,
    });
    const names = opps.map((o) => o.event.name);
    expect(names[0]).toBe("New Year's Day"); // Jan 1
    expect(names).toContain("Valentine's Day"); // Feb 14
    expect(names).not.toContain("Independence Day"); // Jul — beyond 3-month horizon
    // strictly ascending by start date
    const times = opps.map((o) => o.occurrence.start.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("respects a result limit", () => {
    const opps = upcomingOpportunities({
      globalEvents,
      enabledCodes: ["US", "CA"],
      prefs: [],
      campaigns: [],
      today,
      horizonMonths: 12,
      limit: 2,
    });
    expect(opps).toHaveLength(2);
  });
});

describe("preparationNeeded", () => {
  it("surfaces events whose prep window is open and that aren't ready", () => {
    const today = new Date(2026, 10, 15); // Nov 15 2026
    const needed = preparationNeeded({
      globalEvents,
      enabledCodes: ["US"],
      prefs: [],
      campaigns: [], // nothing prepared
      today,
    });
    // Black Friday (Nov 27, prep window opened Oct 13) needs attention.
    expect(needed.some((o) => o.event.id === "ge_us_blackfriday")).toBe(true);
  });
});

describe("calendar entries", () => {
  it("collects events + campaigns for a year and filters by day", () => {
    const entries = entriesForYear({
      globalEvents,
      customEvents: [],
      campaigns,
      enabledCodes: ["US", "CA"],
      prefs: [],
      year: 2026,
    });
    // Independence Day is present as an official event entry.
    expect(entries.some((e) => e.kind === "event" && e.title === "Independence Day")).toBe(true);

    const onJul4 = entriesOnDay(entries, new Date(2026, 6, 4));
    expect(onJul4.some((e) => e.title === "Independence Day")).toBe(true);
  });
});
