import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { StoreProvider } from "~/context/StoreContext";
import { PlanProvider } from "~/context/PlanContext";
import { AppShell } from "~/components/shell/AppShell";

/**
 * Authenticated `/app` layout — official Shopify template shape.
 *
 * The loader validates the embedded Shopify admin session server-side
 * (`authenticate.admin`) before any app surface renders. App Bridge is mounted
 * via `AppProvider`; inside it we wrap Eventra's own tenant/plan contexts and
 * the responsive Tailwind shell around the route `<Outlet />`.
 *
 * Phases 1–4 render mock data (see app/data). Real Supabase reads + server-side
 * Membership validation land in Phase 5 (see docs/ARCHITECTURE_REVIEW.md §8).
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <StoreProvider>
        <PlanProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </PlanProvider>
      </StoreProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their
// headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
