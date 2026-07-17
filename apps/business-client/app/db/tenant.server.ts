import { authenticate } from "~/shopify.server";
import { getAdminClient, getUserClient } from "./supabase.server";
import { ownerUserId, orgIdForShop, workspaceIdForShop } from "./ids.server";
import type { TenantScope } from "~/types/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve — and, on first install, provision — the tenant from the Shopify
 * session, in the ORG/WORKSPACE model (MM4). One Shopify store ⇒ one organization
 * + one workspace (A3). The workspace id is the façade `storeId`.
 *
 * SECURITY: identity is the **Shopify-verified** shop domain, never a client value
 * (D23 / SECURITY_PLAN §2). Provisioning uses the service-role client; per-request
 * reads/writes use a user-scoped client so RLS is a second gate.
 */
export async function resolveTenant(request: Request): Promise<TenantScope & { shopDomain: string }> {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop; // verified by Shopify's session token
  const userId = ownerUserId(shopDomain);
  const organizationId = orgIdForShop(shopDomain);
  const workspaceId = workspaceIdForShop(shopDomain);
  const admin = getAdminClient();

  // Org (one per shop in V1), deterministic id ⇒ idempotent install.
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .upsert(
      { id: organizationId, name: shopDomain, owner_user_id: userId },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("id, name")
    .single();
  if (orgErr || !org) {
    throw new Error(`Org provisioning failed: ${orgErr?.message ?? "no row"}`);
  }

  // Workspace bound to the Shopify commerce connection.
  const { error: wsErr } = await admin
    .from("workspaces")
    .upsert(
      {
        id: workspaceId,
        organization_id: organizationId,
        name: shopDomain,
        commerce_platform: "shopify",
        commerce_external_ref: shopDomain,
      },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("id")
    .single();
  if (wsErr) {
    throw new Error(`Workspace provisioning failed: ${wsErr.message}`);
  }

  // Idempotent defaults for a newly-provisioned tenant.
  await admin
    .from("memberships")
    .upsert(
      { user_id: userId, organization_id: organizationId, role: "owner" },
      { onConflict: "user_id,organization_id", ignoreDuplicates: true },
    );
  await admin
    .from("subscriptions")
    .upsert(
      { organization_id: organizationId, plan_id: "business.free" },
      { onConflict: "organization_id", ignoreDuplicates: true },
    );
  await admin
    .from("workspace_preferences")
    .upsert({ workspace_id: workspaceId }, { onConflict: "workspace_id", ignoreDuplicates: true });
  await admin
    .from("workspace_countries")
    .upsert(
      { workspace_id: workspaceId, country_code: "US", enabled: true },
      { onConflict: "workspace_id,country_code", ignoreDuplicates: true },
    );

  return {
    userId,
    organizationId,
    organizationName: org.name as string,
    workspaceId,
    role: "owner",
    shopDomain,
  };
}

/** RLS-scoped client for the resolved tenant. */
export function clientForTenant(scope: TenantScope): Promise<SupabaseClient> {
  return getUserClient(scope.userId);
}
