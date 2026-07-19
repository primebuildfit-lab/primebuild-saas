/**
 * @eventra/config · appLinks — SINGLE SOURCE OF TRUTH for cross-product navigation
 * between the Eventra applications (orden §7/§10: no rutas repetidas y hardcodeadas).
 *
 * The four official Eventra applications:
 *   • Eventra Internal OS   — apps/admin           — Tauri  — com.eventra.internal
 *   • Eventra Business Admin— apps/business-admin   — Tauri  — com.eventra.business.admin
 *   • Eventra Mobile        — apps/consumer         — Tauri  — com.eventra.mobile
 *   • Eventra Business Client— apps/business-client  — WEB    — real deployed URL
 *
 * DESIGN CONTRACT
 *   • Tauri apps are opened by their REGISTERED URI SCHEME (deep link) — never by a
 *     hardcoded filesystem path, never through an arbitrary shell. The scheme is
 *     resolved by Windows/Tauri to the installed app; if not installed, launch fails
 *     cleanly and the caller shows a controlled error.
 *   • The web app is opened by a real, CONFIGURED URL (env var) with a fallback to the
 *     real Railway deployment — no invented URLs. Only HTTPS + allow-listed hosts.
 *   • Everything an untrusted caller can pass (identifier, scheme, deep-link route, web
 *     URL) is validated by the PURE validators below against explicit ALLOWLISTS. This
 *     module has NO I/O — env is read through an injected reader so it stays unit-testable.
 */

// ─────────────────────────────── Types ───────────────────────────────

/** The four official apps, keyed for cross-app references. */
export type EventraAppKey = "internalOs" | "businessAdmin" | "mobile" | "businessClient";

export interface EventraTauriApp {
  key: Exclude<EventraAppKey, "businessClient">;
  kind: "tauri-app";
  /** Bundle identifier (must match each app's tauri.conf.json). */
  identifier: string;
  /** Registered custom URI scheme used to launch the installed app (no `://`). */
  scheme: string;
  /** Human product name (matches productName in tauri.conf.json). */
  productName: string;
  /** apps/* workspace folder (documentation / installer hints). */
  workspace: string;
  /** Deep-link routes this app publicly accepts (validated allowlist prefixes). */
  routes: string[];
}

export interface EventraWebApp {
  key: "businessClient";
  kind: "web";
  productName: string;
  workspace: string;
  /** Ordered env var names to resolve the real URL (first non-empty wins). */
  urlEnvKeys: string[];
  /** Real deployed URL used only when no env override exists — NEVER invented. */
  fallbackUrl: string;
}

export type EventraAppLink = EventraTauriApp | EventraWebApp;

// ─────────────────────────── The registry ───────────────────────────

export const EVENTRA_APP_LINKS: {
  internalOs: EventraTauriApp;
  businessAdmin: EventraTauriApp;
  mobile: EventraTauriApp;
  businessClient: EventraWebApp;
} = {
  internalOs: {
    key: "internalOs", kind: "tauri-app",
    identifier: "com.eventra.internal", scheme: "eventra-internal",
    productName: "Eventra Internal OS", workspace: "apps/admin",
    routes: ["home", "dashboard", "apps", "companies", "health", "integrations"],
  },
  businessAdmin: {
    key: "businessAdmin", kind: "tauri-app",
    identifier: "com.eventra.business.admin", scheme: "eventra-business-admin",
    productName: "Eventra Business Admin", workspace: "apps/business-admin",
    routes: ["dashboard", "companies", "stores", "orders", "marketing", "support", "health"],
  },
  mobile: {
    key: "mobile", kind: "tauri-app",
    identifier: "com.eventra.mobile", scheme: "eventra-mobile",
    productName: "Eventra Mobile", workspace: "apps/consumer",
    routes: ["events", "profile", "calendar", "auth"],
  },
  businessClient: {
    key: "businessClient", kind: "web",
    productName: "Eventra Business Client", workspace: "apps/business-client",
    // Real deployed app (Railway, live). An env override always wins. The ROOT entry
    // (not /app, which is the embedded Shopify admin surface).
    urlEnvKeys: ["VITE_BUSINESS_URL", "VITE_APP_EVENTRA_BUSINESS_PRODUCTION_WEB"],
    fallbackUrl: "https://eventrabusiness-production.up.railway.app",
  },
};

/** All Tauri apps as an array (for iteration). */
export const EVENTRA_TAURI_APPS: EventraTauriApp[] = [
  EVENTRA_APP_LINKS.internalOs,
  EVENTRA_APP_LINKS.businessAdmin,
  EVENTRA_APP_LINKS.mobile,
];

