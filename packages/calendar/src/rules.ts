import { addDays } from "date-fns";
import type { DateRule } from "@eventra/types";

/**
 * Resolve a recurrence rule to a concrete date in a given year. Supports fixed
 * (month/day) and nth-weekday (1–5, or -1 = last), plus an optional `offsetDays`
 * shift — the mechanism that makes Black Friday (4th Thursday + 1) and Cyber
 * Monday (4th Thursday + 4) correct in every year.
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
    const last = new Date(year, monthIndex + 1, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, monthIndex, last.getDate() - offset);
  }
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
}
