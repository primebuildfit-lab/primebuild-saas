import {
  format,
  differenceInCalendarDays,
  parseISO,
  isSameDay as dfnsIsSameDay,
} from "date-fns";

export function currentMonthLabel(date: Date = new Date()): string {
  return format(date, "MMMM yyyy");
}
export function monthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}
/** yyyy-MM-dd (local) — the canonical date key. */
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
export function fromISODate(iso: string): Date {
  return parseISO(iso);
}
export function isSameDayISO(iso: string, date: Date): boolean {
  return dfnsIsSameDay(parseISO(iso), date);
}
export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}
export function formatDayMonth(iso: string): string {
  return format(parseISO(iso), "MMM d");
}
export function formatDateRange(startISO: string, endISO: string): string {
  if (startISO === endISO) return formatDate(startISO);
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }
  return `${formatDate(startISO)} – ${formatDate(endISO)}`;
}
export function daysUntil(iso: string, from: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(iso), from);
}
export function relativeDays(iso: string, from: Date = new Date()): string {
  const d = daysUntil(iso, from);
  if (d === 0) return "today";
  if (d > 0) return `in ${d} day${d === 1 ? "" : "s"}`;
  const n = Math.abs(d);
  return `${n} day${n === 1 ? "" : "s"} ago`;
}
