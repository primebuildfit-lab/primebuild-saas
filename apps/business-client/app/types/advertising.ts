import type { CountryCode, StoreId } from "./domain";

/**
 * VIP domain — the real marketing entities (2026-07-14).
 *
 * Terminology (do not confuse):
 *  - Offer         = the commercial benefit (%, price, bundle, gift, shipping…).
 *  - Advertisement = one concrete piece shown to shoppers (banner, popup, Liquid
 *                    section, email, notice…). Belongs to a campaign, optionally.
 *  - Campaign      = a container that groups advertisements (lives in domain.ts).
 *
 * These are first-class entities, NOT fields inside Campaign.
 */

// ─────────────────────────────── Offers ───────────────────────────────
export type OfferType =
  | "percentage"
  | "fixed_price"
  | "amount_off"
  | "bundle"
  | "free_gift"
  | "free_shipping"
  | "condition";

export type OfferStatus = "draft" | "active" | "expired" | "archived";

export interface Offer {
  id: string;
  storeId: StoreId;
  name: string;
  type: OfferType;
  /** numeric value where it applies (percent, price, amount) */
  value?: number;
  /** discount code shoppers enter — merchant types it or generates one */
  code?: string;
  /** free-text condition (e.g. "orders over $50") */
  condition?: string;
  productRefs: string[];
  country?: CountryCode;
  startDate?: string; // ISO
  endDate?: string; // ISO
  /** legal / terms text */
  legal?: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────── Advertisements ───────────────────────────
export type AdvertisementStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "finished"
  | "failed"
  | "archived";

/** Where the advertisement is shown. */
export type AdvertisementPlacement =
  | "banner"
  | "liquid_section"
  | "popup"
  | "notice"
  | "email"
  | "product_block"
  | "page_element"
  | "post";

export interface Advertisement {
  id: string;
  storeId: StoreId;
  name: string;
  /** the global event this advertisement is built around */
  eventId?: string;
  offerId?: string;
  templateId?: string;
  /** the campaign it's grouped in, if any */
  campaignId?: string;
  country?: CountryCode;
  placement: AdvertisementPlacement;
  title?: string;
  subtitle?: string;
  description?: string;
  cta?: string;
  liquid?: string;
  /** private team notes (was "strategy/description") */
  notes?: string;
  productRefs: string[];
  prepStart?: string; // ISO
  startDate: string; // ISO
  endDate: string; // ISO
  timezone?: string;
  status: AdvertisementStatus;
  /** memory link — reuse creates a new record; never overwrites the source */
  createdFromId?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}
