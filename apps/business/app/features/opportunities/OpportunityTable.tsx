import { Plus } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  ScoreBadge,
  type Column,
} from "~/components/ui";
import { getCountry } from "~/data";
import { formatDate, relativeDays } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";
import type { ScoredOpportunity } from "~/lib/opportunities";
import {
  DIFFICULTY_LABEL,
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATE_LABEL,
  STATE_TONE,
} from "./opportunityLabels";

function Flags({ codes }: { codes: string[] }) {
  return (
    <span className="text-sm" aria-hidden>
      {codes.map((c) => getCountry(c)?.flag ?? "").join(" ")}
    </span>
  );
}

export function OpportunityTable({
  items,
  onCreateCampaign,
  onOpen,
}: {
  items: ScoredOpportunity[];
  onCreateCampaign: (o: ScoredOpportunity) => void;
  onOpen?: (o: ScoredOpportunity) => void;
}) {
  const columns: Column<ScoredOpportunity>[] = [
    {
      key: "opportunity",
      header: "Opportunity",
      cell: (o) => (
        <div className="min-w-[12rem]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{o.event.name}</span>
            <Flags codes={o.reachCodes} />
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">{o.source}</p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      align: "center",
      cell: (o) => <ScoreBadge score={o.score} size="sm" />,
    },
    {
      key: "priority",
      header: "Priority",
      hideOnMobile: true,
      cell: (o) => (
        <Badge tone={PRIORITY_TONE[o.priority]}>{PRIORITY_LABEL[o.priority]}</Badge>
      ),
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (o) => (
        <span className="text-sm text-ink-muted">{humanizeCategory(o.category)}</span>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      hideOnMobile: true,
      cell: (o) => (
        <span className="text-sm text-ink-muted">{DIFFICULTY_LABEL[o.difficulty]}</span>
      ),
    },
    {
      key: "reliability",
      header: "Reliability",
      align: "right",
      hideOnMobile: true,
      cell: (o) => (
        <span className="text-sm font-medium tabular-nums text-ink">
          {o.reliability}%
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (o) => (
        <div>
          <div className="text-sm text-ink">{formatDate(o.occurrence.startISO)}</div>
          <div className="text-xs text-ink-faint">{relativeDays(o.occurrence.startISO)}</div>
        </div>
      ),
    },
    {
      key: "state",
      header: "Status",
      cell: (o) => <Badge tone={STATE_TONE[o.state]}>{STATE_LABEL[o.state]}</Badge>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (o) =>
        o.hasCampaign ? (
          <span className="text-xs font-medium text-emerald-600">Planned</span>
        ) : o.state === "cancelled" || o.state === "archived" ? (
          <span className="text-xs text-ink-faint">—</span>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onCreateCampaign(o);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Campaign
          </Button>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(o) => o.id}
      onRowClick={onOpen}
    />
  );
}
