import { createHash } from "node:crypto";

/**
 * Deterministic RFC-4122 v5 UUIDs so the same Shopify shop always maps to the
 * same owner-user id across logins/devices (the store id itself is the DB PK,
 * looked up by shop_domain). Used only server-side.
 */

// Fixed Eventra namespace (a random, stable v4 UUID — not secret).
const EVENTRA_NS = "6f1a7b90-6c3e-4f5a-9b2d-1e7c9a4d0f21";

function parseUuid(uuid: string): Buffer {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
}

function formatUuid(bytes: Buffer): string {
  const h = bytes.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export function uuidv5(name: string, namespace = EVENTRA_NS): string {
  const hash = createHash("sha1")
    .update(Buffer.concat([parseUuid(namespace), Buffer.from(name, "utf8")]))
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC-4122 variant
  return formatUuid(bytes);
}

/** Stable owner-user id for a shop (one owner per store in the pilot). */
export function ownerUserId(shopDomain: string): string {
  return uuidv5(`owner:${shopDomain.toLowerCase()}`);
}

/** Stable organization id for a shop (one org per shop in V1 — A3). */
export function orgIdForShop(shopDomain: string): string {
  return uuidv5(`org:${shopDomain.toLowerCase()}`);
}

/** Stable workspace id for a shop's default workspace. */
export function workspaceIdForShop(shopDomain: string): string {
  return uuidv5(`workspace:${shopDomain.toLowerCase()}`);
}
