import { useMemo } from "react";
import {
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import type { CalendarEntry } from "~/lib/planning";
import { monthGridDays, yearMonths, weekdayLabels, type WeekStart } from "~/lib/calendar";
import { toISODate } from "~/lib/dates";
import { cn } from "~/lib/cn";

interface YearViewProps {
  year: number;
  entries: CalendarEntry[];
  weekStartsOn: WeekStart;
  onSelectMonth: (date: Date) => void;
  onSelectDay: (date: Date) => void;
}

function MiniMonth({
  monthDate,
  covered,
  weekStartsOn,
  onSelectMonth,
  onSelectDay,
}: {
  monthDate: Date;
  covered: Set<string>;
  weekStartsOn: WeekStart;
  onSelectMonth: (date: Date) => void;
  onSelectDay: (date: Date) => void;
}) {
  const days = monthGridDays(monthDate, weekStartsOn);
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
      <button
        type="button"
        onClick={() => onSelectMonth(monthDate)}
        className="mb-2 text-sm font-semibold text-ink hover:text-brand-700"
      >
        {format(monthDate, "MMMM")}
      </button>
      <div className="grid grid-cols-7 gap-0.5">
        {weekdayLabels(weekStartsOn).map((l) => (
          <div key={l} className="text-center text-[9px] font-medium text-ink-faint">
            {l[0]}
          </div>
        ))}
        {days.map((date) => {
          const inMonth = isSameMonth(date, monthDate);
          const has = covered.has(toISODate(date));
          const today = isToday(date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDay(date)}
              className={cn(
                "relative flex h-6 items-center justify-center rounded text-[10px] transition-colors hover:bg-surface-2",
                inMonth ? "text-ink-muted" : "text-ink-faint",
                today && "bg-brand-600 font-semibold text-white hover:bg-brand-700",
              )}
            >
              {date.getDate()}
              {has && !today ? (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function YearView({
  year,
  entries,
  weekStartsOn,
  onSelectMonth,
  onSelectDay,
}: YearViewProps) {
  const covered = useMemo(() => {
    const set = new Set<string>();
    for (const entry of entries) {
      const start = parseISO(entry.startISO);
      const end = parseISO(entry.endISO);
      if (end < start) {
        set.add(entry.startISO);
        continue;
      }
      for (const day of eachDayOfInterval({ start, end })) {
        set.add(toISODate(day));
      }
    }
    return set;
  }, [entries]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {yearMonths(year).map((monthDate) => (
        <MiniMonth
          key={monthDate.toISOString()}
          monthDate={monthDate}
          covered={covered}
          weekStartsOn={weekStartsOn}
          onSelectMonth={onSelectMonth}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
}
