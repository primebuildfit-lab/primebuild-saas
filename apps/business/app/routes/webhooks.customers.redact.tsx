import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR compliance webhook: `customers/redact` (mandatory for public apps).
 *
 * Eventra stores no customer personal data (see customers/data_request), so there
 * is nothing to erase for an individual customer — we authenticate (HMAC) and
 * acknowledge. Shop-wide erasure is handled by `shop/redact`.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);
  console.log(`[compliance] ${topic} for ${shop} — no customer PII stored; acknowledged`);
  return new Response(null, { status: 200 });
};
