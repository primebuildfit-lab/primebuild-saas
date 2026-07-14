import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  differenceInCalendarDays,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { useData } from "~/context/DataContext";
import type { CalendarEntry } from "~/lib/planning";
import { monthGridDays, weekdayLabels, shiftISO, type WeekStart } from "~/lib/calendar";
import { toISODate } from "~/lib/dates";
import { cn } from "~/lib/cn";
import { EntryChip } from "./EntryChip";

interface MonthViewProps {
  monthDate: Date;
  entries: CalendarEntry[];
  weekStartsOn: WeekStart;
  compact?: boolean;
  onSelectDay: (date: Date) => void;
}

function DayCell({
  date,
  monthDate,
  entries,
  compact,
  onSelectDay,
}: {
  date: Date;
  monthDate: Date;
  entries: CalendarEntry[];
  compact?: boolean;
  onSelectDay: (date: Date) => void;
}) {
  const iso = toISODate(date);
  const { setNodeRef, isOver } = useDroppable({ id: `day:${iso}`, data: { iso } });
  const inMonth = isSameMonth(date, monthDate);
  const today = isToday(date);
  const max = compact ? 2 : 3;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-0.5 border-b border-r border-line p-1",
        compact ? "min-h-16" : "min-h-24",
        !inMonth && "bg-surface-2/60",
        isOver && "bg-brand-500/15 ring-2 ring-inset ring-brand-300",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectDay(date)}
        className={cn(
          "mb-0.5 flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-medium transition-colors hover:bg-surface-2",
          today ? "bg-brand-600 text-white hover:bg-brand-700" : "text-ink-muted",
          !inMonth && "text-ink-faint",
        )}
        aria-label={`Open ${iso}`}
      >
        {date.getDate()}
      </button>
      <div className="flex flex-col gap-0.5">
        {entries.slice(0, max).map((entry) => (
          <EntryChip
            key={entry.key}
            entry={entry}
            onClick={() => onSelectDay(date)}
          />
        ))}
        {entries.length > max ? (
          <button
            type="button"
            onClick={() => onSelectDay(date)}
            className="px-1 text-left text-[11px] font-medium text-ink-faint hover:text-ink-muted"
          >
            +{entries.length - max} more
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function MonthView({
  monthDate,
  entries,
  weekStartsOn,
  compact,
  onSelectDay,
}: MonthViewProps) {
  const { moveCampaign } = useData();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const [activeEntry, setActiveEntry] = useState<CalendarEntry | null>(null);

  const days = useMemo(
    () => monthGridDays(monthDate, weekStartsOn),
    [monthDate, weekStartsOn],
  );

  // Entries placed on their start day (within the grid).
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const key = entry.startISO;
      const arr = map.get(key) ?? [];
      arr.push(entry);
      map.set(key, arr);
    }
    return map;
  }, [entries]);

  const onDragStart = (e: DragStartEvent) => {
    const entry = e.active.data.current?.entry as CalendarEntry | undefined;
    setActiveEntry(entry ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveEntry(null);
    const entry = e.active.data.current?.entry as CalendarEntry | undefined;
    const targetISO = e.over?.data.current?.iso as string | undefined;
    if (!entry || !targetISO || entry.kind !== "campaign") return;
    if (targetISO === entry.startISO) return;
    const duration = differenceInCalendarDays(
      parseISO(entry.endISO),
      parseISO(entry.startISO),
    );
    moveCampaign(entry.refId, targetISO, shiftISO(targetISO, duration));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="grid grid-cols-7 border-b border-line bg-surface-2">
          {weekdayLabels(weekStartsOn).map((label) => (
            <div
              key={label}
              className="border-r border-line px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint last:border-r-0"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date) => (
            <DayCell
              key={date.toISOString()}
              date={date}
              monthDate={monthDate}
              entries={byDay.get(toISODate(date)) ?? []}
              compact={compact}
              onSelectDay={onSelectDay}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeEntry ? (
          <div className="rounded bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-lg">
            {activeEntry.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
