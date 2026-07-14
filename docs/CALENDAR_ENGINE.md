# Calendar Engine (`CALENDAR_ENGINE.md`)

_Last updated: 2026-07-13._

The calendar is **one visual representation** of opportunities — not the product. It is designed for annual
commercial planning, not day-to-day scheduling.

## Annual heatmap (default)

- Component: `apps/business/app/features/calendar/YearHeatmap.tsx`.
- Renders all twelve months as compact grids. Each day is coloured by its **highest-priority real signal** so
  the whole year reads at a glance without labels.
- **Legend / colours** (driven by real `CalendarEntry` data): High/critical (red), Medium (orange),
  Informative (blue), Campaign active (green), No events (empty), plus `today` ring.
- Clicking a month header **expands it inline** (accordion) rendering the full `MonthView` for that month —
  the user never loses the year context (no navigation away).
- Date helpers come from the shared `@eventra/calendar` package via `~/lib/dates` and `~/lib/calendar`
  (`yearMonths`, `monthGridDays`, `weekdayLabels`, `toISODate`, `monthLabel`).

## Views & data

- Route `routes/app.calendar.tsx` defaults to the annual view (`view=year`), with Month/other views still
  available from `CalendarToolbar`. Entries are built by `entriesForYear` and filtered client-side.
- `CalendarEntry` carries `importance`, `category`, `status`, `color`, `countryCodes` — enough to drive the
  heatmap and day drawers without inventing anything.

## Remaining (per master spec)

Quarter / Agenda / Timeline / Compare-years views, a richer filter bar (industry/audience/only-saved/
only-cancelled), drag-to-reschedule inside the heatmap, and mobile agenda are **not yet built** — tracked in
`EVENTRA_BUSINESS_PRODUCT_REDESIGN_REPORT.md`.

## Tests

`test/components/builder-calendar.test.tsx` asserts the annual heatmap renders with its legend.
