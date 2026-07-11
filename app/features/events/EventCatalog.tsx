import { useMemo, useState } from "react";
import { Search, EyeOff, Eye, CalendarClock, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  Select,
  TextInput,
  Button,
  Badge,
  ColorDot,
  EmptyState,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { eventOccurrence, eventPrepStatus, eventInCountries } from "~/lib/events";
import { formatDateRange, relativeDays } from "~/lib/dates";
import type { EventCategory, GlobalEvent, Importance } from "~/types/domain";
import { PrepStatusBadge } from "./PrepStatusBadge";
import {
  CategoryBadge,
  EVENT_CATEGORIES,
  IMPORTANCE_LEVELS,
  IMPORTANCE_LABEL,
} from "./eventDisplay";
import { humanizeCategory } from "~/lib/format";

interface EventCatalogProps {
  onCreateCampaign: (event: GlobalEvent, year: number) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export function EventCatalog({ onCreateCampaign }: EventCatalogProps) {
  const {
    globalEvents,
    enabledCountryCodes,
    campaigns,
    isEventHidden,
    hideEvent,
    restoreEvent,
  } = useData();

  const [country, setCountry] = useState("");
  const [category, setCategory] = useState<"" | EventCategory>("");
  const [importance, setImportance] = useState<"" | Importance>("");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [showHidden, setShowHidden] = useState(false);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return globalEvents
      .filter((e) => eventInCountries(e, enabledCountryCodes))
      .filter((e) => (showHidden ? true : !isEventHidden(e.id)))
      .filter((e) => (country ? e.countryCodes.includes(country) : true))
      .filter((e) => (category ? e.category === category : true))
      .filter((e) => (importance ? e.importance === importance : true))
      .filter((e) =>
        q
          ? e.name.toLowerCase().includes(q) ||
            (e.description?.toLowerCase().includes(q) ?? false)
          : true,
      )
      .map((e) => ({ event: e, occ: eventOccurrence(e, year) }))
      .sort((a, b) => a.occ.start.getTime() - b.occ.start.getTime());
  }, [
    globalEvents,
    enabledCountryCodes,
    showHidden,
    country,
    category,
    importance,
    q,
    year,
    isEventHidden,
  ]);

  const hiddenCount = globalEvents.filter(
    (e) => eventInCountries(e, enabledCountryCodes) && isEventHidden(e.id),
  ).length;

  const yearOptions = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="pl-9"
              aria-label="Search events"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="Filter by country"
            >
              <option value="">All countries</option>
              {enabledCountryCodes.map((code) => (
                <option key={code} value={code}>
                  {getCountry(code)?.name ?? code}
                </option>
              ))}
            </Select>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory | "")}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanizeCategory(c)}
                </option>
              ))}
            </Select>
            <Select
              value={importance}
              onChange={(e) => setImportance(e.target.value as Importance | "")}
              aria-label="Filter by importance"
            >
              <option value="">All importance</option>
              {IMPORTANCE_LEVELS.map((i) => (
                <option key={i} value={i}>
                  {IMPORTANCE_LABEL[i]}
                </option>
              ))}
            </Select>
            <Select
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Planning year"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowHidden((s) => !s)}
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {showHidden ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {showHidden ? "Hide hidden events" : `Show hidden (${hiddenCount})`}
            </button>
          ) : null}
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No events match"
          description="Try clearing filters, enabling more countries, or searching a different term."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(({ event, occ }) => {
            const hidden = isEventHidden(event.id);
            const prep = eventPrepStatus(event, year, campaigns);
            return (
              <div
                key={event.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  hidden ? "border-gray-200 opacity-60" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ColorDot importance={event.importance} />
                      <h3 className="text-sm font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <CategoryBadge category={event.category} />
                      {hidden ? <Badge tone="gray">Hidden</Badge> : (
                        <PrepStatusBadge status={prep} />
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      {event.countryCodes
                        .map((c) => getCountry(c)?.flag ?? c)
                        .join(" ")}{" "}
                      · {formatDateRange(occ.startISO, occ.endISO)} ·{" "}
                      {relativeDays(occ.startISO)}
                      {event.recommendedLeadDays
                        ? ` · ${event.recommendedLeadDays}-day lead`
                        : ""}
                    </p>
                    {event.description ? (
                      <p className="mt-1.5 text-sm text-gray-600">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {hidden ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreEvent(event.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => hideEvent(event.id)}
                          title="Hide this event for your store (never deleted globally)"
                        >
                          <EyeOff className="h-4 w-4" />
                          Hide
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onCreateCampaign(event, year)}
                        >
                          Create campaign
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
