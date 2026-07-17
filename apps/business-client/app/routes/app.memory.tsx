import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { BrainCog, RotateCcw, ArrowRight } from "lucide-react";
import { PageHeader, EmptyState, Badge, Button, StatusPill } from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { Campaign } from "~/types/domain";

/**
 * Memory — the reusable record of what a business has done and learned, so it
 * can repeat what works next year. This is NOT a fabricated analytics view: it
 * surfaces the store's own campaigns, their notes/learnings, and reuse chains
 * (createdFromId). When there is nothing to remember yet, it says so honestly.
 */
export default function MemoryRoute() {
  const { campaigns, duplicateCampaign } = useData();
  const navigate = useNavigate();

  // Campaigns worth remembering: completed, or carrying notes/learnings.
  const memory = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === "completed" || c.status === "archived" || Boolean(c.notes))
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [campaigns],
  );

  const reuseChains = useMemo(
    () => campaigns.filter((c) => Boolean(c.createdFromId)).length,
    [campaigns],
  );

  const reuse = (c: Campaign) => {
    const copy = duplicateCampaign(c.id, { name: `${c.name} (reuse)` });
    if (copy) navigate(`/app/campaigns?c=${copy.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Memory"
        description="What your campaigns achieved and what you learned — kept so you can reuse what works next year. Reuse never overwrites the original."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Remembered campaigns" value={memory.length} />
        <Stat label="Completed" value={campaigns.filter((c) => c.status === "completed").length} />
        <Stat label="Reuse chains" value={reuseChains} />
      </div>

      {memory.length === 0 ? (
        <EmptyState
          icon={BrainCog}
          title="No results registered yet"
          description="When you complete a campaign or add notes and learnings to it, it appears here — ready to duplicate and reuse next year."
          action={
            <Link to="/app/campaigns">
              <Button variant="secondary">Go to campaigns</Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {memory.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/campaigns?c=${c.id}`}
                    className="truncate text-sm font-semibold text-ink hover:text-brand-700"
                  >
                    {c.name}
                  </Link>
                  <StatusPill status={c.status} />
                  {c.createdFromId ? <Badge tone="brand">Reused</Badge> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                  {c.notes?.trim()
                    ? c.notes
                    : "No learnings recorded yet — open the campaign to add what worked and what to change."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => reuse(c)}>
                  <RotateCcw className="h-4 w-4" />
                  Reuse next year
                </Button>
                <Link to={`/app/campaigns?c=${c.id}`}>
                  <Button variant="ghost" size="sm">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