// ─────────────────────────── Allowlists ───────────────────────────

/** The ONLY bundle identifiers a launcher may ever open. */
export const ALLOWED_APP_IDENTIFIERS: readonly string[] = EVENTRA_TAURI_APPS.map((a) => a.identifier);

/** The ONLY URI schemes a launcher may ever open. */
export const ALLOWED_APP_SCHEMES: readonly string[] = EVENTRA_TAURI_APPS.map((a) => a.scheme);

/**
 * Hosts allowed for web navigation from any Eventra app. HTTPS-only. Anything else is
 * rejected (orden: validar dominio y protocolo). The Railway host is the real current
 * Business Client deployment; eventra.app/eventra.com are the official brand domains.
 */
export const ALLOWED_WEB_HOSTS: readonly string[] = [
  "eventrabusiness-production.up.railway.app",
  "eventra.app",
  "eventra.com",
];

/** Suffixes allowed (covers subdomains of the official brand domains, e.g. help.eventra.app). */
export const ALLOWED_WEB_HOST_SUFFIXES: readonly string[] = [
  ".eventra.app",
  ".eventra.com",
];

// ─────────────────────────── Pure validators ───────────────────────────

/** True iff `id` is one of the three permitted Eventra Tauri bundle identifiers. */
export function isAllowedAppIdentifier(id: string): boolean {
  return ALLOWED_APP_IDENTIFIERS.includes(id);
}

/** True iff `scheme` (no `://`) is one of the three permitted Eventra URI schemes. */
export function isAllowedAppScheme(scheme: string): boolean {
  return ALLOWED_APP_SCHEMES.includes(scheme);
}

/** Look up a Tauri app by identifier (or null). */
export function tauriAppByIdentifier(id: string): EventraTauriApp | null {
  return EVENTRA_TAURI_APPS.find((a) => a.identifier === id) ?? null;
}

/**
 * A deep-link route is a slash-separated path of lowercase-alphanumeric+dash segments.
 * NO leading/trailing slash, NO scheme, NO `..`, NO query/hash/backslash/whitespace, NO
 * colons. This is what may follow `scheme://`. Empty string is allowed (opens the app root).
 */
const ROUTE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

export function isValidDeepLinkRoute(route: string): boolean {
  if (route === "") return true;
  if (route.length > 128) return false;
  if (route.includes("..")) return false;
  return ROUTE_RE.test(route);
}

/**
 * Build a validated deep link `scheme://route`. Returns null (never throws) when the
 * scheme is not allow-listed or the route is invalid — the caller shows a controlled error.
 */
export function buildDeepLink(scheme: string, route = ""): string | null {
  if (!isAllowedAppScheme(scheme)) return null;
  if (!isValidDeepLinkRoute(route)) return null;
  return route ? `${scheme}://${route}` : `${scheme}://`;
}

/** Build a validated deep link from an app key + route. Null when invalid. */
export function deepLinkFor(key: EventraTauriApp["key"], route = ""): string | null {
  const app = EVENTRA_APP_LINKS[key];
  return buildDeepLink(app.scheme, route);
}

/**
 * Validate a WEB target: only `https:` and only allow-listed hosts (exact or a permitted
 * suffix). Rejects http, other schemes, credentials in the URL, and unknown domains.
 * Returns the normalized URL string, or null when rejected.
 */
export function validateWebTarget(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase();
  const ok =
    ALLOWED_WEB_HOSTS.includes(host) ||
    ALLOWED_WEB_HOST_SUFFIXES.some((s) => host.endsWith(s));
  return ok ? u.toString() : null;
}

/**
 * Resolve the real Business Client web URL from configuration. `readEnv` is injected
 * (pure): first configured env key wins, else the real deployed fallback. The result is
 * always re-validated against the web allowlist, so a misconfigured env can never point
 * the app at an untrusted host.
 */
export function resolveBusinessClientUrl(readEnv: (k: string) => string | undefined): string | null {
  const app = EVENTRA_APP_LINKS.businessClient;
  for (const key of app.urlEnvKeys) {
    const v = (readEnv(key) ?? "").trim();
    if (v) {
      const validated = validateWebTarget(v);
      if (validated) return validated;
      // a configured-but-invalid URL is treated as "no configurada" (blocked), never opened.
      return null;
    }
  }
  return validateWebTarget(app.fallbackUrl);
}
