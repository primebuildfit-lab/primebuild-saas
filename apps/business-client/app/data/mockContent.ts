import { DEMO_STORE_ID } from "./mockStore";

/**
 * Content library mock (Business UI reorg). The content manager separates material
 * by origin — own, downloaded, AI-generated, reused, and resources — so a merchant
 * always knows provenance and licensing. Typed mock under app/data per SOP §7.
 */
export type ContentKind = "own" | "downloaded" | "ai" | "reused" | "resource";
export type ContentFormat = "copy" | "image" | "video" | "email" | "banner" | "doc";
export type ContentStatus = "draft" | "ready" | "published" | "archived";

export interface ContentItem {
  id: string;
  storeId: string;
  title: string;
  kind: ContentKind;
  format: ContentFormat;
  status: ContentStatus;
  /** linked campaign id, when the content was made for one */
  campaignId?: string;
  updatedAt: string; // ISO
  owner: string;
}

export const contentItems: ContentItem[] = [
  {
    id: "cnt_bf_hero",
    storeId: DEMO_STORE_ID,
    title: "Black Friday hero banner",
    kind: "own",
    format: "banner",
    status: "ready",
    campaignId: "cmp_blackfriday_2026",
    updatedAt: "2026-07-10T10:00:00Z",
    owner: "Demo Store",
  },
  {
    id: "cnt_bf_email",
    storeId: DEMO_STORE_ID,
    title: "Black Friday launch email",
    kind: "ai",
    format: "email",
    status: "draft",
    campaignId: "cmp_blackfriday_2026",
    updatedAt: "2026-07-11T14:30:00Z",
    owner: "Eventra AI",
  },
  {
    id: "cnt_summer_copy",
    storeId: DEMO_STORE_ID,
    title: "Summer sale product copy",
    kind: "own",
    format: "copy",
    status: "published",
    campaignId: "cmp_summer_2026",
    updatedAt: "2026-06-28T09:00:00Z",
    owner: "Demo Store",
  },
  {
    id: "cnt_canada_reuse",
    storeId: DEMO_STORE_ID,
    title: "Canada Day promo (reused from 2025)",
    kind: "reused",
    format: "banner",
    status: "published",
    campaignId: "cmp_canadaday_2026",
    updatedAt: "2026-06-20T08:00:00Z",
    owner: "Demo Store",
  },
  {
    id: "cnt_stock_summer",
    storeId: DEMO_STORE_ID,
    title: "Summer lifestyle photo pack",
    kind: "downloaded",
    format: "image",
    status: "ready",
    updatedAt: "2026-05-15T12:00:00Z",
    owner: "Unsplash",
  },
  {
    id: "cnt_brand_guide",
    storeId: DEMO_STORE_ID,
    title: "Brand voice & tone guide",
    kind: "resource",
    format: "doc",
    status: "ready",
    updatedAt: "2026-04-02T12:00:00Z",
    owner: "Demo Store",
  },
  {
    id: "cnt_halloween_ai",
    storeId: DEMO_STORE_ID,
    title: "Halloween social captions",
    kind: "ai",
    format: "copy",
    status: "draft",
    updatedAt: "2026-07-12T16:00:00Z",
    owner: "Eventra AI",
  },
];
