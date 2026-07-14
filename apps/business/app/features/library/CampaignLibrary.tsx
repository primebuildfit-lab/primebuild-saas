import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Library, CalendarPlus, ExternalLink, GitBranch } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  StatusPill,
  EmptyState,
  SearchInput,
  SegmentedControl,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import type { Campaign } from "~/types/domain";
import { formatDateRange } from "~/lib/dates";
import { duplicateForNextYear } from "~/lib/campaigns";

type Scope = "all" | "memory" | "active";

/**
 * Campaign Library = the store's marketing memory. Campaigns are grouped by the
 * opportunity they serve so every version done over time sits together, and reuse
 * always spawns a NEW record (history is never overwritten).
 */
export function CampaignLibrary() {
  const { campaigns, globalEvents, duplicateCampaign } = useData();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const scoped = useMemo(() => {
    return campaigns
      .filter((c) => {
        if (scope === "memory")
          return c.status === "completed" || c.status === "archived";
        if (scope === "active")
          return ["draft", "scheduled", "active"].includes(c.status);
        return true;
      })
      .filter((c) =>
        q
          ? c.name.toLowerCase().includes(q) ||
            (c.objective?.toLowerCase().includes(q) ?? false)
          : true,
      );
  }, [campaigns, scope, q]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: Campaign[] }>();
    for (const c of scoped) {
      const event = c.globalEventId
        ? globalEvents.find((e) => e.id === c.globalEventId)
        : undefined;
      const key = event
        ? `event:${event.id}`
        : c.country
          ? `country:${c.country}`
          : "other";
      const label = event
        ? event.name
        : c.country
          ? `${getCountry(c.country)?.name ?? c.country} campaigns`
          : "Other campaigns";
      const group = map.get(key) ?? { label, items: [] };
      group.items.push(c);
      map.set(key, group);
    }
    // sort each group's items by start date
    for (const group of map.values()) {
      group.items.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    return [...map.values()].sort((a, b) => b.items.length - a.items.length);
  }, [scoped, globalEvents]);

  const reuseNextYear = (c: Campaign) => {
    const scaffold = duplicateForNextYear(c);
    const copy = duplicateCampaign(c.id, {
      name: scaffold.name,
      prepStart: scaffold.prepStart,
      startDate: scaffold.startDate,
      endDate: scaffold.endDate,
    });
    if (copy) navigate(`/app/campaigns?c=${copy.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          className="w-full sm:max-w-xs"
          value={query}
          onValueChange={setQuery}
          placeholder="Search memory…"
          aria-label="Search campaign memory"
        />
        <SegmentedControl<Scope>
          aria-label="Library scope"
          segments={[
            { value: "all", label: "All" },
            { value: "memory", label: "Proven" },
            { value: "active", label: "In flight" },
          ]}
          value={scope}
          onChange={setScope}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Nothing here yet"
          description="Completed campaigns become reusable memory you can duplicate for future opportunities."
        />
      ) : (
        groups.map((group) => (
          <Card key={group.label}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
              <Badge tone="gray">
                {group.items.length}{" "}
                {group.items.length === 1 ? "version" : "versions"}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-line">
                {group.items.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink">
                          {c.name}
                        </p>
                        <StatusPill status={c.status} />
                        {c.createdFromId ? (
                          <Badge tone="blue">
                            <GitBranch className="h-3 w-3" />
                            Reused
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {formatDateRange(c.startDate, c.endDate)}
                        {c.offer ? ` · ${c.offer}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => reuseNextYear(c)}
                      >
                        <CalendarPlus className="h-4 w-4" />
                        Reuse next year
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/app/campaigns?c=${c.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
