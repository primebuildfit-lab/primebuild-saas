import {
  format,
  differenceInCalendarDays,
  parseISO,
  isSameDay as dfnsIsSameDay,
} from "date-fns";

/** e.g. "July 2026" */
export function currentMonthLabel(date: Date = new Date()): string {
  return format(date, "MMMM yyyy");
}

/** e.g. "July 2026" for an arbitrary date. */
export function monthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}

/** yyyy-MM-dd (local), the canonical mock-data date key. */
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse a yyyy-MM-dd string to a local Date. */
export function fromISODate(iso: string): Date {
  return parseISO(iso);
}

export function isSameDayISO(iso: string, date: Date): boolean {
  return dfnsIsSameDay(parseISO(iso), date);
}

/** "Jul 4" (no year) for compact chips. */
export function formatDayMonth(iso: string): string {
  return format(parseISO(iso), "MMM d");
}

/** "Jul 4 – Jul 7, 2026" or a single date when start === end. */
export function formatDateRange(startISO: string, endISO: string): string {
  if (startISO === endISO) return formatDate(startISO);
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }
  return `${formatDate(startISO)} – ${formatDate(endISO)}`;
}

/** e.g. "Jul 4, 2026" */
export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

/** Whole calendar days from now until the given ISO date (negative if past). */
export function daysUntil(iso: string, from: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(iso), from);
}

/** "in 12 days" / "today" / "5 days ago" */
export function relativeDays(iso: string, from: Date = new Date()): string {
  const d = daysUntil(iso, from);
  if (d === 0) return "today";
  if (d > 0) return `in ${d} day${d === 1 ? "" : "s"}`;
  const n = Math.abs(d);
  return `${n} day${n === 1 ? "" : "s"} ago`;
}
