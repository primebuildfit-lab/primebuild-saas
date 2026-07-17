import { Wand2, Plus, Globe, CalendarDays, Gauge, ShieldCheck } from "lucide-react";
import { Drawer, Button, Badge, ScoreBreakdown } from "~/components/ui";
import { getCountry } from "~/data";
import { formatDate, relativeDays } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";
import { scoreFactors, type ScoredOpportunity } from "~/lib/opportunities";
import {
  DIFFICULTY_LABEL,
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATE_LABEL,
  STATE_TONE,
} from "./opportunityLabels";

/** A plain-language recommendation from the real signals — never a fake AI blurb. */
function recommendation(o: ScoredOpportunity): string {
  if (o.hasCampaign) return "You already have a campaign for this — open it to keep preparing.";
  if (o.state === "cancelled") return "This event was cancelled — skip it this cycle.";
  if (o.priority === "urgent") return "Act now: it's inside its preparation window and still open. Build a promotion today.";
  if (o.priority === "high") return "Strong opportunity — start a promotion so you're ready in time.";
  if (o.daysUntil > 120) return "Worth planning ahead — save it and revisit as the date approaches.";
  return "A solid moment for your markets — turn it into a promotion when you're ready.";
}

export function OpportunityDrawer({
  opportunity,
  open,
  onClose,
  onCreatePromotion,
  onCreateCampaign,
}: {
  opportunity: ScoredOpportunity | null;
  open: boolean;
  onClose: () => void;
  onCreatePromotion: (o: ScoredOpportunity) => void;
  onCreateCampaign: (o: ScoredOpportunity) => void;
}) {
  const o = opportunity;
  const actionable = o ? !o.hasCampaign && o.state !== "cancelled" && o.state !== "archived" : false;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={o?.event.name}
      description={o ? `${formatDate(o.occurrence.startISO)} · ${relativeDays(o.occurrence.startISO)}` : undefined}
      footer={
        o ? (
          <>
            <Button variant="secondary" onClick={() => onCreateCampaign(o)}>
              <Plus className="h-4 w-4" />
              Campaign
            </Button>
            <Button onClick={() => onCreatePromotion(o)} disabled={!actionable}>
              <Wand2 className="h-4 w-4" />
              Create promotion
            </Button>
          </>
        ) : null
      }
    >
      {o ? (
        <div className="flex flex-col gap-6">
          {/* Should I act? */}
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Recommended action
            </p>
            <p className="mt-1 text-sm text-ink">{recommendation(o)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={PRIORITY_TONE[o.priority]}>{PRIORITY_LABEL[o.priority]}</Badge>
              <Badge tone={STATE_TONE[o.state]}>{STATE_LABEL[o.state]}</Badge>
              {o.hasCampaign ? <Badge tone="green">Planned</Badge> : null}
            </div>
          </div>

          {/* Why — the score explained */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              How valuable is it?
            </p>
            <ScoreBreakdown score={o.score} factors={scoreFactors(o)} />
          </div>

          {/* Facts */}
          <dl className="grid grid-cols-2 gap-3">
            <Fact icon={Globe} label="Markets">
              {o.reachCodes.length > 0
                ? o.reachCodes.map((c) => `${getCountry(c)?.flag ?? ""} ${getCountry(c)?.name ?? c}`).join(", ")
                : "—"}
            </Fact>
            <Fact icon={CalendarDays} label="Category">
              {humanizeCategory(o.category)}
            </Fact>
            <Fact icon={Gauge} label="Difficulty">
              {DIFFICULTY_LABEL[o.difficulty]}
            </Fact>
            <Fact icon={ShieldCheck} label="Reliability">
              {o.reliability}% · {o.source}
            </Fact>
          </dl>
        </div>
      ) : null}
    </Drawer>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}
