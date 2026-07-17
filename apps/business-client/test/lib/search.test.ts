import { describe, it, expect } from "vitest";
import { searchAll, countResults, type SearchGroup } from "~/lib/search";
import {
  globalEvents,
  campaigns,
  templates,
  countries,
  customEvents,
} from "~/data";
import type { StoreEventPreference } from "~/types/domain";

function index(prefs: StoreEventPreference[] = []) {
  return {
    globalEvents,
    campaigns,
    templates,
    countries,
    customEvents,
    enabledCodes: ["US", "CA"],
    prefs,
  };
}

const titles = (groups: SearchGroup[], kind: string) =>
  groups.find((g) => g.kind === kind)?.results.map((r) => r.title) ?? [];

describe("searchAll", () => {
  it("returns nothing for an empty query", () => {
    expect(searchAll("", index())).toEqual([]);
    expect(searchAll("   ", index())).toEqual([]);
  });

  it("finds an official event by name", () => {
    const groups = searchAll("black friday", index());
    expect(titles(groups, "event")).toContain("Black Friday");
  });

  it("is case-insensitive", () => {
    const groups = searchAll("BLACK FRIDAY", index());
    expect(titles(groups, "event")).toContain("Black Friday");
  });

  it("matches campaigns by name and countries + events by name", () => {
    const groups = searchAll("canada", index());
    expect(titles(groups, "country").some((t) => t.includes("Canada"))).toBe(true);
    expect(titles(groups, "event")).toContain("Canada Day");
    expect(titles(groups, "campaign")).toContain("Canada Day Promo 2026");
  });

  it("matches templates by name", () => {
    const groups = searchAll("flash", index());
    expect(titles(groups, "template")).toContain("48h Flash Sale");
  });

  it("excludes per-store hidden events from results", () => {
    const prefs: StoreEventPreference[] = [
      { storeId: "store_demo", globalEventId: "ge_us_blackfriday", hidden: true },
    ];
    const groups = searchAll("black friday", index(prefs));
    expect(titles(groups, "event")).not.toContain("Black Friday");
  });

  it("groups results and counts them deterministically", () => {
    const a = searchAll("canada", index());
    const b = searchAll("canada", index());
    expect(a).toEqual(b); // deterministic — no AI, no randomness
    expect(countResults(a)).toBe(
      a.reduce((n, g) => n + g.results.length, 0),
    );
  });
});
