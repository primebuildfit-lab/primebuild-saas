import type { Template } from "~/types/domain";
import { DEMO_STORE_ID } from "./mockStore";

/** Reusable campaign structures. V1 = basic duplication (roadmap §13). */
export const templates: Template[] = [
  {
    id: "tpl_holiday_sale",
    storeId: DEMO_STORE_ID,
    name: "Holiday Sale",
    category: "major_sales",
    defaultDurationDays: 7,
    defaultLeadDays: 30,
    offer: "20% off",
    notes: "Sitewide holiday discount with gift-guide landing page.",
  },
  {
    id: "tpl_flash_sale",
    storeId: DEMO_STORE_ID,
    name: "48h Flash Sale",
    category: "major_sales",
    defaultDurationDays: 2,
    defaultLeadDays: 7,
    offer: "25% off select items",
    notes: "Short high-urgency promotion.",
  },
];
