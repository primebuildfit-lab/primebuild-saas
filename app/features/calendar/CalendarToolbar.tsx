import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  SegmentedControl,
  Select,
} from "~/components/ui";
import { getCountry } from "~/data";

export type CalendarView = "year" | "month";

export interface CalendarFilters {
  events: boolean;
  campaigns: boolean;
  custom: boolean;
  country: string;
}

export const defaultCalendarFilters: CalendarFilters = {
  events: true,
  campaigns: true,
  custom: true,
  country: "",
};

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  enabledCountryCodes: string[];
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-gray-200 bg-white text-gray-400 hover:text-gray-600")
      }
    >
      {children}
    </button>
  );
}

export function CalendarToolbar({
  view,
  onViewChange,
  label,
  onPrev,
  onNext,
  onToday,
  filters,
  onFiltersChange,
  enabledCountryCodes,
}: CalendarToolbarProps) {
  const toggle = (key: keyof CalendarFilters) =>
    onFiltersChange({ ...filters, [key]: !filters[key] });

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={onPrev}
              className="rounded-l-lg p-2 text-gray-500 hover:bg-gray-50"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-r-lg border-l border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={onToday}>
            Today
          </Button>
          <h2 className="ml-1 text-base font-semibold text-gray-900">{label}</h2>
        </div>

        <SegmentedControl<CalendarView>
          aria-label="Calendar view"
          segments={[
            { value: "year", label: "Year" },
            { value: "month", label: "Month" },
          ]}
          value={view}
          onChange={onViewChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-400">Show:</span>
        <FilterChip active={filters.events} onClick={() => toggle("events")}>
          Events
        </FilterChip>
        <FilterChip active={filters.campaigns} onClick={() => toggle("campaigns")}>
          Campaigns
        </FilterChip>
        <FilterChip active={filters.custom} onClick={() => toggle("custom")}>
          Custom
        </FilterChip>
        {enabledCountryCodes.length > 1 ? (
          <Select
            value={filters.country}
            onChange={(e) =>
              onFiltersChange({ ...filters, country: e.target.value })
            }
            aria-label="Filter by country"
            className="h-8 w-auto py-0 text-xs"
          >
            <option value="">All countries</option>
            {enabledCountryCodes.map((code) => (
              <option key={code} value={code}>
                {getCountry(code)?.name ?? code}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
    </div>
  );
}
