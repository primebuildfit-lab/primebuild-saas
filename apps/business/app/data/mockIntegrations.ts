import { DEMO_STORE_ID } from "./mockStore";

/**
 * Integrations mock (Business UI reorg). Integrations are a managed catalog, not a
 * static list — each carries connection state, version, usage, and error/health.
 * Typed mock under app/data per SOP §7. No integration executes anything in V1.
 */
export type IntegrationCategory =
  | "commerce"
  | "email"
  | "ads"
  | "analytics"
  | "social"
  | "storage";
export type IntegrationStatus = "connected" | "available" | "error" | "action_required";

export interface Integration {
  id: string;
  storeId: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  version: string;
  lastSync?: string; // ISO
  /** monthly calls / events in the current period */
  usage: number;
  errors: number;
}

export const integrations: Integration[] = [
  {
    id: "int_shopify",
    storeId: DEMO_STORE_ID,
    name: "Shopify",
    category: "commerce",
    status: "connected",
    version: "2025-07",
    lastSync: "2026-07-13T05:55:00Z",
    usage: 1840,
    errors: 0,
  },
  {
    id: "int_klaviyo",
    storeId: DEMO_STORE_ID,
    name: "Klaviyo",
    category: "email",
    status: "connected",
    version: "v3",
    lastSync: "2026-07-13T04:10:00Z",
    usage: 620,
    errors: 0,
  },
  {
    id: "int_meta_ads",
    storeId: DEMO_STORE_ID,
    name: "Meta Ads",
    category: "ads",
    status: "action_required",
    version: "v19.0",
    lastSync: "2026-07-05T04:10:00Z",
    usage: 210,
    errors: 1,
  },
  {
    id: "int_ga4",
    storeId: DEMO_STORE_ID,
    name: "Google Analytics 4",
    category: "analytics",
    status: "connected",
    version: "GA4",
    lastSync: "2026-07-13T03:00:00Z",
    usage: 5400,
    errors: 0,
  },
  {
    id: "int_tiktok",
    storeId: DEMO_STORE_ID,
    name: "TikTok",
    category: "social",
    status: "available",
    version: "v2",
    usage: 0,
    errors: 0,
  },
  {
    id: "int_drive",
    storeId: DEMO_STORE_ID,
    name: "Google Drive",
    category: "storage",
    status: "error",
    version: "v3",
    lastSync: "2026-07-02T03:00:00Z",
    usage: 88,
    errors: 3,
  },
];
