# Eventra AI Engine (`AI_ENGINE.md`)

> Phase 7, Bloque 28. Safe, configurable, auditable — and **off** until authorized.

## Principles

- The Internal OS never calls a paid model directly — only through the **`AIProvider` port**
  (`apps/admin/src/engine/ai/port.ts`).
- A **deterministic fake** (`ai/fake.ts`) implements the port for dev/tests: same input → same output, cost
  always 0, no credentials.
- **Human review is mandatory below confidence 0.7** (`HUMAN_REVIEW_THRESHOLD`). `mayAutoApply()` returns
  false for low-confidence results — **nothing low-confidence auto-publishes** (offers or content).
- Every result is **structured + typed** and carries `confidence`, `model`, `costUsd`, `promptVersion` — so
  every AI decision is auditable (`ai_reviews` table).

## Tasks

`classify` · `deduplicate` · `score_suggest` · `summarize` · `translate` · `detect_change` ·
`content_suggest`. AI suggests; humans decide. Scoring stays a transparent formula (AI only proposes factors).

## Adding a real provider (later, Brian-gated)

1. Implement `AIProvider` for the chosen model behind AI credentials (`OBSERVABILITY_DSN`/AI keys — prepared
   in `.env.example`, not read yet).
2. Keep the same port + review threshold + audit writes.
3. Configure per-task model, cost ceilings, prompt versions, and a fallback to the fake on error.
4. Never enable a paid model without explicit authorization.

## Status

Port + fake + `mayAutoApply` + human-review path: **built & tested** (`apps/admin/test/engine.test.ts`).
Real provider: not implemented (no credentials, no authorization). UI: `/ai` runs the fake live.
