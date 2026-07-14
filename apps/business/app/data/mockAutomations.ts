import { DEMO_STORE_ID } from "./mockStore";

/**
 * Automations + Jobs mock (Business UI reorg). Automations are scheduled operations
 * (syncs, discovery searches, alerts); Jobs are their concrete runs. Visual-only in
 * V1 — nothing executes against a store (CLAUDE.md §2). Typed mock under app/data.
 */
export type AutomationKind = "sync" | "search" | "alert" | "report";
export type AutomationStatus = "active" | "paused" | "error";

export interface Automation {
  id: string;
  storeId: string;
  name: string;
  kind: AutomationKind;
  status: AutomationStatus;
  schedule: string; // human-readable cadence
  lastRun: string; // ISO
  nextRun?: string; // ISO
}

export const automations: Automation[] = [
  {
    id: "auto_daily_discovery",
    storeId: DEMO_STORE_ID,
    name: "Daily opportunity discovery",
    kind: "search",
    status: "active",
    schedule: "Every day at 06:00",
    lastRun: "2026-07-13T06:00:00Z",
    nextRun: "2026-07-14T06:00:00Z",
  },
  {
    id: "auto_source_sync",
    storeId: DEMO_STORE_ID,
    name: "Source sync",
    kind: "sync",
    status: "active",
    schedule: "Hourly",
    lastRun: "2026-07-13T06:00:00Z",
    nextRun: "2026-07-13T07:00:00Z",
  },
  {
    id: "auto_prep_alert",
    storeId: DEMO_STORE_ID,
    name: "Prep-window alerts",
    kind: "alert",
    status: "active",
    schedule: "When a prep window opens",
    lastRun: "2026-07-12T09:00:00Z",
  },
  {
    id: "auto_weekly_report",
    storeId: DEMO_STORE_ID,
    name: "Weekly planning digest",
    kind: "report",
    status: "paused",
    schedule: "Mondays at 08:00",
    lastRun: "2026-07-06T08:00:00Z",
  },
];

export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export interface Job {
  id: string;
  storeId: string;
  automationId: string;
  label: string;
  status: JobStatus;
  startedAt: string; // ISO
  durationMs?: number;
  /** rows/items processed */
  processed?: number;
}

export const jobs: Job[] = [
  {
    id: "job_1",
    storeId: DEMO_STORE_ID,
    automationId: "auto_daily_discovery",
    label: "Opportunity discovery — 2026-07-13",
    status: "succeeded",
    startedAt: "2026-07-13T06:00:00Z",
    durationMs: 4200,
    processed: 11,
  },
  {
    id: "job_2",
    storeId: DEMO_STORE_ID,
    automationId: "auto_source_sync",
    label: "Source sync — Cultural Trends Feed",
    status: "running",
    startedAt: "2026-07-13T06:30:00Z",
    processed: 3,
  },
  {
    id: "job_3",
    storeId: DEMO_STORE_ID,
    automationId: "auto_source_sync",
    label: "Source sync — Apparel Industry Bulletin",
    status: "failed",
    startedAt: "2026-07-13T05:00:00Z",
    durationMs: 1200,
  },
  {
    id: "job_4",
    storeId: DEMO_STORE_ID,
    automationId: "auto_prep_alert",
    label: "Prep alert — Back to School",
    status: "succeeded",
    startedAt: "2026-07-12T09:00:00Z",
    durationMs: 300,
    processed: 1,
  },
  {
    id: "job_5",
    storeId: DEMO_STORE_ID,
    automationId: "auto_weekly_report",
    label: "Weekly digest — 2026-07-06",
    status: "queued",
    startedAt: "2026-07-14T08:00:00Z",
  },
];
