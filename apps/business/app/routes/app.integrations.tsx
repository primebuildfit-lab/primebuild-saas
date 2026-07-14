import { useMemo, useState } from "react";
import { Plug, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  SearchInput,
  Badge,
  DataTable,
  type BadgeTone,
  type Column,
} from "~/components/ui";
import { integrations, type Integration, type IntegrationStatus } from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const STATUS_TONE: Record<IntegrationStatus, BadgeTone> = {
  connected: "green",
  available: "gray",
  error: "red",
  action_required: "amber",
};
const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: "Connected",
  available: "Available",
  error: "Error",
  action_required: "Action required",
};

export default function IntegrationsRoute() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrations.filter((i) =>
      q ? i.name.toLowerCase().includes(q) || i.category.includes(q) : true,
    );
  }, [query]);

  const connected = integrations.filter((i) => i.status === "connected").length;
  const needsAttention = integrations.filter(
    (i) => i.status === "error" || i.status === "action_required",
  ).length;
  const totalUsage = integrations.reduce((s, i) => s + i.usage, 0);

  const columns: Column<Integration>[] = [
    {
      key: "name",
      header: "Integration",
      cell: (i) => (
        <div>
          <div className="font-medium text-ink">{i.name}</div>
          <div className="text-xs text-ink-muted">{humanizeCategory(i.category)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (i) => <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge>,
    },
    {
      key: "version",
      header: "Version",
      hideOnMobile: true,
      cell: (i) => <span className="text-sm text-ink-muted">{i.version}</span>,
    },
    {
      key: "usage",
      header: "Usage (mo)",
      align: "right",
      hideOnMobile: true,
      cell: (i) => <span className="tabular-nums text-ink">{i.usage.toLocaleString()}</span>,
    },
    {
      key: "lastSync",
      header: "Last sync",
      align: "right",
      hideOnMobile: true,
      cell: (i) => (
        <span className="text-sm text-ink-muted">
          {i.lastSync ? formatDate(i.lastSync.slice(0, 10)) : "—"}
        </span>
      ),
    },
    {
      key: "errors",
      header: "Errors",
      align: "right",
      cell: (i) =>
        i.errors > 0 ? (
          <span className="font-medium text-red-600">{i.errors}</span>
        ) : (
          <span className="text-ink-faint">0</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="A managed catalog of the tools Eventra connects to — with version, usage, and health for each. Connections are visual in V1."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Integrations" value={integrations.length} icon={Plug} />
        <StatTile label="Connected" value={connected} icon={CheckCircle2} />
        <StatTile label="Need attention" value={needsAttention} icon={AlertTriangle} />
        <StatTile label="Calls this month" value={totalUsage.toLocaleString()} icon={Activity} />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar>
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search integrations…"
            className="w-full sm:w-64"
          />
        </Toolbar>
        <DataTable columns={columns} rows={visible} rowKey={(i) => i.id} />
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
