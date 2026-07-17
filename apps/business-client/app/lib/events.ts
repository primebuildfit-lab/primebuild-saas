/**
 * Event date logic now lives in the shared @eventra/calendar engine (single
 * source): resolveDateRule, resolveNthWeekday, eventOccurrence, eventPrepStatus,
 * PREP_STATUS_LABEL, eventInCountries, Occurrence, EventPrepStatus. Re-exported so
 * existing `~/lib/events` imports keep working.
 */
export * from "@eventra/calendar";

import type { CustomEvent } from "~/types/domain";

/** Business-specific: resolve a merchant custom event to calendar ISO dates. */
export function customEventOccurrence(event: CustomEvent): {
  startISO: string;
  endISO: string;
} {
  return { startISO: event.startDate, endISO: event.endDate ?? event.startDate };
}
