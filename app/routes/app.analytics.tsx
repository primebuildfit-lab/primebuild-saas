import { useMemo } from "react";
import { Megaphone, CheckCircle2, CalendarClock, ShieldCheck } from "lucide-react";
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
import { upcomingOpportunities } from "~/lib/planning";
import { BarList, type BarDatum } from "~/features/analytics/BarList";

export default function AnalyticsRoute() {
  const {
    campaigns,
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    plan,
  } = useData();

  const opportunities = useMemo(
    () =>
      upcomingOpportunities({
        globalEvents,
        enabledCodes: enabledCountryCodes,
        prefs: eventPreferences,
        campaigns,
        horizonMonths: plan.planningHorizonMonths,
      }),
    [globalEvents, enabledCountryCodes, eventPreferences, campaigns, plan],
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
    {
      label: "No country",
      value: campaigns.filter((c) => !c.country).length,
    },
  ];

  const prepared = opportunities.filter(
    (o) => o.prepStatus === "ready" || o.prepStatus === "planning",
  ).length;
  const coverage = opportunities.length
    ? Math.round((prepared / opportunities.length) * 100)
    : 0;

  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="A light view of your planning activity. Deeper analytics come after V1."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total campaigns" value={campaigns.length} icon={Megaphone} />
        <StatTile label="Completed" value={completed} icon={CheckCircle2} />
        <StatTile
          label="Upcoming opportunities"
          value={opportunities.length}
          icon={CalendarClock}
        />
        <StatTile
          label="Prep coverage"
          value={`${coverage}%`}
          icon={ShieldCheck}
          hint={`${prepared} of ${opportunities.length} in progress`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
