import { useMemo, useState } from "react";
import { Image as ImageIcon, Video, FileText, Link2, Map as MapIcon } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  SearchInput,
  FilterChips,
  Badge,
  DataTable,
  EmptyState,
  type Column,
  type FilterChip,
} from "~/components/ui";
import { mediaAssets, type MediaAsset, type MediaType, type MediaLicense } from "~/data";
import { formatDate } from "~/lib/dates";

const TYPE_LABEL: Record<MediaType, string> = {
  image: "Images",
  video: "Videos",
  document: "Documents",
  link: "Links",
  map: "Maps",
};
const TYPE_ORDER: MediaType[] = ["image", "video", "document", "link", "map"];

const LICENSE_LABEL: Record<MediaLicense, string> = {
  owned: "Owned",
  royalty_free: "Royalty-free",
  licensed: "Licensed",
  unknown: "Unknown",
};
const LICENSE_TONE: Record<MediaLicense, "green" | "blue" | "amber" | "red"> = {
  owned: "green",
  royalty_free: "blue",
  licensed: "amber",
  unknown: "red",
};

const TYPE_ICON: Record<MediaType, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  link: Link2,
  map: MapIcon,
};

export default function MediaRoute() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType | null>(null);

  const counts = useMemo(() => {
    const base = { image: 0, video: 0, document: 0, link: 0, map: 0 } as Record<MediaType, number>;
    for (const m of mediaAssets) base[m.type] += 1;
    return base;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mediaAssets
      .filter((m) => (type ? m.type === type : true))
      .filter((m) => (q ? m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [query, type]);

  const chips: FilterChip<MediaType>[] = TYPE_ORDER.map((t) => ({
    value: t,
    label: TYPE_LABEL[t],
    count: counts[t],
  }));

  const columns: Column<MediaAsset>[] = [
    {
      key: "name",
      header: "Asset",
      cell: (m) => {
        const Icon = TYPE_ICON[m.type];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-ink-faint" />
            <div>
              <div className="font-medium text-ink">{m.name}</div>
              <div className="text-xs text-ink-muted">{m.location}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "license",
      header: "License",
      cell: (m) => <Badge tone={LICENSE_TONE[m.license]}>{LICENSE_LABEL[m.license]}</Badge>,
    },
    {
      key: "version",
      header: "Version",
      align: "center",
      hideOnMobile: true,
      cell: (m) => <span className="tabular-nums text-ink-muted">v{m.version}</span>,
    },
    {
      key: "size",
      header: "Size",
      align: "right",
      hideOnMobile: true,
      cell: (m) => <span className="text-sm text-ink-muted">{m.sizeLabel}</span>,
    },
    {
      key: "updated",
      header: "Updated",
      align: "right",
      hideOnMobile: true,
      cell: (m) => <span className="text-sm text-ink-muted">{formatDate(m.updatedAt.slice(0, 10))}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Media"
        description="A versioned, licensed library of images, video, documents, links, and maps — safe to reuse across campaigns."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Assets" value={mediaAssets.length} icon={ImageIcon} />
        <StatTile label="Videos" value={counts.video} icon={Video} />
        <StatTile label="Documents" value={counts.document} icon={FileText} />
        <StatTile
          label="Owned"
          value={mediaAssets.filter((m) => m.license === "owned").length}
          icon={FileText}
        />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar>
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search media…"
            className="w-full sm:w-64"
          />
          <FilterChips chips={chips} value={type} onChange={setType} allLabel="All" aria-label="Filter by type" />
        </Toolbar>
        {visible.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No media" description="Nothing matches your filters yet." />
        ) : (
          <DataTable columns={columns} rows={visible} rowKey={(m) => m.id} />
        )}
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
