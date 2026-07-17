import type { BusinessRepository } from "./repository";
import { getBusinessRepository } from "./repository.server";
import { persistenceMode } from "./env.server";
import { DEMO_TENANT_SCOPE } from "./mockScope";
import type { TenantScope } from "~/types/domain";

/**
 * Resolve the active tenant scope + repository for the current request (MM4).
 *
 * - `supabase` mode: the tenant is resolved (and provisioned on first install)
 *   from the **Shopify-verified** session, and the repository is bound to the
 *   RLS-scoped user client. Never trusts a client-supplied id (D23).
 * - `mock`/`file` modes: the fixed demo scope + the process-singleton repository.
 *
 * `tenant.server` (which imports Shopify) is loaded lazily so mock/file mode has
 * no Shopify dependency.
 */
export async function resolveScopeAndRepo(
  request: Request,
  opts: { preview?: boolean } = {},
): Promise<{ scope: TenantScope; repo: BusinessRepository }> {
  // Preview never uses supabase (enforced by previewEnabled) and never authenticates.
  if (persistenceMode() === "supabase" && !opts.preview) {
    const { resolveTenant, clientForTenant } = await import("./tenant.server");
    const scope = await resolveTenant(request);
    const client = await clientForTenant(scope);
    return { scope, repo: getBusinessRepository(client) };
  }
  return { scope: DEMO_TENANT_SCOPE, repo: getBusinessRepository() };
}
