import type { LoaderFunctionArgs } from "react-router";
import { buildInfo } from "~/lib/version.server";

/**
 * Liveness probe (Bloque 8/13): `/healthz`. Public, unauthenticated, no external
 * dependencies — proves the process is up and serving. Never touches the DB (that
 * is readiness, see /readyz). Deploy platforms (Railway) point their health check
 * here.
 */
export const loader = async (_args: LoaderFunctionArgs) => {
  return Response.json(
    { status: "ok", ...buildInfo(), uptimeSeconds: Math.round(process.uptime()) },
    { headers: { "cache-control": "no-store" } },
  );
};
