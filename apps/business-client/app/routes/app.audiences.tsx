import { useMemo, useState } from "react";
import { Users, Building2, User, Target } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  SegmentedControl,
  Badge,
  DataTable,
  type Column,
} from "~/components/ui";
import { getCountry } from "~/data";
import { audiences, type Audience, type AudienceType } from "~/data";

type View = "all" | AudienceType;

export default function AudiencesRoute() {
  const [view, setView] = useState<View>("all");

  const rows = useMemo(
    () => (view === "all" ? audiences : audiences.filter((a) => a.type === view)),
    [view],
  );

  const totalReach = audiences.reduce((s, a) => s + a.size, 0);
  const businessReach = audiences
    .filter((a) => a.type === "business")
    .reduce((s, a) => s + a.size, 0);
  const personalReach = totalReach - businessReach;
  const bestConversion = audiences.reduce(
    (best, a) => (a.conversion > best.conversion ? a : best),
    audiences[0],
  );

  const columns: Column<Audience>[] = [
    {
      key: "name",
      header: "Audience",
      cell: (a) => (
        <div className="flex items-center gap-2">
          {a.type === "business" ? (
            <Building2 className="h-4 w-4 text-ink-faint" />
          ) : (
            <User className="h-4 w-4 text-ink-faint" />
          )}
          <span className="font-medium text-ink">{a.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (a) => (
        <Badge tone={a.type === "business" ? "brand" : "blue"}>
          {a.type === "business" ? "Business" : "Personal"}
        </Badge>
      ),
    },
    {
      key: "size",
      header: "Reach",
      align: "right",
      cell: (a) => <span className="tabular-nums text-ink">{a.size.toLocaleString()}</span>,
    },
    {
      key: "conversion",
      header: "Conversion",
      align: "right",
      cell: (a) => <span className="tabular-nums font-medium text-ink">{a.conversion}%</span>,
    },
    {
      key: "content",
      header: "Content",
      align: "right",
      hideOnMobile: true,
      cell: (a) => <span className="tabular-nums text-ink-muted">{a.contentPieces}</span>,
    },
    {
      key: "market",
      header: "Top market",
      hideOnMobile: true,
      cell: (a) => (
        <span className="text-sm text-ink-muted">
          {getCountry(a.topCountry)?.flag} {getCountry(a.topCountry)?.name ?? a.topCountry}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audiences"
        description="Compare who you sell to — businesses vs. personal buyers — across reach, conversion, and content fit."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total reach" value={totalReach.toLocaleString()} icon={Users} />
        <StatTile label="Business reach" value={businessReach.toLocaleString()} icon={Building2} />
        <StatTile label="Personal reach" value={personalReach.toLocaleString()} icon={User} />
        <StatTile
          label="Best converting"
          value={`${bestConversion.conversion}%`}
          icon={Target}
          hint={bestConversion.name}
        />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar>
          <SegmentedControl<View>
            segments={[
              { value: "all", label: "All" },
              { value: "business", label: "Businesses" },
              { value: "personal", label: "Personal" },
            ]}
            value={view}
            onChange={setView}
            aria-label="Audience type"
          />
        </Toolbar>
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} />
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
