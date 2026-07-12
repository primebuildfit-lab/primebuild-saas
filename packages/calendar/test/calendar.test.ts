import { describe, it, expect } from "vitest";
import {
  resolveDateRule,
  resolveNthWeekday,
  toISODate,
  monthGridDays,
  shiftISO,
  eventOccurrence,
  eventPrepStatus,
} from "../src/index";
import type { DateRule, GlobalEvent } from "@eventra/types";

const BF: DateRule = { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 1 };
const CM: DateRule = { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 4 };

const BLACK_FRIDAY: Record<number, string> = {
  2023: "2023-11-24", 2024: "2024-11-29", 2025: "2025-11-28", 2026: "2026-11-27",
  2027: "2027-11-26", 2028: "2028-11-24", 2029: "2029-11-23", 2030: "2030-11-29",
};

describe("date-rule resolution", () => {
  it("resolves fixed dates", () => {
    expect(toISODate(resolveDateRule({ kind: "fixed", month: 7, day: 4 }, 2026))).toBe("2026-07-04");
  });
  it("Black Friday is correct across 2023–2030 (offsetDays engine)", () => {
    for (const [year, expected] of Object.entries(BLACK_FRIDAY)) {
      expect(toISODate(resolveDateRule(BF, Number(year)))).toBe(expected);
    }
  });
  it("Cyber Monday is always Black Friday + 3 days (a Monday)", () => {
    for (const year of Object.keys(BLACK_FRIDAY).map(Number)) {
      const bf = resolveDateRule(BF, year);
      const cm = resolveDateRule(CM, year);
      expect(Math.round((cm.getTime() - bf.getTime()) / 86_400_000)).toBe(3);
      expect(cm.getDay()).toBe(1);
    }
  });
  it("nth=-1 finds the last weekday", () => {
    expect(toISODate(resolveNthWeekday(2026, 11, 1, -1))).toBe("2026-11-30");
  });
});

describe("grids & shifting", () => {
  it("month grid is whole weeks (multiple of 7)", () => {
    expect(monthGridDays(new Date(2026, 6, 1), 0).length % 7).toBe(0);
  });
  it("shiftISO moves a date string", () => {
    expect(shiftISO("2026-07-01", 6)).toBe("2026-07-07");
  });
});

describe("occurrence + prep status", () => {
  const event: GlobalEvent = {
    id: "ge", name: "BF", countryCodes: ["US"], startRule: BF,
    category: "major_sales", importance: "high", recommendedLeadDays: 45, recurring: true,
  };
  it("computes prepStart from lead days", () => {
    const occ = eventOccurrence(event, 2026);
    expect(occ.startISO).toBe("2026-11-27");
    expect(occ.prepStart && toISODate(occ.prepStart)).toBe("2026-10-13");
  });
  it("prep status is generic over linked plans", () => {
    const today = new Date(2026, 0, 1);
    expect(eventPrepStatus(event, 2026, [], today)).toBe("unprepared");
    expect(eventPrepStatus(event, 2026, [{ globalEventId: "ge", status: "draft" }], today)).toBe("planning");
    expect(eventPrepStatus(event, 2026, [{ globalEventId: "ge", status: "active" }], today)).toBe("ready");
  });
});
