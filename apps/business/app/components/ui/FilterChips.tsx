import { cn } from "~/lib/cn";

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  chips: FilterChip<T>[];
  /** currently-selected value; `null` means "All" */
  value: T | null;
  onChange: (value: T | null) => void;
  /** label + behaviour of the reset chip; omit to hide it */
  allLabel?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * A single-select row of filter chips with optional counts, plus an "All" reset.
 * Distinct from SegmentedControl: chips wrap, carry counts, and support a null
 * (unfiltered) state — the pattern used by list surfaces (Opportunities, etc.).
 */
export function FilterChips<T extends string>({
  chips,
  value,
  onChange,
  allLabel = "All",
  className,
  "aria-label": ariaLabel,
}: FilterChipsProps<T>) {
  const chip = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "border-brand-300 bg-brand-50 text-brand-700"
        : "border-line bg-surface text-ink-muted hover:bg-surface-2",
    );

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {allLabel ? (
        <button type="button" className={chip(value === null)} onClick={() => onChange(null)}>
          {allLabel}
        </button>
      ) : null}
      {chips.map((c) => (
        <button
          key={c.value}
          type="button"
          className={chip(value === c.value)}
          onClick={() => onChange(value === c.value ? null : c.value)}
          aria-pressed={value === c.value}
        >
          {c.label}
          {typeof c.count === "number" ? (
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                value === c.value ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-ink-muted",
              )}
            >
              {c.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
