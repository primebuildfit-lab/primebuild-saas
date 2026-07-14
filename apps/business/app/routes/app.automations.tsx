import { Workflow, Zap, Bell, RefreshCw } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Badge,
  DataTable,
  LinkButton,
  type BadgeTone,
  type Column,
} from "~/components/ui";
import { automations, jobs, type Automation, type AutomationStatus } from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const STATUS_TONE: Record<AutomationStatus, BadgeTone> = {
  active: "green",
  paused: "gray",
  error: "red",
};

export default function AutomationsRoute() {
  const active = automations.filter((a) => a.status === "active").length;
  const alerts = automations.filter((a) => a.kind === "alert").length;
  const runsToday = jobs.filter((j) => j.startedAt.startsWith("2026-07-13")).length;

  const columns: Column<Automation>[] = [
    {
      key: "name",
      header: "Automation",
      cell: (a) => (
        <div>
          <div className="font-medium text-ink">{a.name}</div>
          <div className="text-xs text-ink-muted">{humanizeCategory(a.kind)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (a) => <Badge tone={STATUS_TONE[a.status]}>{humanizeCategory(a.status)}</Badge>,
    },
    {
      key: "schedule",
      header: "Schedule",
      hideOnMobile: true,
      cell: (a) => <span className="text-sm text-ink-muted">{a.schedule}</span>,
    },
    {
      key: "lastRun",
      header: "Last run",
      align: "right",
      hideOnMobile: true,
      cell: (a) => <span className="text-sm text-ink-muted">{formatDate(a.lastRun.slice(0, 10))}</span>,
    },
    {
      key: "nextRun",
      header: "Next run",
      align: "right",
      cell: (a) => (
        <span className="text-sm text-ink-muted">
          {a.nextRun ? formatDate(a.nextRun.slice(0, 10)) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Scheduled syncs, discovery searches, alerts, and reports that keep your opportunities fresh. Runs are logged in Jobs."
        actions={<LinkButton to="/app/jobs" variant="secondary" size="sm">View jobs</LinkButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Automations" value={automations.length} icon={Workflow} />
        <StatTile label="Active" value={active} icon={Zap} />
        <StatTile label="Alerts" value={alerts} icon={Bell} />
        <StatTile label="Runs today" value={runsToday} icon={RefreshCw} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={automations} rowKey={(a) => a.id} />
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
