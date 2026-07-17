import type { CustomEvent } from "~/types/domain";
import { DEMO_STORE_ID } from "./mockStore";

/**
 * Merchant-created custom events (private to the store). Unlike global events,
 * these may be edited and deleted normally by the merchant.
 */
export const customEvents: CustomEvent[] = [
  {
    id: "cev_anniversary",
    storeId: DEMO_STORE_ID,
    name: "Store Anniversary Sale",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    category: "seasonal",
    description: "Celebrate the store's founding with a weekend promotion.",
    recurring: true,
  },
  {
    id: "cev_warehouse",
    storeId: DEMO_STORE_ID,
    name: "Warehouse Clear-out",
    startDate: "2026-08-22",
    category: "seasonal",
    description: "One-day inventory clearance.",
    recurring: false,
  },
];
