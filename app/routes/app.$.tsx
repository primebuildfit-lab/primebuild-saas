import { Compass } from "lucide-react";
import { PageHeader, EmptyState, LinkButton } from "~/components/ui";

/**
 * Catch-all for unknown /app/* paths. Renders inside the authenticated shell so
 * navigation stays intact instead of showing a bare framework 404.
 */
export default function AppNotFound() {
  return (
    <div>
      <PageHeader title="Page not found" description="This page doesn’t exist." />
      <EmptyState
        icon={Compass}
        title="Nothing here"
        description="The page you’re looking for may have moved or never existed."
        action={
          <LinkButton to="/app" variant="secondary">
            Back to dashboard
          </LinkButton>
        }
      />
    </div>
  );
}
