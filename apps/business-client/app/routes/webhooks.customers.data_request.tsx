import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GDPR compliance webhook: `customers/data_request` (mandatory for public apps).
 *
 * Eventra Business requests only `read_products` and stores NO customer personal
 * data — it keeps a Shopify session per shop and merchant-owned planning records
 * (campaigns/events/templates) keyed by the workspace, never by a customer. There
 * is therefore no customer data to compile or return; we authenticate (HMAC) and
 * acknowledge. If a future scope ever ingests customer PII, gather + return it here.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log(
    `[compliance] ${topic} for ${shop} — Eventra stores no customer PII; acknowledged`,
    { shopifyCustomerId: (payload as { customer?: { id?: number } })?.customer?.id },
  );
  return new Response(null, { status: 200 });
};
