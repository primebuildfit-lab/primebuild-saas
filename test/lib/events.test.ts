import { describe, it, expect } from "vitest";
import {
  resolveDateRule,
  resolveNthWeekday,
  eventOccurrence,
  eventPrepStatus,
} from "~/lib/events";
import { toISODate } from "~/lib/dates";
import { globalEvents } from "~/data";
import type { Campaign, GlobalEvent } from "~/types/domain";

const bf = globalEvents.find((e) => e.id === "ge_us_blackfriday")!;
const cm = globalEvents.find((e) => e.id === "ge_us_cybermonday")!;

/** Well-known real US dates — the regression oracle for the recurrence rules. */
const BLACK_FRIDAY: Record<number, string> = {
  2023: "2023-11-24",
  2024: "2024-11-29",
  2025: "2025-11-28",
  2026: "2026-11-27",
  2027: "2027-11-26",
  2028: "2028-11-24",
  2029: "2029-11-23",
  2030: "2030-11-29",
};
const CYBER_MONDAY: Record<number, string> = {
  2023: "2023-11-27",
  2024: "2024-12-02",
  2025: "2025-12-01",
  2026: "2026-11-30",
  2027: "2027-11-29",
  2028: "2028-11-27",
  2029: "2029-11-26",
  2030: "2030-12-02",
};

describe("resolveDateRule", () => {
  it("resolves fixed month/day", () => {
    expect(toISODate(resolveDateRule({ kind: "fixed", month: 7, day: 4 }, 2026))).toBe(
      "2026-07-04",
    );
    expect(toISODate(resolveDateRule({ kind: "fixed", month: 12, day: 25 }, 2030))).toBe(
      "2030-12-25",
    );
  });

  it("applies offsetDays after resolving", () => {
    // 4th Thursday of Nov 2026 is the 26th; +1 => 27th.
    const rule = { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 1 } as const;
    expect(toISODate(resolveDateRule(rule, 2026))).toBe("2026-11-27");
  });
});

describe("resolveNthWeekday", () => {
  it("finds the nth weekday of a month", () => {
    // 2nd Monday of October 2026 (Canadian Thanksgiving) = Oct 12.
    expect(toISODate(resolveNthWeekday(2026, 10, 1, 2))).toBe("2026-10-12");
  });

  it("supports nth = -1 (last weekday)", () => {
    // Last Monday of November 2026 = Nov 30.
    expect(toISODate(resolveNthWeekday(2026, 11, 1, -1))).toBe("2026-11-30");
  });

  it("handles months starting on the target weekday", () => {
    // Nov 2024 starts on a Friday; 4th Thursday must still be the 28th.
    expect(toISODate(resolveNthWeekday(2024, 11, 4, 4))).toBe("2024-11-28");
  });
});

describe("Black Friday recurrence — multi-year regression", () => {
  for (const [year, expected] of Object.entries(BLACK_FRIDAY)) {
    it(`is correct in ${year}`, () => {
      expect(toISODate(resolveDateRule(bf.startRule, Number(year)))).toBe(expected);
    });
  }

  it("is NOT the naive '4th Friday' (which is wrong when Nov starts on Friday)", () => {
    // Naive 4th Friday of Nov 2024 would be the 22nd; correct Black Friday is the 29th.
    const naiveFourthFriday = toISODate(resolveNthWeekday(2024, 11, 5, 4));
    expect(naiveFourthFriday).toBe("2024-11-22");
    expect(toISODate(resolveDateRule(bf.startRule, 2024))).toBe("2024-11-29");
  });
});

describe("Cyber Monday recurrence — multi-year regression", () => {
  for (const [year, expected] of Object.entries(CYBER_MONDAY)) {
    it(`is correct in ${year}`, () => {
      expect(toISODate(resolveDateRule(cm.startRule, Number(year)))).toBe(expected);
    });
  }

  it("is always the Monday three days after Black Friday", () => {
    for (const year of Object.keys(BLACK_FRIDAY).map(Number)) {
      const bfDate = resolveDateRule(bf.startRule, year);
      const cmDate = resolveDateRule(cm.startRule, year);
      const deltaDays = Math.round(
        (cmDate.getTime() - bfDate.getTime()) / 86_400_000,
      );
      expect(deltaDays).toBe(3);
      expect(cmDate.getDay()).toBe(1); // Monday
    }
  });
});

describe("eventOccurrence", () => {
  it("computes prepStart from recommendedLeadDays", () => {
    const occ = eventOccurrence(bf, 2026);
    expect(occ.startISO).toBe("2026-11-27");
    // 45 lead days before Nov 27.
    expect(occ.prepStart && toISODate(occ.prepStart)).toBe("2026-10-13");
  });

  it("resolves multi-day events via endRule", () => {
    const bts = globalEvents.find((e) => e.id === "ge_us_backtoschool")!;
    const occ = eventOccurrence(bts, 2026);
    expect(occ.startISO).toBe("2026-08-01");
    expect(occ.endISO).toBe("2026-09-15");
  });
});

describe("eventPrepStatus", () => {
  const event: GlobalEvent = bf;
  const today = new Date(2026, 0, 1); // Jan 1 2026, well before Black Friday

  const linked = (status: Campaign["status"]): Campaign[] => [
    {
      id: "c1",
      storeId: "store_demo",
      name: "BF",
      globalEventId: event.id,
      startDate: "2026-11-27",
      endDate: "2026-11-30",
      status,
      createdAt: "",
      updatedAt: "",
    },
  ];

  it("is 'unprepared' with no linked campaign", () => {
    expect(eventPrepStatus(event, 2026, [], today)).toBe("unprepared");
  });
  it("is 'planning' with a draft campaign", () => {
    expect(eventPrepStatus(event, 2026, linked("draft"), today)).toBe("planning");
  });
  it("is 'ready' with a scheduled/active campaign", () => {
    expect(eventPrepStatus(event, 2026, linked("scheduled"), today)).toBe("ready");
    expect(eventPrepStatus(event, 2026, linked("active"), today)).toBe("ready");
  });
  it("is 'passed' once the event date is in the past", () => {
    const after = new Date(2026, 11, 1); // Dec 1 2026, after Black Friday
    expect(eventPrepStatus(event, 2026, [], after)).toBe("passed");
  });
});
