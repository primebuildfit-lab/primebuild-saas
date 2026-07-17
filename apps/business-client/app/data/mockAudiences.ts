import { DEMO_STORE_ID } from "./mockStore";

/**
 * Audiences mock (Business UI reorg). The Audiences module compares audience types
 * — business vs. personal buyers and named segments — across reach, conversion,
 * and content fit, so planning targets the right people. Typed mock, app/data.
 */
export type AudienceType = "business" | "personal";

export interface Audience {
  id: string;
  storeId: string;
  name: string;
  type: AudienceType;
  /** reachable size */
  size: number;
  /** conversion rate, percent */
  conversion: number;
  /** number of content pieces tuned for this audience */
  contentPieces: number;
  /** top market */
  topCountry: string;
}

export const audiences: Audience[] = [
  {
    id: "aud_retail_buyers",
    storeId: DEMO_STORE_ID,
    name: "Wholesale buyers",
    type: "business",
    size: 1200,
    conversion: 4.8,
    contentPieces: 6,
    topCountry: "US",
  },
  {
    id: "aud_boutiques",
    storeId: DEMO_STORE_ID,
    name: "Boutique partners",
    type: "business",
    size: 340,
    conversion: 6.1,
    contentPieces: 3,
    topCountry: "CA",
  },
  {
    id: "aud_loyal",
    storeId: DEMO_STORE_ID,
    name: "Loyal shoppers",
    type: "personal",
    size: 8600,
    conversion: 3.2,
    contentPieces: 9,
    topCountry: "US",
  },
  {
    id: "aud_new",
    storeId: DEMO_STORE_ID,
    name: "New visitors",
    type: "personal",
    size: 24500,
    conversion: 1.1,
    contentPieces: 5,
    topCountry: "US",
  },
  {
    id: "aud_gifters",
    storeId: DEMO_STORE_ID,
    name: "Holiday gifters",
    type: "personal",
    size: 5100,
    conversion: 2.7,
    contentPieces: 4,
    topCountry: "CA",
  },
];
