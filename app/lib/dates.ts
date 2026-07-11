import { format, differenceInCalendarDays, parseISO } from "date-fns";

/** e.g. "July 2026" */
export function currentMonthLabel(date: Date = new Date()): string {
  return format(date, "MMMM yyyy");
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
