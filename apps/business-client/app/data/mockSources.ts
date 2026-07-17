import { DEMO_STORE_ID } from "./mockStore";

/**
 * Discovery sources mock (Business UI reorg). Sources are the feeds Eventra uses
 * to surface opportunities; each carries state, sync cadence, coverage, and
 * reliability. Typed mock under app/data per SOP §7.
 */
export type SourceType = "official" | "seasonal" | "cultural" | "industry" | "custom";
export type SourceStatus = "connected" | "syncing" | "error" | "paused";
export type SyncFrequency = "hourly" | "daily" | "weekly" | "manual";

export interface Source {
  id: string;
  storeId: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  frequency: SyncFrequency;
  /** ISO 3166 codes this source covers, or ["*"] for global */
  countries: string[];
  reliability: number; // 0–100
  lastSync: string; // ISO
  errors: number;
}

export const sources: Source[] = [
  {
    id: "src_verified",
    storeId: DEMO_STORE_ID,
    name: "Eventra Verified Calendar",
    type: "official",
    status: "connected",
    frequency: "daily",
    countries: ["*"],
    reliability: 99,
    lastSync: "2026-07-13T06:00:00Z",
    errors: 0,
  },
  {
    id: "src_seasonal",
    storeId: DEMO_STORE_ID,
    name: "Seasonal Retail Index",
    type: "seasonal",
    status: "connected",
    frequency: "weekly",
    countries: ["US", "CA"],
    reliability: 90,
    lastSync: "2026-07-08T06:00:00Z",
    errors: 0,
  },
  {
    id: "src_cultural",
    storeId: DEMO_STORE_ID,
    name: "Cultural Trends Feed",
    type: "cultural",
    status: "syncing",
    frequency: "daily",
    countries: ["US", "CA"],
    reliability: 88,
    lastSync: "2026-07-13T05:30:00Z",
    errors: 0,
  },
  {
    id: "src_industry",
    storeId: DEMO_STORE_ID,
    name: "Apparel Industry Bulletin",
    type: "industry",
    status: "error",
    frequency: "weekly",
    countries: ["US"],
    reliability: 74,
    lastSync: "2026-07-01T06:00:00Z",
    errors: 2,
  },
  {
    id: "src_custom",
    storeId: DEMO_STORE_ID,
    name: "Store custom dates",
    type: "custom",
    status: "paused",
    frequency: "manual",
    countries: ["US", "CA"],
    reliability: 100,
    lastSync: "2026-06-15T06:00:00Z",
    errors: 0,
  },
];
