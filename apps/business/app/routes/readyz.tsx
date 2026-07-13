import type { LoaderFunctionArgs } from "react-router";
import { buildInfo } from "~/lib/version.server";
import { persistenceMode, persistenceEnabled } from "~/db/env.server";
import { logEvent } from "~/lib/observability.server";

/**
 * Readiness probe (Bloque 8/13): `/readyz`. Public, unauthenticated. Reports
 * whether the app can serve real traffic in its selected persistence mode:
 *
 *  - mock/file : always ready (no external dependency).
 *  - supabase  : ready only if all secrets are present AND a trivial catalog read
 *                succeeds against the connected project.
 *
 * Returns 200 when ready, 503 otherwise (so a load balancer can hold traffic).
 */
export const loader = async (_args: LoaderFunctionArgs) => {
  const mode = persistenceMode();
  const base = { ...buildInfo(), mode };

  if (mode !== "supabase") {
    return Response.json(
      { status: "ready", ...base, checks: { persistence: "ok" } },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // supabase mode: verify configuration + a live catalog read.
  const checks: Record<string, string> = {
    secrets: persistenceEnabled() ? "ok" : "missing",
  };
  let ready = persistenceEnabled();

  if (ready) {
    try {
      const { getAdminClient } = await import("~/db/supabase.server");
      const { error } = await getAdminClient().from("plans").select("id").limit(1);
      checks.database = error ? "unreachable" : "ok";
      if (error) ready = false;
    } catch (err) {
      checks.database = "unreachable";
      ready = false;
      logEvent("error", "readyz.db_check_failed", { message: String(err) });
    }
  }

  return Response.json(
    { status: ready ? "ready" : "not_ready", ...base, checks },
    { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
};
