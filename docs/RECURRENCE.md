# Eventra — Event Recurrence Model

> How official/global event dates are defined and resolved to concrete calendar dates.
> Applies to `app/types/domain.ts#DateRule`, `app/lib/events.ts`, and the catalog in
> `app/data/mockGlobalEvents.ts`. Regression tests: `test/lib/events.test.ts`.

## `DateRule`
A rule resolves to one date per year via `resolveDateRule(rule, year)`.

| Field | Applies to | Meaning |
|-------|-----------|---------|
| `kind` | all | `"fixed"` or `"nth_weekday"` |
| `month` | all | 1–12 |
| `day` | fixed | day of month (1–31) |
| `weekday` | nth_weekday | 0 = Sun … 6 = Sat |
| `nth` | nth_weekday | 1–5, or **-1 = last** occurrence in the month |
| `offsetDays` | any | fixed shift applied **after** resolving (e.g. +1 day) |

Multi-day events also carry an `endRule` (same shape); single-day events omit it.

## Why `offsetDays` exists (the Black Friday problem)
Black Friday and Cyber Monday are defined **relative to Thanksgiving** (the 4th Thursday of
November), not as their own weekday ordinal:

- **Black Friday** = the day *after* the 4th Thursday → `{ nth_weekday, weekday: 4, nth: 4, offsetDays: 1 }`
- **Cyber Monday** = the Monday *after* → `{ nth_weekday, weekday: 4, nth: 4, offsetDays: 4 }`

A naive encoding ("4th Friday of November" / "last Monday of November") **drifts** in years where
November 1st is a Friday: the 4th Friday lands a week *before* the real Black Friday. Example — 2024:
naive 4th Friday = **Nov 22**, but the true Black Friday is **Nov 29**. Anchoring on Thanksgiving with
an offset is correct in every year.

Verified against the real US dates for **2023–2030** in `test/lib/events.test.ts`
(Black Friday and Cyber Monday, plus the invariant that Cyber Monday is always Black Friday + 3 days
and always a Monday).

## Audit of every rule-based catalog event
| Event | Rule | Correct? |
|-------|------|----------|
| New Year, Valentine's, Independence Day, Halloween, Christmas, Canada Day, Boxing Day | `fixed` | ✅ trivially |
| Back to School | `fixed` range (Aug 1 – Sep 15) | ✅ |
| Canadian Thanksgiving | 2nd Monday of October (`weekday: 1, nth: 2`) | ✅ by definition |
| **Black Friday** | 4th Thursday **+1** (`offsetDays: 1`) | ✅ fixed this sprint |
| **Cyber Monday** | 4th Thursday **+4** (`offsetDays: 4`) | ✅ fixed this sprint |

No other catalog event uses a relative definition, so no other event needs `offsetDays`.

## Phase-5 note
When the catalog moves to Supabase (`global_events.start_rule jsonb`), `offsetDays` is already part of
the `DateRule` shape, so the stored JSON simply carries the extra field — no migration of the resolver
logic is required. Admin UI for editing rules should expose `offsetDays` for relative holidays.
