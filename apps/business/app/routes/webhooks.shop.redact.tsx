import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { persistenceMode } from "~/db/env.server";

/**
 * GDPR compliance webhook: `shop/redact` (mandatory for public apps).
 *
 * Fired ~48h after a shop uninstalls. Erases everything Eventra holds for that
 * shop: (1) the Shopify session rows (always), and (2) in `supabase` mode the
 * organization row — its `on delete cascade` removes the workspace and all
 * merchant records (campaigns/events/templates/notes/preferences). Idempotent:
 * safe to run when the data is already gone.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);
  console.log(`[compliance] ${topic} for ${shop} — redacting shop data`);

  // 1) Shopify session rows (present in every mode).
  await db.session.deleteMany({ where: { shop } });

  // 2) Tenant data when a real Supabase project is connected. Loaded lazily so
  //    mock/file mode never imports the Supabase/Shopify server dependencies.
  if (persistenceMode() === "supabase") {
    const { getAdminClient } = await import("~/db/supabase.server");
    const { orgIdForShop } = await import("~/db/ids.server");
    const admin = getAdminClient();
    const { error } = await admin.from("organizations").delete().eq("id", orgIdForShop(shop));
    if (error) {
      // Log and still 200 — Shopify will retry, and the delete is idempotent.
      console.error(`[compliance] shop/redact org purge failed for ${shop}: ${error.message}`);
    }
  }

  return new Response(null, { status: 200 });
};
