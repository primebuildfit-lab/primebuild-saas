import type { StoreEventPreference } from "~/types/domain";

/**
 * Per-store hide/restore of official global events (D13).
 * Empty by default — nothing hidden for the demo store. Hiding an official date
 * NEVER deletes it globally; it only sets `hidden: true` for that store.
 */
export const storeEventPreferences: StoreEventPreference[] = [];
