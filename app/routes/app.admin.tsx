import { PageHeader } from "~/components/ui";
import { AdminConsole } from "~/features/admin/AdminConsole";

export default function AdminRoute() {
  return (
    <div>
      <PageHeader
        title="Admin"
        description="Manage the shared country and official-event catalog."
      />
      <AdminConsole />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
