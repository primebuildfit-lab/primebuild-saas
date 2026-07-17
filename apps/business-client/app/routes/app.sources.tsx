import { useMemo, useState } from "react";
import { Rss, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
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
import { getCountry } from "~/data";
import { sources, type Source, type SourceStatus } from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const STATUS_TONE: Record<SourceStatus, BadgeTone> = {
  connected: "green",
  syncing: "blue",
  error: "red",
  paused: "gray",
};

export default function SourcesRoute() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) =>
      q ? s.name.toLowerCase().includes(q) || s.type.includes(q) : true,
    );
  }, [query]);

  const connected = sources.filter((s) => s.status === "connected").length;
  const errored = sources.filter((s) => s.status === "error").length;
  const avgReliability = Math.round(
    sources.reduce((s, x) => s + x.reliability, 0) / sources.length,
  );

  const columns: Column<Source>[] = [
    {
      key: "name",
      header: "Source",
      cell: (s) => (
        <div>
          <div className="font-medium text-ink">{s.name}</div>
          <div className="text-xs text-ink-muted">{humanizeCategory(s.type)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <Badge tone={STATUS_TONE[s.status]}>{humanizeCategory(s.status)}</Badge>,
    },
    {
      key: "frequency",
      header: "Sync",
      hideOnMobile: true,
      cell: (s) => <span className="text-sm text-ink-muted">{humanizeCategory(s.frequency)}</span>,
    },
    {
      key: "countries",
      header: "Coverage",
      hideOnMobile: true,
      cell: (s) => (
        <span className="text-sm text-ink-muted">
          {s.countries[0] === "*"
            ? "Global"
            : s.countries.map((c) => getCountry(c)?.flag ?? c).join(" ")}
        </span>
      ),
    },
    {
      key: "reliability",
      header: "Reliability",
      align: "right",
      cell: (s) => <span className="tabular-nums font-medium text-ink">{s.reliability}%</span>,
    },
    {
      key: "lastSync",
      header: "Last sync",
      align: "right",
      hideOnMobile: true,
      cell: (s) => <span className="text-sm text-ink-muted">{formatDate(s.lastSync.slice(0, 10))}</span>,
    },
    {
      key: "errors",
      header: "Errors",
      align: "right",
      cell: (s) =>
        s.errors > 0 ? (
          <span className="font-medium text-red-600">{s.errors}</span>
        ) : (
          <span className="text-ink-faint">0</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sources"
        description="The feeds Eventra watches to discover opportunities. Manage cadence, coverage, and health."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Sources" value={sources.length} icon={Rss} />
        <StatTile label="Connected" value={connected} icon={CheckCircle2} />
        <StatTile label="Avg. reliability" value={`${avgReliability}%`} icon={RefreshCw} />
        <StatTile label="With errors" value={errored} icon={AlertTriangle} />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar>
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search sources…"
            className="w-full sm:w-64"
          />
        </Toolbar>
        <DataTable columns={columns} rows={visible} rowKey={(s) => s.id} />
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
