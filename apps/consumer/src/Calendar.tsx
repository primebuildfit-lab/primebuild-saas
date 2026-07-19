import { useMemo, useState } from "react";
import {
  monthGridDays,
  weekdayLabels,
  monthLabel,
  toISODate,
  formatDate,
  type WeekStart,
} from "@eventra/calendar";
import { IconButton } from "./ui";
import { IconChevronLeft, IconChevronRight } from "./ui/icons";
import { PREVIEW_EVENT_DATES } from "./data/preview";

/**
 * Eventra Mobile — month calendar.
 *
 * Pure UI on top of the shared @eventra/calendar engine (no date math here).
 * Redesigned for the premium dark system: it is now ONE section inside the Home
 * (not the whole app). Reports the selected day so the Home can render the day's
 * agenda. Event dots come from clearly-labeled preview data. Accessibility is
 * preserved: grid/gridcell roles, weekday columnheaders, today = aria-current.
 */

const WEEK_STARTS_ON: WeekStart = 1; // Monday

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function Calendar({
  selectedISO,
  onSelect,
}: {
  selectedISO: string;
  onSelect: (iso: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date(selectedISO)));

  const days = useMemo(() => monthGridDays(viewMonth, WEEK_STARTS_ON), [viewMonth]);
  const labels = useMemo(() => weekdayLabels(WEEK_STARTS_ON), []);

  const goToday = () => {
    setViewMonth(startOfMonth(today));
    onSelect(todayISO);
  };

  return (
    <section aria-label="Calendar" className="em-cal">
      <header className="em-cal-head">
        <h2 className="em-cal-month">{monthLabel(viewMonth)}</h2>
        <div className="em-cal-nav">
          <IconButton label="Previous month" onClick={() => setViewMonth((m) => addMonths(m, -1))}>
            <IconChevronLeft size={18} />
          </IconButton>
          <button type="button" className="em-btn em-btn-secondary em-btn-sm" onClick={goToday}>
            Today
          </button>
          <IconButton label="Next month" onClick={() => setViewMonth((m) => addMonths(m, 1))}>
            <IconChevronRight size={18} />
          </IconButton>
        </div>
      </header>

      <div className="em-cal-weekdays" role="row">
        {labels.map((l) => (
          <div key={l} role="columnheader">{l}</div>
        ))}
      </div>

      <div className="em-cal-grid" role="grid" aria-label={monthLabel(viewMonth)}>
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = iso === todayISO;
          const isSelected = iso === selectedISO;
          const hasEvent = PREVIEW_EVENT_DATES.has(iso);
          const cls = [
            "em-cal-day",
            !inMonth && "out",
            isSelected && "selected",
            isToday && "today",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-label={formatDate(iso)}
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              onClick={() => onSelect(iso)}
              className={cls}
            >
              {day.getDate()}
              {hasEvent ? <span className="em-cal-daymark" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
