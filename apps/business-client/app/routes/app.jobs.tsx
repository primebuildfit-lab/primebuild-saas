import { useMemo, useState } from "react";
import { ListChecks, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  FilterChips,
  Badge,
  DataTable,
  EmptyState,
  type BadgeTone,
  type Column,
  type FilterChip,
} from "~/components/ui";
import { jobs, automations, type Job, type JobStatus } from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const STATUS_TONE: Record<JobStatus, BadgeTone> = {
  queued: "gray",
  running: "blue",
  succeeded: "green",
  failed: "red",
};
const STATUS_ORDER: JobStatus[] = ["running", "queued", "succeeded", "failed"];

function automationName(id: string): string {
  return automations.find((a) => a.id === id)?.name ?? id;
}

function formatDuration(ms?: number): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function JobsRoute() {
  const [status, setStatus] = useState<JobStatus | null>(null);

  const counts = useMemo(() => {
    const base = { queued: 0, running: 0, succeeded: 0, failed: 0 } as Record<JobStatus, number>;
    for (const j of jobs) base[j.status] += 1;
    return base;
  }, []);

  const visible = useMemo(
    () =>
      (status ? jobs.filter((j) => j.status === status) : jobs)
        .slice()
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [status],
  );

  const chips: FilterChip<JobStatus>[] = STATUS_ORDER.map((s) => ({
    value: s,
    label: humanizeCategory(s),
    count: counts[s],
  }));

  const columns: Column<Job>[] = [
    {
      key: "label",
      header: "Job",
      cell: (j) => (
        <div>
          <div className="font-medium text-ink">{j.label}</div>
          <div className="text-xs text-ink-muted">{automationName(j.automationId)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (j) => <Badge tone={STATUS_TONE[j.status]}>{humanizeCategory(j.status)}</Badge>,
    },
    {
      key: "processed",
      header: "Processed",
      align: "right",
      hideOnMobile: true,
      cell: (j) => <span className="tabular-nums text-ink-muted">{j.processed ?? "—"}</span>,
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      hideOnMobile: true,
      cell: (j) => <span className="text-sm text-ink-muted">{formatDuration(j.durationMs)}</span>,
    },
    {
      key: "started",
      header: "Started",
      align: "right",
      cell: (j) => <span className="text-sm text-ink-muted">{formatDate(j.startedAt.slice(0, 10))}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="A log of every automation run — discovery searches, syncs, alerts, and reports — with status and duration."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total runs" value={jobs.length} icon={ListChecks} />
        <StatTile label="Running" value={counts.running} icon={Loader2} />
        <StatTile label="Succeeded" value={counts.succeeded} icon={CheckCircle2} />
        <StatTile label="Failed" value={counts.failed} icon={XCircle} />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar>
          <FilterChips chips={chips} value={status} onChange={setStatus} allLabel="All" aria-label="Filter by status" />
        </Toolbar>
        {visible.length === 0 ? (
          <EmptyState icon={ListChecks} title="No jobs" description="No runs match this filter." />
        ) : (
          <DataTable columns={columns} rows={visible} rowKey={(j) => j.id} />
        )}
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
