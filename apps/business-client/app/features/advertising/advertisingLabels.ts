import type { BadgeTone } from "~/components/ui";
import type {
  AdvertisementPlacement,
  AdvertisementStatus,
  OfferType,
} from "~/types/advertising";

export const AD_STATUS_LABEL: Record<AdvertisementStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  paused: "Paused",
  finished: "Finished",
  failed: "Failed",
  archived: "Archived",
};

export const AD_STATUS_TONE: Record<AdvertisementStatus, BadgeTone> = {
  draft: "gray",
  scheduled: "brand",
  active: "green",
  paused: "amber",
  finished: "blue",
  failed: "red",
  archived: "gray",
};

/** Order the status filter chips are shown in. */
export const AD_STATUS_ORDER: AdvertisementStatus[] = [
  "draft",
  "scheduled",
  "active",
  "paused",
  "finished",
  "failed",
  "archived",
];

export const PLACEMENT_LABEL: Record<AdvertisementPlacement, string> = {
  banner: "Banner",
  liquid_section: "Liquid section",
  popup: "Popup",
  notice: "Notice",
  email: "Email",
  product_block: "Product block",
  page_element: "Page element",
  post: "Post",
};

export const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  percentage: "% off",
  fixed_price: "Fixed price",
  amount_off: "Amount off",
  bundle: "Bundle",
  free_gift: "Free gift",
  free_shipping: "Free shipping",
  condition: "Condition",
};
