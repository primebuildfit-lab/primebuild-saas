import type { Config } from "@react-router/dev/config";

export default {
  // Server-side rendering ON — matches the Shopify embedded-app model.
  // Loaders/actions read mock data in Phases 1–4; real Shopify/Supabase wired in Phase 5.
  ssr: true,
} satisfies Config;
