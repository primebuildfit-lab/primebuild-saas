import { useMemo, useState } from "react";
import {
  monthGridDays,
  weekdayLabels,
  monthLabel,
  toISODate,
  formatDate,
  type WeekStart,
} from "@eventra/calendar";

/**
 * Eventra Consumer — mobile-first month calendar.
 *
 * Pure UI on top of the shared @eventra/calendar engine (no date math here).
 * Designed portrait-first for a phone-installed PWA: full-bleed grid, ≥44px tap
 * targets, today + selected-day states, month navigation, and a "Today" reset.
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

export function Calendar() {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedISO, setSelectedISO] = useState<string>(todayISO);

  const days = useMemo(() => monthGridDays(viewMonth, WEEK_STARTS_ON), [viewMonth]);
  const labels = useMemo(() => weekdayLabels(WEEK_STARTS_ON), []);

  const goToday = () => {
    setViewMonth(startOfMonth(today));
    setSelectedISO(todayISO);
  };

  return (
    <section aria-label="Calendar" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Month header + navigation */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{monthLabel(viewMonth)}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavButton label="Previous month" onClick={() => setViewMonth((m) => addMonths(m, -1))}>
            ‹
          </NavButton>
          <button
            type="button"
            onClick={goToday}
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              border: "1px solid var(--eventra-border)",
              background: "var(--eventra-surface)",
              color: "var(--eventra-text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Today
          </button>
          <NavButton label="Next month" onClick={() => setViewMonth((m) => addMonths(m, 1))}>
            ›
          </NavButton>
        </div>
      </header>

      {/* Weekday header row */}
      <div
        role="row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--eventra-text-muted)",
        }}
      >
        {labels.map((l) => (
          <div key={l} role="columnheader" style={{ padding: "6px 0" }}>
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        role="grid"
        aria-label={monthLabel(viewMonth)}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = iso === todayISO;
          const isSelected = iso === selectedISO;
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-label={formatDate(iso)}
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              onClick={() => setSelectedISO(iso)}
              style={{
                aspectRatio: "1 / 1",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: isToday ? 700 : 500,
                cursor: "pointer",
                border: isSelected
                  ? "2px solid var(--eventra-brand-600)"
                  : "1px solid transparent",
                background: isToday
                  ? "var(--eventra-brand-600)"
                  : isSelected
                    ? "var(--eventra-brand-50)"
                    : "var(--eventra-surface)",
                color: isToday
                  ? "#fff"
                  : inMonth
                    ? "var(--eventra-text)"
                    : "var(--eventra-text-muted)",
                opacity: inMonth ? 1 : 0.45,
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div
        style={{
          marginTop: 4,
          padding: "14px 16px",
          borderRadius: "var(--eventra-radius)",
          background: "var(--eventra-surface)",
          border: "1px solid var(--eventra-border)",
          boxShadow: "var(--eventra-shadow)",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--eventra-text-muted)", fontWeight: 600 }}>
          {selectedISO === todayISO ? "Today" : "Selected"}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{formatDate(selectedISO)}</div>
        <div style={{ fontSize: 13, color: "var(--eventra-text-muted)", marginTop: 6 }}>
          No events yet.
        </div>
      </div>
    </section>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "1px solid var(--eventra-border)",
        background: "var(--eventra-surface)",
        color: "var(--eventra-text)",
        fontSize: 20,
        lineHeight: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
