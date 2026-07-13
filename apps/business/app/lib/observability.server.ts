/**
 * Minimal, dependency-free observability helpers (Bloque 13). Server-only.
 *
 * A request id + structured JSON log line, honoring LOG_LEVEL, with NO secrets or
 * tokens ever logged. Deliberately tiny — a real APM/Sentry integration is a later,
 * opt-in step gated by OBSERVABILITY_DSN (see .env.example).
 */
import { randomUUID } from "node:crypto";

const LEVELS = ["error", "warn", "info", "debug"] as const;
export type LogLevel = (typeof LEVELS)[number];

function threshold(): number {
  const configured = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  const idx = LEVELS.indexOf(configured);
  return idx === -1 ? LEVELS.indexOf("info") : idx;
}

/** Stable id for correlating a single request across log lines. */
export function requestId(request?: Request): string {
  const header = request?.headers.get("x-request-id");
  return header && header.length <= 200 ? header : randomUUID();
}

/**
 * Structured log line. `fields` must contain NO secrets/tokens/PII — callers pass
 * ids and status, never access tokens or full customer records.
 */
export function logEvent(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  if (LEVELS.indexOf(level) > threshold()) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
