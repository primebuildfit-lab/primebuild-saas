import { authenticate } from "~/shopify.server";
import { getAdminClient, getUserClient } from "./supabase.server";
import { ownerUserId } from "./ids.server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Tenant {
  userId: string;
  storeId: string;
  shopDomain: string;
  storeName: string;
}

/**
 * Resolve — and, on first install, provision — the tenant from the Shopify
 * session. This is the real replacement for the `lib/tenant.ts` stub.
 *
 * SECURITY: the store id is read from the DB keyed by the **Shopify-verified**
 * shop domain, never from any client-supplied value (D23 / SECURITY_PLAN §2).
 * Provisioning uses the service-role client; per-request reads/writes use a
 * user-scoped client so RLS is a second gate.
 */
export async function resolveTenant(request: Request): Promise<Tenant> {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop; // verified by Shopify's session token
  const userId = ownerUserId(shopDomain);
  const admin = getAdminClient();

  const { data: store, error } = await admin
    .from("stores")
    .upsert(
      { shop_domain: shopDomain, name: shopDomain },
      { onConflict: "shop_domain" },
    )
    .select("id, name")
    .single();
  if (error || !store) {
    throw new Error(`Store provisioning failed: ${error?.message ?? "no row"}`);
  }
  const storeId = store.id as string;

  // Idempotent defaults for a newly-provisioned store.
  await admin
    .from("memberships")
    .upsert(
      { user_id: userId, store_id: storeId, role: "owner" },
      { onConflict: "user_id,store_id", ignoreDuplicates: true },
    );
  await admin
    .from("subscriptions")
    .upsert(
      { store_id: storeId, plan_id: "free" },
      { onConflict: "store_id", ignoreDuplicates: true },
    );
  await admin
    .from("store_preferences")
    .upsert({ store_id: storeId }, { onConflict: "store_id", ignoreDuplicates: true });
  await admin
    .from("store_countries")
    .upsert(
      { store_id: storeId, country_code: "US", enabled: true },
      { onConflict: "store_id,country_code", ignoreDuplicates: true },
    );

  return { userId, storeId, shopDomain, storeName: store.name as string };
}

/** RLS-scoped client for the resolved tenant. */
export function clientForTenant(tenant: Tenant): Promise<SupabaseClient> {
  return getUserClient(tenant.userId);
}
