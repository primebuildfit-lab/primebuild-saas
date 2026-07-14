import { useMemo } from "react";
import { Megaphone, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";
import { buildOpportunities } from "~/lib/opportunities";
import { BarList, type BarDatum } from "~/features/analytics/BarList";
import { AnalyticsBuilder } from "~/features/analytics/AnalyticsBuilder";

export default function AnalyticsRoute() {
  const {
    campaigns,
    countries,
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    plan,
  } = useData();

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

  const enabledCountries = useMemo(
    () => countries.filter((c) => enabledCountryCodes.includes(c.code)),
    [countries, enabledCountryCodes],
  );

  const byStatus: BarDatum[] = CAMPAIGN_STATUSES.map((s) => ({
    label: CAMPAIGN_STATUS_LABEL[s],
    value: campaigns.filter((c) => c.status === s).length,
  }));

  const byCountry: BarDatum[] = [
    ...enabledCountryCodes.map((code) => ({
      label: getCountry(code)?.name ?? code,
      value: campaigns.filter((c) => c.country === code).length,
    })),
    { label: "No country", value: campaigns.filter((c) => !c.country).length },
  ];

  const withinPlan = opportunities.filter((o) => o.withinPlanHorizon).length;
  const prepared = opportunities.filter((o) => o.hasCampaign).length;
  const coverage = opportunities.length
    ? Math.round((prepared / opportunities.length) * 100)
    : 0;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Build your own view. Pick a dimension and a measure to see how opportunities and campaigns break down — the foundation for deeper analytics."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total campaigns" value={campaigns.length} icon={Megaphone} />
        <StatTile label="Completed" value={completed} icon={CheckCircle2} />
        <StatTile label="Opportunities (plan)" value={withinPlan} icon={Sparkles} />
        <StatTile
          label="Acted-on coverage"
          value={`${coverage}%`}
          icon={ShieldCheck}
          hint={`${prepared} of ${opportunities.length} linked to a campaign`}
        />
      </div>

      {/* Conversions — honest: no tracking source connected yet */}
      <div className="mt-6 rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Conversions & revenue</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-muted">
            Not connected
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          No conversion source is connected yet, so Eventra doesn&apos;t show CTR, conversion rate, sales or
          revenue — it never invents them. Connect Shopify Analytics to measure how your advertisements and
          campaigns perform.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["Conversions", "Conversion rate", "Sales", "Revenue"].map((m) => (
            <div key={m} className="rounded-lg border border-dashed border-line bg-surface-2 px-3 py-2.5">
              <p className="text-xs text-ink-faint">{m}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink-faint">—</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Report builder</h2>
        <AnalyticsBuilder
          campaigns={campaigns}
          opportunities={opportunities}
          countries={enabledCountries}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns by status</CardTitle>
            </CardHeader>
            <CardContent>
              <BarList data={byStatus} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Campaigns by country</CardTitle>
            </CardHeader>
            <CardContent>
              <BarList data={byCountry} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
