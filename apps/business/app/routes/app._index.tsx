import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Sparkles,
  Megaphone,
  CalendarRange,
  FileText,
  BarChart3,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, Button, ScoreBadge, Badge, EmptyState, CountrySelector } from "~/components/ui";
import { useData } from "~/context/DataContext";
import {
  buildOpportunities,
  countByState,
  sortOpportunities,
  urgentOpportunities,
  type ScoredOpportunity,
} from "~/lib/opportunities";
import type { GlobalEvent } from "~/types/domain";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import {
  emptyCampaignValues,
  valuesFromEvent,
  type CampaignFormValues,
} from "~/features/campaigns/campaignModel";
import { cn } from "~/lib/cn";

const MS_DAY = 86_400_000;
function daysUntil(iso: string, today = new Date()): number {
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const d = new Date(iso);
  const dd = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((dd - t) / MS_DAY);
}
function relDays(n: number): string {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n > 1) return `in ${n} days`;
  if (n === -1) return "yesterday";
  return `${Math.abs(n)} days ago`;
}

export default function DashboardRoute() {
  const {
    store,
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    campaigns,
    plan,
    countries,
  } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  // Primary scope: "" = all enabled countries. Filters the whole dashboard.
  const [country, setCountry] = useState("");
  const [initialValues, setInitialValues] = useState<CampaignFormValues>(() =>
    emptyCampaignValues(),
  );

  const openBlank = () => {
    setInitialValues(emptyCampaignValues());
    setModalOpen(true);
  };
  const openForEvent = (event: GlobalEvent, year: number) => {
    setInitialValues(valuesFromEvent(event, year, enabledCountryCodes[0]));
    setModalOpen(true);
  };

  // ── Real data — everything below is derived from the tenant's own catalog,
  //    campaigns and plan. No figure is invented; empty means empty. ──────────
  const opportunities = useMemo(
    () =>
      buildOpportunities({
        globalEvents,
        enabledCodes: enabledCountryCodes,
        prefs: eventPreferences,
        campaigns,
        planHorizonMonths: plan.planningHorizonMonths,
      }),
    [globalEvents, enabledCountryCodes, eventPreferences, campaigns, plan],
  );

  // Apply the country scope once; everything below reads the scoped set.
  const scoped = useMemo(
    () => (country ? opportunities.filter((o) => o.reachCodes.includes(country)) : opportunities),
    [opportunities, country],
  );

  const counts = useMemo(() => countByState(scoped), [scoped]);
  const urgent = useMemo(() => urgentOpportunities(scoped), [scoped]);
  const recommended = useMemo(
    () =>
      sortOpportunities(
        scoped.filter(
          (o) =>
            o.withinPlanHorizon &&
            !o.hasCampaign &&
            o.state !== "cancelled" &&
            o.state !== "archived",
        ),
        "score",
      ).slice(0, 4),
    [scoped],
  );

  // Campaigns that should be prepared/published soon (draft or scheduled, close).
  const campaignsToPrepare = useMemo(
    () =>
      campaigns.filter((c) => {
        if (c.status !== "draft" && c.status !== "scheduled") return false;
        const d = daysUntil(c.startDate);
        return d >= -7 && d <= 21;
      }),
    [campaigns],
  );

  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const scheduledCount = campaigns.filter((c) => c.status === "scheduled").length;

  // Combined 30–90 day timeline of real dated items.
  const timeline = useMemo(() => {
    const opp = scoped
      .filter((o) => o.daysUntil >= 0 && o.daysUntil <= 90 && o.state !== "cancelled")
      .map((o) => ({
        id: `opp-${o.id}`,
        date: o.daysUntil,
        title: o.event.name,
        kind: "opportunity" as const,
      }));
    const cmp = campaigns
      .map((c) => ({ c, d: daysUntil(c.startDate) }))
      .filter(({ d }) => d >= 0 && d <= 90)
      .map(({ c, d }) => ({
        id: `cmp-${c.id}`,
        date: d,
        title: c.name,
        kind: "campaign" as const,
      }));
    return [...opp, ...cmp].sort((a, b) => a.date - b.date).slice(0, 8);
  }, [scoped, campaigns]);

  const recentActivity = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 5),
    [campaigns],
  );

  const attentionCount = urgent.length + campaignsToPrepare.length;
  const enabledCountriesCount = enabledCountryCodes.length;

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${store.name}`}
        description={buildSummary(attentionCount, urgent.length, campaignsToPrepare.length)}
        actions={
          <>
            <CountrySelector value={country} onChange={setCountry} />
            <Button onClick={openBlank}>
              <Plus className="h-4 w-4" />
              Create campaign
            </Button>
          </>
        }
      />

      {/* Primary actions */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <ActionTile to="/app/opportunities" icon={Sparkles} label="Explore opportunities" />
        <ActionTile onClick={openBlank} icon={Megaphone} label="Create campaign" />
        <ActionTile to="/app/calendar" icon={CalendarRange} label="Open calendar" />
        <ActionTile to="/app/content" icon={FileText} label="Add content" />
        <ActionTile to="/app/analytics" icon={BarChart3} label="Review results" />
      </div>

      {/* KPI cards — real counts only */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          to="/app/opportunities"
          label="Upcoming opportunities"
          value={scoped.filter((o) => o.daysUntil >= 0).length}
          rows={[
            ["New", counts.new],
            ["Verified", counts.verified],
            ["Modified", counts.modified],
          ]}
        />
        <Kpi
          to="/app/campaigns"
          label="Campaigns"
          value={campaigns.length}
          rows={[
            ["Active", activeCount],
            ["Scheduled", scheduledCount],
            ["To prepare", campaignsToPrepare.length],
          ]}
        />
        <Kpi
          to="/app/countries"
          label="Active countries"
          value={enabledCountriesCount}
          rows={[["In catalog", countries.length]]}
          hint={plan.countryLimit == null ? "Unlimited on plan" : `${plan.countryLimit} allowed`}
        />
        <Kpi
          to="/app/billing"
          label="Plan & capacity"
          value={plan.name}
          rows={[
            ["Horizon", `${plan.planningHorizonMonths} mo`],
            ["Saved campaigns", plan.savedCampaignLimit == null ? "∞" : plan.savedCampaignLimit],
          ]}
          hint="AI usage & storage — not connected"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Needs attention */}
          <Panel
            title="Needs attention"
            subtitle="Only what matters — urgent opportunities and campaigns to prepare"
          >
            {attentionCount === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing urgent right now"
                description="No opportunities are inside their prep window and no campaigns are due this week. Explore opportunities to plan ahead."
                action={
                  <Link to="/app/opportunities">
                    <Button variant="secondary">Explore opportunities</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {urgent.slice(0, 4).map((o) => (
                  <AttentionRow
                    key={o.id}
                    tone="red"
                    what={o.event.name}
                    why={`Urgent · prep window open · ${relDays(o.daysUntil)}`}
                    onAction={() => openForEvent(o.event, o.year)}
                    actionLabel="Create campaign"
                    badge={<ScoreBadge score={o.score} size="sm" />}
                  />
                ))}
                {campaignsToPrepare.slice(0, 4).map((c) => (
                  <AttentionRow
                    key={c.id}
                    tone="amber"
                    what={c.name}
                    why={`${c.status === "draft" ? "Draft" : "Scheduled"} · starts ${relDays(daysUntil(c.startDate))}`}
                    to={`/app/campaigns?c=${c.id}`}
                    actionLabel="Open"
                    badge={<Badge tone="amber">Prepare</Badge>}
                  />
                ))}
              </ul>
            )}
          </Panel>

          {/* Recommended for today */}
          <Panel
            title="Recommended for today"
            subtitle="Highest-scoring opportunities you haven't acted on"
            aside={<Badge tone="gray">Rules-based · AI not connected</Badge>}
          >
            {recommended.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No recommendations yet"
                description="Enable more countries or wait for upcoming events to appear inside your plan horizon."
                action={
                  <Link to="/app/countries">
                    <Button variant="secondary">Manage countries</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recommended.map((o) => (
                  <RecommendationCard
                    key={o.id}
                    opp={o}
                    onCreate={() => openForEvent(o.event, o.year)}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          {/* Next 30–90 days */}
          <Panel title="Next 30–90 days" subtitle="Upcoming events & campaigns">
            {timeline.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-ink-muted">
                Nothing scheduled in the next 90 days yet.
              </p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {timeline.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-[10px] font-semibold",
                        t.kind === "campaign"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-surface-2 text-ink-muted",
                      )}
                    >
                      <span>{t.date}d</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{t.title}</p>
                      <p className="text-xs text-ink-faint capitalize">{t.kind}</p>
                    </div>
                    <Clock className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          {/* Recent activity */}
          <Panel title="Recent activity" subtitle="Your latest changes">
            {recentActivity.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-ink-muted">
                No activity yet. Create your first campaign to get started.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentActivity.map((c) => (
                  <li key={c.id} className="flex items-center gap-2.5">
                    <Megaphone className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">
                        <Link to={`/app/campaigns?c=${c.id}`} className="hover:text-white">
                          {c.name}
                        </Link>
                      </p>
                      <p className="text-xs text-ink-faint">Updated {formatWhen(c.updatedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <CampaignFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={initialValues}
      />
    </div>
  );
}

function buildSummary(attention: number, urgent: number, prep: number): string {
  if (attention === 0) {
    return "You're all caught up. Explore the opportunities Eventra found and turn the best ones into campaigns.";
  }
  const parts: string[] = [];
  if (urgent > 0) parts.push(`${urgent} opportunit${urgent === 1 ? "y" : "ies"} that need attention`);
  if (prep > 0) parts.push(`${prep} campaign${prep === 1 ? "" : "s"} to prepare soon`);
  return `Today you have ${parts.join(" and ")}.`;
}

function formatWhen(iso: string): string {
  const d = daysUntil(iso);
  return relDays(d);
}

function ActionTile({
  to,
  onClick,
  icon: Icon,
  label,
}: {
  to?: string;
  onClick?: () => void;
  icon: typeof Sparkles;
  label: string;
}) {
  const inner = (
    <span className="flex h-full flex-col items-start gap-2 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-brand-300 hover:bg-surface-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium text-ink">{label}</span>
    </span>
  );
  if (to) return <Link to={to} className="block h-full">{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="block h-full text-left">
      {inner}
    </button>
  );
}

function Kpi({
  to,
  label,
  value,
  rows,
  hint,
}: {
  to: string;
  label: string;
  value: string | number;
  rows: Array<[string, string | number]>;
  hint?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand-300"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <ChevronRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-brand-700" />
      </div>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <dt className="text-ink-faint">{k}</dt>
            <dd className="font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {hint ? <p className="mt-1 text-[11px] text-ink-faint">{hint}</p> : null}
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface">
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p> : null}
        </div>
        {aside}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function AttentionRow({
  tone,
  what,
  why,
  onAction,
  to,
  actionLabel,
  badge,
}: {
  tone: "red" | "amber";
  what: string;
  why: string;
  onAction?: () => void;
  to?: string;
  actionLabel: string;
  badge?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
      <AlertTriangle
        className={cn("h-4 w-4 shrink-0", tone === "red" ? "text-err" : "text-warn")}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{what}</p>
        <p className="truncate text-xs text-ink-muted">{why}</p>
      </div>
      {badge}
      {to ? (
        <Link to={to}>
          <Button variant="secondary" size="sm">{actionLabel}</Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </li>
  );
}

function RecommendationCard({
  opp,
  onCreate,
}: {
  opp: ScoredOpportunity;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{opp.event.name}</p>
          <p className="text-xs text-ink-muted">{relDays(opp.daysUntil)} · {opp.reachCodes.length} market{opp.reachCodes.length === 1 ? "" : "s"}</p>
        </div>
        <ScoreBadge score={opp.score} size="sm" />
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-faint capitalize">{opp.difficulty} · {opp.reliability}% reliable</span>
        <Button size="sm" onClick={onCreate}>Create campaign</Button>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
