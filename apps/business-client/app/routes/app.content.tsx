import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  FolderKanban,
  Sparkles,
  Megaphone,
  Archive,
  Building2,
  FileText,
  Image as ImageIcon,
  Mail,
  Layout,
  Video,
} from "lucide-react";
import {
  PageHeader,
  SegmentedControl,
  SearchInput,
  Badge,
  EmptyState,
  type BadgeTone,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { contentItems, type ContentItem } from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

/**
 * Content — a marketing WORKSPACE, not a file browser. Every asset lives in one
 * of four workspaces so approved work is never mixed with generated drafts:
 *   Company · Campaign · Generated · Historical.
 * Real seed content; empty workspaces show an honest, actionable empty state.
 */
type Workspace = "company" | "campaign" | "generated" | "historical";

const WORKSPACES: Array<{ value: Workspace; label: string; icon: typeof Building2; blurb: string }> = [
  { value: "company", label: "Company", icon: Building2, blurb: "Official brand assets, logos, product imagery and kits." },
  { value: "campaign", label: "Campaign", icon: Megaphone, blurb: "Content produced for a specific campaign." },
  { value: "generated", label: "Generated", icon: Sparkles, blurb: "AI drafts and variants — never mixed with approved work." },
  { value: "historical", label: "Historical", icon: Archive, blurb: "Everything already published — search, reuse, compare." },
];

/** Assign each item to exactly one workspace, by priority. */
function workspaceOf(c: ContentItem): Workspace {
  if (c.kind === "ai") return "generated";
  if (c.campaignId) return "campaign";
  if (c.status === "published" || c.status === "archived") return "historical";
  return "company";
}

const STATUS_TONE: Record<string, BadgeTone> = {
  draft: "gray",
  ready: "blue",
  published: "green",
  archived: "gray",
};

const FORMAT_ICON: Record<string, typeof FileText> = {
  banner: Layout,
  email: Mail,
  copy: FileText,
  image: ImageIcon,
  video: Video,
};

export default function ContentRoute() {
  const { campaigns } = useData();
  const [ws, setWs] = useState<Workspace>("company");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base: Record<Workspace, number> = { company: 0, campaign: 0, generated: 0, historical: 0 };
    for (const c of contentItems) base[workspaceOf(c)] += 1;
    return base;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contentItems
      .filter((c) => workspaceOf(c) === ws)
      .filter((c) => (q ? c.title.toLowerCase().includes(q) : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [ws, query]);

  const campaignName = (id?: string) =>
    id ? (campaigns.find((c) => c.id === id)?.name ?? "Campaign") : null;

  const active = WORKSPACES.find((w) => w.value === ws)!;
  const ActiveIcon = active.icon;

  return (
    <div>
      <PageHeader
        title="Content"
        description="Your marketing production workspace — company assets, campaign content, AI drafts and everything you've published, kept apart so nothing gets mixed up."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl<Workspace>
          aria-label="Content workspace"
          segments={WORKSPACES.map((w) => ({ value: w.value, label: `${w.label} (${counts[w.value]})` }))}
          value={ws}
          onChange={setWs}
        />
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search content…"
          className="w-full sm:w-64"
        />
      </div>

      <p className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
        <ActiveIcon className="h-4 w-4 text-ink-faint" />
        {active.blurb}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={active.icon}
          title={`No ${active.label.toLowerCase()} content yet`}
          description={
            ws === "generated"
              ? "AI drafts will appear here once AI generation is connected — nothing is faked."
              : ws === "historical"
                ? "Published content will collect here so you can reuse and compare it next year."
                : "Add content or create it from a campaign to build up this workspace."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((c) => {
            const Icon = FORMAT_ICON[c.format] ?? FileText;
            const cname = campaignName(c.campaignId);
            return (
              <div
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-brand-300"
              >
                <div className="flex h-24 items-center justify-center bg-surface-2 text-ink-faint">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 text-sm font-medium text-ink">{c.title}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{c.owner}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={STATUS_TONE[c.status] ?? "gray"}>{humanizeCategory(c.status)}</Badge>
                    <span className="text-[11px] text-ink-faint">{humanizeCategory(c.format)}</span>
                  </div>
                  {cname ? (
                    <Link
                      to={`/app/campaigns?c=${c.campaignId}`}
                      className="mt-2 truncate text-xs text-brand-700 hover:underline"
                    >
                      {cname}
                    </Link>
                  ) : null}
                  <p className="mt-auto pt-2 text-[11px] text-ink-faint">
                    Updated {formatDate(c.updatedAt.slice(0, 10))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-faint">
        <FolderKanban className="h-4 w-4" />
        {contentItems.length} pieces across all workspaces. Heavy files are stored by your media provider, not
        in the database.
      </p>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
