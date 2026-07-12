import { addDays, isBefore, startOfDay } from "date-fns";
import type { GlobalEvent } from "@eventra/types";
import { resolveDateRule } from "./rules";
import { toISODate } from "./dates";

export type EventPrepStatus = "unprepared" | "planning" | "ready" | "passed";

export const PREP_STATUS_LABEL: Record<EventPrepStatus, string> = {
  unprepared: "Unprepared",
  planning: "Planning",
  ready: "Ready",
  passed: "Passed",
};

export interface Occurrence {
  start: Date;
  end: Date;
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
  return { start, end, prepStart, startISO: toISODate(start), endISO: toISODate(end) };
}

/** Whether a global event applies to any of the given enabled countries. */
export function eventInCountries(event: GlobalEvent, enabledCodes: string[]): boolean {
  return event.countryCodes.some((c) => enabledCodes.includes(c));
}

/**
 * Preparation status (Unprepared/Planning/Ready/Passed), kept separate from
 * campaign lifecycle. Generic over any "linked plan" with a status so both
 * Business (campaigns) and Consumer surfaces can use it.
 */
export function eventPrepStatus(
  event: GlobalEvent,
  year: number,
  linked: ReadonlyArray<{ globalEventId?: string; status: string }>,
  today: Date = new Date(),
): EventPrepStatus {
  const { start } = eventOccurrence(event, year);
  if (isBefore(start, startOfDay(today))) return "passed";
  const forEvent = linked.filter((l) => l.globalEventId === event.id);
  if (forEvent.some((l) => ["scheduled", "active", "completed"].includes(l.status))) {
    return "ready";
  }
  if (forEvent.length > 0) return "planning";
  return "unprepared";
}
