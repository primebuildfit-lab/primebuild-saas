/**
 * @eventra/api — shared backend API contracts (FOUNDATION ONLY).
 * Typed interfaces for the platform API domains. There is NO server, NO route
 * implementation, and NO external call here — these are the contracts future
 * loaders/actions/RPC handlers will implement (owned per domain).
 */
import type { Principal } from "@eventra/types";

/** Every API handler receives a server-resolved principal (never client-trusted ids). */
export interface ApiContext {
  principal: Principal;
  requestId: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/** API domains + their ownership (implemented in later Mega Modules). */
export const API_DOMAINS = [
  "identity",
  "entitlements",
  "calendar", // catalog (countries/categories/global events)
  "consumer", // follows, prefs, saved deals
  "business", // workspaces, campaigns, memory, templates
  "deals", // verified-deal pipeline
  "advertising",
  "billing",
  "notifications",
  "admin",
] as const;
export type ApiDomain = (typeof API_DOMAINS)[number];

/** Marker interface each domain's contract module extends. */
export interface DomainContract {
  readonly domain: ApiDomain;
}
