import { differenceInCalendarDays, isWithinInterval, parseISO, startOfDay } from "date-fns";
import type {
  Campaign,
  CampaignStatus,
  CustomEvent,
  EventCategory,
  EventPrepStatus,
  GlobalEvent,
  Importance,
  StoreEventPreference,
} from "~/types/domain";
import {
  eventInCountries,
  eventOccurrence,
  eventPrepStatus,
  type Occurrence,
} from "~/lib/events";
import { toISODate } from "~/lib/dates";

export type CalendarEntryKind = "event" | "custom" | "campaign";

export interface CalendarEntry {
  key: string;
  kind: CalendarEntryKind;
  refId: string;
  title: string;
  startISO: string;
  endISO: string;
  importance?: Importance;
  category?: EventCategory;
  status?: CampaignStatus;
  color?: string;
  countryCodes?: string[];
}

export interface Opportunity {
  event: GlobalEvent;
  year: number;
  occurrence: Occurrence;
  prepStatus: EventPrepStatus;
  daysUntil: number;
}

function isHidden(prefs: StoreEventPreference[], id: string): boolean {
  return prefs.some((p) => p.globalEventId === id && p.hidden);
}

/** Visible official events for a store: in an enabled country and not hidden. */
export function visibleGlobalEvents(
  events: GlobalEvent[],
  enabledCodes: string[],
  prefs: StoreEventPreference[],
): GlobalEvent[] {
  return events.filter(
    (e) => eventInCountries(e, enabledCodes) && !isHidden(prefs, e.id),
  );
}

/** Global-event calendar entries for a specific year. */
export function globalEntriesForYear(
  events: GlobalEvent[],
  enabledCodes: string[],
  prefs: StoreEventPreference[],
  year: number,
): CalendarEntry[] {
  return visibleGlobalEvents(events, enabledCodes, prefs).map((e) => {
    const occ = eventOccurrence(e, year);
    return {
      key: `event:${e.id}:${year}`,
      kind: "event" as const,
      refId: e.id,
      title: e.name,
      startISO: occ.startISO,
      endISO: occ.endISO,
      importance: e.importance,
      category: e.category,
      countryCodes: e.countryCodes,
    };
  });
}

export function campaignEntries(campaigns: Campaign[]): CalendarEntry[] {
  return campaigns.map((c) => ({
    key: `campaign:${c.id}`,
    kind: "campaign" as const,
    refId: c.id,
    title: c.name,
    startISO: c.startDate,
    endISO: c.endDate,
    status: c.status,
    countryCodes: c.country ? [c.country] : undefined,
  }));
}

export function customEntries(events: CustomEvent[]): CalendarEntry[] {
  return events.map((e) => ({
    key: `custom:${e.id}`,
    kind: "custom" as const,
    refId: e.id,
    title: e.name,
    startISO: e.startDate,
    endISO: e.endDate ?? e.startDate,
    category: e.category,
    color: e.color,
  }));
}

/** Every entry that touches a year, combined (events + custom + campaigns). */
export function entriesForYear(params: {
  globalEvents: GlobalEvent[];
  customEvents: CustomEvent[];
  campaigns: Campaign[];
  enabledCodes: string[];
  prefs: StoreEventPreference[];
  year: number;
}): CalendarEntry[] {
  const { globalEvents, customEvents, campaigns, enabledCodes, prefs, year } =
    params;
  const inYear = (iso: string) => parseISO(iso).getFullYear() === year;
  return [
    ...globalEntriesForYear(globalEvents, enabledCodes, prefs, year),
    ...customEntries(customEvents).filter((e) => inYear(e.startISO)),
    ...campaignEntries(campaigns).filter((e) => inYear(e.startISO)),
  ];
}

/** Entries overlapping a given day. */
export function entriesOnDay(entries: CalendarEntry[], day: Date): CalendarEntry[] {
  const target = startOfDay(day);
  return entries.filter((e) => {
    const start = startOfDay(parseISO(e.startISO));
    const end = startOfDay(parseISO(e.endISO));
    return isWithinInterval(target, { start, end });
  });
}

/**
 * Upcoming opportunities across the plan's horizon: official events in enabled
 * countries, not hidden, starting on/after today, sorted soonest-first.
 */
export function upcomingOpportunities(params: {
  globalEvents: GlobalEvent[];
  enabledCodes: string[];
  prefs: StoreEventPreference[];
  campaigns: Campaign[];
  today?: Date;
  horizonMonths: number;
  limit?: number;
}): Opportunity[] {
  const {
    globalEvents,
    enabledCodes,
    prefs,
    campaigns,
    today = new Date(),
    horizonMonths,
    limit,
  } = params;
  const from = startOfDay(today);
  const horizonEnd = new Date(from);
  horizonEnd.setMonth(horizonEnd.getMonth() + horizonMonths);

  const visible = visibleGlobalEvents(globalEvents, enabledCodes, prefs);
  const years = [from.getFullYear(), from.getFullYear() + 1];

  const result: Opportunity[] = [];
  for (const event of visible) {
    for (const year of years) {
      const occ = eventOccurrence(event, year);
      if (occ.start < from || occ.start > horizonEnd) continue;
      result.push({
        event,
        year,
        occurrence: occ,
        prepStatus: eventPrepStatus(event, year, campaigns, from),
        daysUntil: differenceInCalendarDays(occ.start, from),
      });
    }
  }

  result.sort((a, b) => a.occurrence.start.getTime() - b.occurrence.start.getTime());
  return limit ? result.slice(0, limit) : result;
}

/**
 * Events whose recommended preparation window is open now but that aren't ready
 * yet — i.e. the merchant should act. Uses recommendedLeadDays.
 */
export function preparationNeeded(params: {
  globalEvents: GlobalEvent[];
  enabledCodes: string[];
  prefs: StoreEventPreference[];
  campaigns: Campaign[];
  today?: Date;
  limit?: number;
}): Opportunity[] {
  const { today = new Date() } = params;
  const from = startOfDay(today);
  return upcomingOpportunities({
    ...params,
    today,
    horizonMonths: 12,
  }).filter((o) => {
    if (o.prepStatus === "ready" || o.prepStatus === "passed") return false;
    const prepStart = o.occurrence.prepStart;
    return prepStart ? prepStart <= from : o.daysUntil <= 45;
  }).slice(0, params.limit);
}

/** ISO date string for "today" (stable for a render pass). */
export function todayISO(today: Date = new Date()): string {
  return toISODate(today);
}
