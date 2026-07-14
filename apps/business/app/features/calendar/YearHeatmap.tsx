import { Fragment, useMemo, useState } from "react";
import { eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import type { CalendarEntry } from "~/lib/planning";
import { monthGridDays, yearMonths, weekdayLabels, type WeekStart } from "~/lib/calendar";
import { toISODate, monthLabel } from "~/lib/dates";
import { MonthView } from "./MonthView";
import { cn } from "~/lib/cn";

/**
 * The annual calendar as a HEATMAP — the company thinks in years. Twelve compact
 * months; each day is coloured by its highest-priority signal so the whole year
 * reads at a glance without labels. Clicking a month EXPANDS it inline (accordion)
 * — the user never loses the year context. Colours are driven by REAL entries.
 */

type Heat = "campaign" | "high" | "medium" | "low" | null;

const HEAT_BG: Record<NonNullable<Heat>, string> = {
  campaign: "bg-ok/70",
  high: "bg-err/70",
  medium: "bg-warn/70",
  low: "bg-info/60",
};

const LEGEND: Array<{ heat: NonNullable<Heat>; label: string }> = [
  { heat: "high", label: "High / critical" },
  { heat: "medium", label: "Medium" },
  { heat: "low", label: "Informative" },
  { heat: "campaign", label: "Campaign active" },
];

function importanceHeat(i?: string): Heat {
  if (i === "high") return "high";
  if (i === "medium") return "medium";
  if (i === "low") return "low";
  return null;
}
const RANK: Record<NonNullable<Heat>, number> = { campaign: 4, high: 3, medium: 2, low: 1 };

/** Highest-priority heat per ISO day, from the real entries. */
function buildHeatMap(entries: CalendarEntry[]): Map<string, Heat> {
  const map = new Map<string, Heat>();
  const bump = (iso: string, heat: Heat) => {
    if (!heat) return;
    const cur = map.get(iso);
    if (!cur || RANK[heat] > RANK[cur]) map.set(iso, heat);
  };
  for (const e of entries) {
    const start = parseISO(e.startISO);
    const end = parseISO(e.endISO);
    const heat: Heat =
      e.kind === "campaign"
        ? e.status === "active" || e.status === "scheduled"
          ? "campaign"
          : "low"
        : importanceHeat(e.importance);
    if (end < start) {
      bump(e.startISO, heat);
      continue;
    }
    for (const day of eachDayOfInterval({ start, end })) bump(toISODate(day), heat);
  }
  return map;
}

function MiniMonth({
  monthDate,
  heatMap,
  weekStartsOn,
  expanded,
  onToggle,
}: {
  monthDate: Date;
  heatMap: Map<string, Heat>;
  weekStartsOn: WeekStart;
  expanded: boolean;
  onToggle: () => void;
}) {
  const days = monthGridDays(monthDate, weekStartsOn);
  const count = days.filter((d) => isSameMonth(d, monthDate) && heatMap.get(toISODate(d))).length;
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-3 transition-colors",
        expanded ? "border-brand-500/50 ring-1 ring-inset ring-brand-500/30" : "border-line",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-ink hover:text-brand-300"
      >
        <span>{monthLabel(monthDate).split(" ")[0]}</span>
        <span className="flex items-center gap-1.5 text-[11px] font-normal text-ink-faint">
          {count > 0 ? `${count} days` : "—"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </span>
      </button>
      <div className="grid grid-cols-7 gap-0.5">
        {weekdayLabels(weekStartsOn).map((l) => (
          <div key={l} className="text-center text-[9px] font-medium text-ink-faint">
            {l[0]}
          </div>
        ))}
        {days.map((date) => {
          const inMonth = isSameMonth(date, monthDate);
          const heat = inMonth ? heatMap.get(toISODate(date)) : null;
          const today = isToday(date);
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex h-6 items-center justify-center rounded text-[10px]",
                !inMonth && "text-ink-faint opacity-40",
                inMonth && !heat && "text-ink-faint",
                heat && "font-semibold text-white",
                heat && HEAT_BG[heat],
                today && "ring-1 ring-brand-400",
              )}
              title={heat ? `${monthLabel(date)} · ${heat}` : undefined}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function YearHeatmap({
  year,
  entries,
  weekStartsOn,
  onSelectDay,
}: {
  year: number;
  entries: CalendarEntry[];
  weekStartsOn: WeekStart;
  onSelectDay: (date: Date) => void;
}) {
  const heatMap = useMemo(() => buildHeatMap(entries), [entries]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const months = yearMonths(year);

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface px-3 py-2">
        {LEGEND.map((l) => (
          <span key={l.heat} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className={cn("h-3 w-3 rounded-sm", HEAT_BG[l.heat])} />
            {l.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-3 w-3 rounded-sm border border-line bg-surface-2" />
          No events
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((monthDate, i) => {
          const isOpen = expanded === i;
          return (
            <Fragment key={monthDate.toISOString()}>
              <MiniMonth
                monthDate={monthDate}
                heatMap={heatMap}
                weekStartsOn={weekStartsOn}
                expanded={isOpen}
                onToggle={() => setExpanded(isOpen ? null : i)}
              />
              {isOpen ? (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <div className="rounded-xl border border-brand-500/40 bg-surface p-4">
                    <MonthView
                      monthDate={monthDate}
                      entries={entries}
                      weekStartsOn={weekStartsOn}
                      onSelectDay={onSelectDay}
                    />
                  </div>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
