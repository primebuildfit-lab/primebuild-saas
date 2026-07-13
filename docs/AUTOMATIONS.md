# Eventra Automations & Jobs (`AUTOMATIONS.md`)

> Phase 7, Bloque 27. Platform jobs are **modeled** (status/schedule/errors) — no external services are
> connected. Each planned job has a pure core that is (or will be) unit-tested.

## Planned jobs

| Job | Purpose | Core (pure) |
|-----|---------|-------------|
| Discover offers | pull from sources | source adapters (mock) |
| Verify sources | health + reliability | — |
| Renew events | roll recurrence forward | `engine/occurrences.ts` ✅ |
| Detect cancellations | diff vs last snapshot | `engine/changeDetection.ts` ✅ |
| Recalculate scores | refresh composites | `engine/scoring.ts` ✅ |
| Generate projections | 4-year horizon | `engine/occurrences.ts` ✅ |
| Update metrics | company rollups | — |
| Send alerts | notify affected companies | `isAlertable` ✅ |
| Archive | lifecycle | — |
| Reconcile integrations | sync state | — |

## Job surface

Each job exposes status, progress, start/end, errors, retries, next run, logs, and a safe cancel. Modeled in
`sync_jobs` (DB) and shown at `/jobs` (dev seed). Real scheduling/queue + external calls are **not** wired
(no authorized services). Dead-letter/retry are part of the design.

## Status

The deterministic cores for detection/scoring/occurrences are built + tested. Scheduling, queues, and
external connectors are Brian-gated (credentials + infra).
