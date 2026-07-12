import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { resolveScopeAndRepo } from "~/db/scope.server";
import { dispatchDataAction, type DataIntent } from "~/db/dataActions";
import { RepositoryError } from "~/db/repository";
import { previewEnabled } from "~/db/env.server";

/**
 * Resource route (MM4, Part 5) — the server-side persistence surface for the
 * Business app. No UI. Reads/writes go through the mode-selected repository with a
 * server-resolved tenant scope (RLS is a second gate). Wired to the client data
 * context in `persistence` mode; mock mode keeps the pure-client path (default).
 *
 *  GET  /app/data      → { catalog, bundle } for the resolved tenant
 *  POST /app/data      → body: DataIntent (JSON) → dispatched write, returns result
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { scope, repo } = await resolveScopeAndRepo(request, { preview: previewEnabled() });
  const [catalog, bundle] = await Promise.all([
    repo.loadCatalog(),
    repo.loadBundle(scope),
  ]);
  return { catalog, bundle };
}

export async function action({ request }: ActionFunctionArgs) {
  const { scope, repo } = await resolveScopeAndRepo(request, { preview: previewEnabled() });
  let intent: DataIntent;
  try {
    intent = (await request.json()) as DataIntent;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const result = await dispatchDataAction(repo, scope, intent);
    return Response.json({ ok: true, result });
  } catch (err) {
    if (err instanceof RepositoryError) {
      const status = err.code === "not_found" ? 404 : err.code === "forbidden" ? 403 : 422;
      return Response.json({ ok: false, error: err.message, code: err.code }, { status });
    }
    throw err;
  }
}
