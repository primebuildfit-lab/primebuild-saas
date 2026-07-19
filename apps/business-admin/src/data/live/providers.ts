/**
 * Business Admin live-data providers.
 *
 * Each provider fetches REAL data about the commercial Business Client from the
 * central API (`services/api`) over HTTPS, using the platform database as the
 * single source of truth — the same backend the Business Client writes to, read
 * here with platform (operator) permissions.
 *
 * The central API + platform read-path + operator auth are NOT wired yet, so every
 * provider returns `not_connected`. This is the CORRECT behaviour (owner's hard
 * rule: never fabricate). When the backend exists, each `resolve*` body swaps the
 * stub for a real fetch + mapper; the screens do not change.
 */
import type {
  LoadState, AdminOverview, AdminCompany, AdminStore, AdminMember,
  AdminOrder, OrderState, AdminMarketingItem, AdminSubscription,
  AdminIntegration, AdminAlert, AdminAuditEvent,
} from "./types";

/**
 * Whether a runtime connection to the central API is configured. Reads a Vite env
 * var so a real deployment can flip it on without code changes. Absent ⇒ false ⇒
 * every screen renders "No conectado" honestly.
 */
export function centralApiConfigured(): boolean {
  const base = (import.meta.env?.VITE_BUSINESS_API_URL as string | undefined) ?? "";
  return base.trim().length > 0;
}

const NOT_CONNECTED_REASON =
  "El panel aún no está conectado a la API central de Eventra. Los datos reales aparecerán cuando el backend de plataforma y la sesión de operador estén disponibles.";

function notConnected<T>(): LoadState<T> {
  return { kind: "not_connected", reason: NOT_CONNECTED_REASON };
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export async function resolveOverview(): Promise<LoadState<AdminOverview>> {
  return notConnected();
}

// ── Companies / Stores / Members ─────────────────────────────────────────────
export async function resolveCompanies(): Promise<LoadState<AdminCompany[]>> {
  return notConnected();
}
export async function resolveStores(): Promise<LoadState<AdminStore[]>> {
  return notConnected();
}
export async function resolveMembers(): Promise<LoadState<AdminMember[]>> {
  return notConnected();
}

// ── Orders (by state) ────────────────────────────────────────────────────────
export async function resolveOrders(_state: OrderState): Promise<LoadState<AdminOrder[]>> {
  return notConnected();
}

// ── Sales ────────────────────────────────────────────────────────────────────
export async function resolveSales(): Promise<LoadState<{ periodTotal: number | null }>> {
  return notConnected();
}

// ── Marketing (monitored) ────────────────────────────────────────────────────
export async function resolveMarketing(
  _kind: AdminMarketingItem["kind"],
): Promise<LoadState<AdminMarketingItem[]>> {
  return notConnected();
}

// ── Plans & subscriptions ────────────────────────────────────────────────────
export async function resolveSubscriptions(): Promise<LoadState<AdminSubscription[]>> {
  return notConnected();
}

// ── Integrations / Alerts / Audit ────────────────────────────────────────────
export async function resolveIntegrations(): Promise<LoadState<AdminIntegration[]>> {
  return notConnected();
}
export async function resolveAlerts(): Promise<LoadState<AdminAlert[]>> {
  return notConnected();
}
export async function resolveAudit(): Promise<LoadState<AdminAuditEvent[]>> {
  return notConnected();
}
