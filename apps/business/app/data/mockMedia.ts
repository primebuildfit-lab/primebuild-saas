import { DEMO_STORE_ID } from "./mockStore";

/**
 * Media library mock (Business UI reorg). Media is more than images: it carries
 * location, type, licensing, and versioning so assets are safe to reuse across
 * campaigns. Typed mock under app/data per SOP §7.
 */
export type MediaType = "image" | "video" | "document" | "link" | "map";
export type MediaLicense = "owned" | "royalty_free" | "licensed" | "unknown";

export interface MediaAsset {
  id: string;
  storeId: string;
  name: string;
  type: MediaType;
  /** logical folder / location */
  location: string;
  license: MediaLicense;
  version: number;
  sizeLabel: string;
  updatedAt: string; // ISO
  url?: string;
}

export const mediaAssets: MediaAsset[] = [
  {
    id: "med_bf_hero",
    storeId: DEMO_STORE_ID,
    name: "black-friday-hero.png",
    type: "image",
    location: "Campaigns / Black Friday",
    license: "owned",
    version: 3,
    sizeLabel: "1.4 MB",
    updatedAt: "2026-07-10T10:00:00Z",
  },
  {
    id: "med_summer_reel",
    storeId: DEMO_STORE_ID,
    name: "summer-sale-reel.mp4",
    type: "video",
    location: "Campaigns / Summer",
    license: "owned",
    version: 1,
    sizeLabel: "22 MB",
    updatedAt: "2026-06-25T09:00:00Z",
  },
  {
    id: "med_stock_pack",
    storeId: DEMO_STORE_ID,
    name: "summer-lifestyle-pack",
    type: "image",
    location: "Library / Stock",
    license: "royalty_free",
    version: 1,
    sizeLabel: "18 files",
    updatedAt: "2026-05-15T12:00:00Z",
  },
  {
    id: "med_brand_guide",
    storeId: DEMO_STORE_ID,
    name: "brand-guide.pdf",
    type: "document",
    location: "Library / Brand",
    license: "owned",
    version: 2,
    sizeLabel: "640 KB",
    updatedAt: "2026-04-02T12:00:00Z",
  },
  {
    id: "med_supplier_link",
    storeId: DEMO_STORE_ID,
    name: "Supplier lookbook (external)",
    type: "link",
    location: "Library / References",
    license: "licensed",
    version: 1,
    sizeLabel: "—",
    updatedAt: "2026-03-19T12:00:00Z",
    url: "https://example.com/lookbook",
  },
  {
    id: "med_store_map",
    storeId: DEMO_STORE_ID,
    name: "Pop-up locations map",
    type: "map",
    location: "Campaigns / Events",
    license: "owned",
    version: 1,
    sizeLabel: "—",
    updatedAt: "2026-06-01T12:00:00Z",
  },
];
