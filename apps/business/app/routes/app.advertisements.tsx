import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Megaphone, Plus, PlayCircle, PauseCircle, FileEdit } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  SearchInput,
  FilterChips,
  Badge,
  DataTable,
  Button,
  EmptyState,
  type Column,
  type FilterChip,
} from "~/components/ui";
import { useAdvertising } from "~/context/AdvertisingContext";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { formatDate } from "~/lib/dates";
import type { Advertisement, AdvertisementStatus } from "~/types/advertising";
import {
  AD_STATUS_LABEL,
  AD_STATUS_ORDER,
  AD_STATUS_TONE,
  PLACEMENT_LABEL,
} from "~/features/advertising/advertisingLabels";

/**
 * Advertisements — the individual marketing pieces (banner, popup, Liquid
 * section, email…). Each belongs, optionally, to a campaign. Real tenant data
 * only; empty until you create one from the Promotion Builder.
 */
export default function AdvertisementsRoute() {
  const { advertisements } = useAdvertising();
  const { campaigns } = useData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdvertisementStatus | null>(null);

  const counts = useMemo(() => {
    const base = Object.fromEntries(AD_STATUS_ORDER.map((s) => [s, 0])) as Record<
      AdvertisementStatus,
      number
    >;
    for (const a of advertisements) base[a.status] += 1;
    return base;
  }, [advertisements]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return advertisements
      .filter((a) => (status ? a.status === status : true))
      .filter((a) => (q ? a.name.toLowerCase().includes(q) : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [advertisements, query, status]);

  const chips: FilterChip<AdvertisementStatus>[] = AD_STATUS_ORDER.map((s) => ({
    value: s,
    label: AD_STATUS_LABEL[s],
    count: counts[s],
  }));

  const campaignName = (id?: string) =>
    id ? (campaigns.find((c) => c.id === id)?.name ?? "Campaign") : "—";

  const columns: Column<Advertisement>[] = [
    {
      key: "name",
      header: "Advertisement",
      cell: (a) => (
        <div>
          <div className="font-medium text-ink">{a.name}</div>
          <div className="text-xs text-ink-muted">{PLACEMENT_LABEL[a.placement]}</div>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (a) => <Badge tone={AD_STATUS_TONE[a.status]}>{AD_STATUS_LABEL[a.status]}</Badge> },
    { key: "country", header: "Country", hideOnMobile: true, cell: (a) => (a.country ? (getCountry(a.country)?.name ?? a.country) : "—") },
    { key: "campaign", header: "Campaign", hideOnMobile: true, cell: (a) => <span className="text-ink-muted">{campaignName(a.campaignId)}</span> },
    {
      key: "dates",
      header: "Schedule",
      align: "right",
      hideOnMobile: true,
      cell: (a) => (
        <span className="text-sm text-ink-muted">
          {a.startDate ? formatDate(a.startDate) : "—"} → {a.endDate ? formatDate(a.endDate) : "—"}
        </span>
      ),
    },
  ];

  const active = counts.active;
  const scheduled = counts.scheduled;
  const drafts = counts.draft;

  return (
    <div>
      <PageHeader
        title="Advertisements"
        description="Every marketing piece you run — banners, popups, Liquid sections, emails and more. Build one from an opportunity or event."
        actions={
          <Link to="/app/promotion-builder">
            <Button>
              <Plus className="h-4 w-4" />
              Create advertisement
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total" value={advertisements.length} icon={Megaphone} />
        <StatTile label="Active" value={active} icon={PlayCircle} />
        <StatTile label="Scheduled" value={scheduled} icon={PauseCircle} />
        <StatTile label="Drafts" value={drafts} icon={FileEdit} />
      </div>

      <div className="mt-6 space-y-4">
        {advertisements.length > 0 ? (
          <Toolbar>
            <SearchInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search advertisements…"
              className="w-full sm:w-64"
            />
            <FilterChips chips={chips} value={status} onChange={setStatus} allLabel="All" aria-label="Filter by status" />
          </Toolbar>
        ) : null}

        {advertisements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No advertisements yet"
            description="Create your first advertisement from an event or opportunity in the Promotion Builder — pick an offer, a template and a placement."
            action={
              <Link to="/app/promotion-builder">
                <Button>Create advertisement</Button>
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={Megaphone} title="No matches" description="Try a different search or clear the status filter." />
        ) : (
          <DataTable columns={columns} rows={visible} rowKey={(a) => a.id} />
        )}
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
