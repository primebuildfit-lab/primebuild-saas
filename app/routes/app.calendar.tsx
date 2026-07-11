import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { PageHeader } from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { GlobalEvent } from "~/types/domain";
import { entriesForYear, type CalendarEntry } from "~/lib/planning";
import { monthLabel } from "~/lib/dates";
import {
  CalendarToolbar,
  defaultCalendarFilters,
  type CalendarFilters,
  type CalendarView,
} from "~/features/calendar/CalendarToolbar";
import { YearView } from "~/features/calendar/YearView";
import { MonthView } from "~/features/calendar/MonthView";
import { DayDetail } from "~/features/calendar/DayDetail";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import {
  emptyCampaignValues,
  valuesFromEvent,
  type CampaignFormValues,
} from "~/features/campaigns/campaignModel";

const now = new Date();

function applyFilters(
  entries: CalendarEntry[],
  filters: CalendarFilters,
): CalendarEntry[] {
  return entries.filter((e) => {
    if (e.kind === "event" && !filters.events) return false;
    if (e.kind === "campaign" && !filters.campaigns) return false;
    if (e.kind === "custom" && !filters.custom) return false;
    if (filters.country && e.kind !== "custom") {
      return e.countryCodes?.includes(filters.country) ?? true;
    }
    return true;
  });
}

export default function CalendarRoute() {
  const {
    globalEvents,
    customEvents,
    campaigns,
    enabledCountryCodes,
    eventPreferences,
    preferences,
  } = useData();

  const [params, setParams] = useSearchParams();
  const view = (params.get("view") as CalendarView) || preferences.calendarFormat;
  const year = Number(params.get("y")) || now.getFullYear();
  const month = Number(params.get("m")) || now.getMonth() + 1; // 1–12
  const monthDate = new Date(year, month - 1, 1);

  const [filters, setFilters] = useState<CalendarFilters>(defaultCalendarFilters);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayOpen, setDayOpen] = useState(false);

  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignValues, setCampaignValues] = useState<CampaignFormValues>(() =>
    emptyCampaignValues(),
  );

  const setView = (v: CalendarView) => {
    params.set("view", v);
    setParams(params, { replace: true });
  };
  const setYear = (y: number) => {
    params.set("y", String(y));
    setParams(params, { replace: true });
  };
  const setMonth = (m: number, y: number) => {
    params.set("m", String(m));
    params.set("y", String(y));
    params.set("view", "month");
    setParams(params, { replace: true });
  };

  const entries = useMemo(
    () =>
      applyFilters(
        entriesForYear({
          globalEvents,
          customEvents,
          campaigns,
          enabledCodes: enabledCountryCodes,
          prefs: eventPreferences,
          year,
        }),
        filters,
      ),
    [
      globalEvents,
      customEvents,
      campaigns,
      enabledCountryCodes,
      eventPreferences,
      year,
      filters,
    ],
  );

  const openDay = (date: Date) => {
    setSelectedDay(date);
    setDayOpen(true);
  };

  const createForEvent = (event: GlobalEvent, evYear: number) => {
    setCampaignValues(valuesFromEvent(event, evYear, enabledCountryCodes[0]));
    setDayOpen(false);
    setCampaignModal(true);
  };

  const createOnDate = (dateISO: string) => {
    setCampaignValues(
      emptyCampaignValues({ startDate: dateISO, endDate: dateISO }),
    );
    setDayOpen(false);
    setCampaignModal(true);
  };

  const label = view === "year" ? String(year) : monthLabel(monthDate);

  const navigate = (dir: -1 | 1) => {
    if (view === "year") {
      setYear(year + dir);
    } else {
      const d = new Date(year, month - 1 + dir, 1);
      setMonth(d.getMonth() + 1, d.getFullYear());
    }
  };

  const goToday = () => {
    if (view === "year") setYear(now.getFullYear());
    else setMonth(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Plan the year, drag campaigns to reschedule, and open any day for detail."
      />

      <CalendarToolbar
        view={view}
        onViewChange={setView}
        label={label}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={goToday}
        filters={filters}
        onFiltersChange={setFilters}
        enabledCountryCodes={enabledCountryCodes}
      />

      {view === "year" ? (
        <YearView
          year={year}
          entries={entries}
          weekStartsOn={preferences.weekStartsOn}
          onSelectMonth={(d) => setMonth(d.getMonth() + 1, d.getFullYear())}
          onSelectDay={openDay}
        />
      ) : (
        <MonthView
          monthDate={monthDate}
          entries={entries}
          weekStartsOn={preferences.weekStartsOn}
          compact={preferences.density === "compact"}
          onSelectDay={openDay}
        />
      )}

      <DayDetail
        open={dayOpen}
        date={selectedDay}
        onClose={() => setDayOpen(false)}
        onCreateForEvent={createForEvent}
        onCreateOnDate={createOnDate}
      />

      <CampaignFormModal
        open={campaignModal}
        onClose={() => setCampaignModal(false)}
        initialValues={campaignValues}
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
