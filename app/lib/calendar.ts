import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type WeekStart = 0 | 1;

/** Weekday header labels, ordered by the store's week-start preference. */
export function weekdayLabels(weekStartsOn: WeekStart): string[] {
  const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return weekStartsOn === 1 ? [...base.slice(1), base[0]] : base;
}

/**
 * The 6×7 (or 5×7) grid of days covering a month, padded to whole weeks.
 * Returns a flat list of Date objects.
 */
export function monthGridDays(monthDate: Date, weekStartsOn: WeekStart): Date[] {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/** The 12 month anchor dates for a year (Jan..Dec at day 1). */
export function yearMonths(year: number): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
}

/** Shift a yyyy-MM-dd string by a number of days, returning yyyy-MM-dd. */
export function shiftISO(iso: string, deltaDays: number): string {
  const d = addDays(new Date(`${iso}T00:00:00`), deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
