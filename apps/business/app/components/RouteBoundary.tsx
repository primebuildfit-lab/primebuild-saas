import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorState, LinkButton } from "~/components/ui";

/**
 * In-shell error boundary for leaf routes. Because it lives on a child of the
 * authenticated `app.tsx` layout, it renders inside the app shell (nav intact)
 * rather than replacing the whole page.
 */
export function RouteBoundary() {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText || "This page could not be loaded."}`
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred while loading this page.";

  return (
    <div className="py-6">
      <ErrorState
        title="This page hit a snag"
        description={description}
        action={
          <LinkButton to="/app" variant="secondary" size="sm">
            Back to dashboard
          </LinkButton>
        }
      />
    </div>
  );
}
