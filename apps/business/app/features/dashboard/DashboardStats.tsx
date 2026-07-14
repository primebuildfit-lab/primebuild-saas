import { useMemo } from "react";
import { Globe, Sparkles, Megaphone, CreditCard } from "lucide-react";
import { MetricCard, type MetricStat } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { parseISO, startOfDay } from "date-fns";
import { formatLimitValue } from "~/lib/format";
import {
  buildOpportunities,
  countByState,
  urgentOpportunities,
} from "~/lib/opportunities";

/**
 * Dashboard control-center KPI row. Four cards, each a doorway into its module:
 * Countries, Opportunities, Campaigns, Plan. Every number is derived from the
 * shared engines (opportunity scoring, plan entitlements) so the dashboard and
 * the destination screens always agree.
 */
export function DashboardStats() {
  const {
    countries,
    enabledCountryCodes,
    globalEvents,
    eventPreferences,
    campaigns,
    plan,
  } = useData();

  const opps = useMemo(
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

  const oppCounts = countByState(opps);
  const urgent = urgentOpportunities(opps).length;
  const withinPlan = opps.filter((o) => o.withinPlanHorizon).length;

  const today = startOfDay(new Date());
  const preparing = campaigns.filter((c) => c.status === "draft").length;
  const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const overdue = campaigns.filter(
    (c) =>
      (c.status === "draft" || c.status === "scheduled") &&
      parseISO(c.startDate) < today,
  ).length;

  const catalogCount = countries.length;
  const coverage = catalogCount
    ? Math.round((enabledCountryCodes.length / catalogCount) * 100)
    : 0;

  const countryStats: MetricStat[] = [
    { label: "Available", value: catalogCount },
    { label: "Coverage", value: `${coverage}%`, tone: "brand" },
  ];

  const oppStats: MetricStat[] = [
    { label: "Urgent", value: urgent, tone: urgent ? "red" : "gray" },
    { label: "New", value: oppCounts.new, tone: oppCounts.new ? "green" : "gray" },
    { label: "Verified", value: oppCounts.verified },
    { label: "Modified", value: oppCounts.modified, tone: "amber" },
  ];

  const campaignStats: MetricStat[] = [
    { label: "Preparing", value: preparing },
    { label: "Scheduled", value: scheduled },
    { label: "Active", value: active, tone: active ? "green" : "gray" },
    { label: "Overdue", value: overdue, tone: overdue ? "red" : "gray" },
  ];

  const planStats: MetricStat[] = [
    { label: "Horizon", value: `${plan.planningHorizonMonths}mo` },
    {
      label: "Countries",
      value: `${enabledCountryCodes.length}/${formatLimitValue(plan.countryLimit)}`,
    },
    {
      label: "Campaigns",
      value: `${campaigns.length}/${formatLimitValue(plan.savedCampaignLimit)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Active countries"
        value={enabledCountryCodes.length}
        icon={Globe}
        to="/app/countries"
        stats={countryStats}
        footer={<CoverageBar percent={coverage} />}
      />
      <MetricCard
        label="Upcoming opportunities"
        value={withinPlan}
        icon={Sparkles}
        to="/app/opportunities"
        hint={`Within your ${plan.planningHorizonMonths}-month horizon`}
        stats={oppStats}
      />
      <MetricCard
        label="Campaigns"
        value={campaigns.length}
        icon={Megaphone}
        to="/app/campaigns"
        stats={campaignStats}
      />
      <MetricCard
        label="Current plan"
        value={plan.name}
        icon={CreditCard}
        to="/app/billing"
        hint="Capacity & limits"
        stats={planStats}
      />
    </div>
  );
}

function CoverageBar({ percent }: { percent: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Market coverage"
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
