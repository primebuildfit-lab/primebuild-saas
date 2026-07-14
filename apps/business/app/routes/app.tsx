import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { DataProvider } from "~/context/DataContext";
import { usePersistence } from "~/context/usePersistence";
import { AppShell } from "~/components/shell/AppShell";
import { resolveScopeAndRepo } from "~/db/scope.server";
import { persistenceMode, previewEnabled } from "~/db/env.server";

/**
 * Authenticated `/app` layout — official Shopify template shape, now backed by the
 * MM4 persistence layer (MM5, Part 3).
 *
 * The loader authenticates the embedded Shopify session server-side, then hydrates
 * the Business surface from the mode-selected repository (mock/file/Supabase). App
 * Bridge is mounted via `AppProvider`; inside it Eventra's tenant/plan contexts —
 * now wired to `/app/data` server actions — wrap the responsive shell.
 *
 * PREVIEW (local, dev-only, env-gated): when `previewEnabled()` the Shopify auth
 * gate is skipped so screens can be inspected before installation. It is clearly
 * labeled and never runs in production or `supabase` mode (see env.server.ts).
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const preview = previewEnabled();
  if (!preview) {
    await authenticate.admin(request);
  }

  const { scope, repo } = await resolveScopeAndRepo(request, { preview });
  const [catalog, bundle] = await Promise.all([
    repo.loadCatalog(),
    repo.loadBundle(scope),
  ]);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    preview,
    mode: persistenceMode(),
    initialData: { catalog, bundle },
  };
};

export default function App() {
  const { apiKey, preview, mode, initialData } = useLoaderData<typeof loader>();
  const { onPersist, error, clearError, reconcile } = usePersistence();

  const content = (
    <DataProvider initialData={initialData} onPersist={onPersist}>
      <AppShell>
        {preview ? <PreviewBanner mode={mode} /> : null}
        {error ? (
          <PersistErrorBanner message={error} onReload={reconcile} onDismiss={clearError} />
        ) : null}
        <Outlet />
      </AppShell>
    </DataProvider>
  );

  // In preview mode there is no Shopify host, so App Bridge is not mounted.
  return preview ? (
    content
  ) : (
    <AppProvider embedded apiKey={apiKey}>
      {content}
    </AppProvider>
  );
}

function PreviewBanner({ mode }: { mode: string }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-200"
    >
      <span aria-hidden>🔍</span>
      <span>
        <strong>Preview mode</strong> — local inspection only, no Shopify session. Persistence:{" "}
        <code>{mode}</code>. Not connected to any store.
      </span>
    </div>
  );
}

function PersistErrorBanner({
  message,
  onReload,
  onDismiss,
}: {
  message: string;
  onReload: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm text-red-200"
    >
      <span>{message}</span>
      <span className="flex gap-2">
        <button
          type="button"
          onClick={onReload}
          className="rounded-md border border-red-300 px-2 py-1 font-medium hover:bg-red-100"
        >
          Reload saved data
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-md px-2 py-1 hover:bg-red-100"
        >
          ✕
        </button>
      </span>
    </div>
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
