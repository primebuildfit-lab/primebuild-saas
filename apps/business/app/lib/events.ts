import { addDays, isBefore, startOfDay } from "date-fns";
import type {
  Campaign,
  CustomEvent,
  DateRule,
  EventPrepStatus,
  GlobalEvent,
} from "~/types/domain";
import { toISODate } from "~/lib/dates";

/**
 * Resolve a recurrence rule to a concrete date in a given year.
 * Supports fixed (month/day) and nth-weekday (1–5, or -1 = last).
 * This is the precise Phase-2 resolution promised for Black Friday / Cyber Monday.
 */
export function resolveDateRule(rule: DateRule, year: number): Date {
  const base =
    rule.kind === "fixed"
      ? new Date(year, rule.month - 1, rule.day ?? 1)
      : resolveNthWeekday(year, rule.month, rule.weekday ?? 0, rule.nth ?? 1);
  return rule.offsetDays ? addDays(base, rule.offsetDays) : base;
}

/** nth occurrence of `weekday` (0=Sun) in `month1` (1–12); nth=-1 means last. */
export function resolveNthWeekday(
  year: number,
  month1: number,
  weekday: number,
  nth: number,
): Date {
  const monthIndex = month1 - 1;
  if (nth === -1) {
    const last = new Date(year, monthIndex + 1, 0); // last day of month
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, monthIndex, last.getDate() - offset);
  }
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
}

export interface Occurrence {
  start: Date;
  end: Date;
  /** recommended preparation window start (start − recommendedLeadDays) */
  prepStart?: Date;
  startISO: string;
  endISO: string;
}

/** Concrete dates for a global event in a specific year. */
export function eventOccurrence(event: GlobalEvent, year: number): Occurrence {
  const start = resolveDateRule(event.startRule, year);
  const end = event.endRule ? resolveDateRule(event.endRule, year) : start;
  const prepStart =
    event.recommendedLeadDays != null
      ? addDays(start, -event.recommendedLeadDays)
      : undefined;
  return {
    start,
    end,
    prepStart,
    startISO: toISODate(start),
    endISO: toISODate(end),
  };
}

/**
 * Event preparation status (D/roadmap): Unprepared / Planning / Ready / Passed.
 * Kept entirely separate from campaign lifecycle status.
 */
export function eventPrepStatus(
  event: GlobalEvent,
  year: number,
  campaigns: Campaign[],
  today: Date = new Date(),
): EventPrepStatus {
  const { start } = eventOccurrence(event, year);
  if (isBefore(start, startOfDay(today))) return "passed";

  const linked = campaigns.filter((c) => c.globalEventId === event.id);
  if (
    linked.some((c) =>
      ["scheduled", "active", "completed"].includes(c.status),
    )
  ) {
    return "ready";
  }
  if (linked.length > 0) return "planning";
  return "unprepared";
}

export const PREP_STATUS_LABEL: Record<EventPrepStatus, string> = {
  unprepared: "Unprepared",
  planning: "Planning",
  ready: "Ready",
  passed: "Passed",
};

/** Whether a global event applies to any of the store's enabled countries. */
export function eventInCountries(
  event: GlobalEvent,
  enabledCodes: string[],
): boolean {
  return event.countryCodes.some((c) => enabledCodes.includes(c));
}

/** Custom events resolved as calendar entries (already concrete ISO dates). */
export function customEventOccurrence(event: CustomEvent): {
  startISO: string;
  endISO: string;
} {
  return { startISO: event.startDate, endISO: event.endDate ?? event.startDate };
}
