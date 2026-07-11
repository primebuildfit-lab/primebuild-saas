import { Globe, CalendarClock, Megaphone, CalendarRange } from "lucide-react";
import { StatTile } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { upcomingOpportunities } from "~/lib/planning";

/** Top-of-dashboard KPI row. */
export function DashboardStats() {
  const {
    enabledCountryCodes,
    globalEvents,
    eventPreferences,
    campaigns,
    plan,
  } = useData();

  const opportunities = upcomingOpportunities({
    globalEvents,
    enabledCodes: enabledCountryCodes,
    prefs: eventPreferences,
    campaigns,
    horizonMonths: plan.planningHorizonMonths,
  });

  const activeCount = campaigns.filter(
    (c) => c.status === "active" || c.status === "scheduled",
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        label="Active countries"
        value={enabledCountryCodes.length}
        icon={Globe}
        hint={
          enabledCountryCodes
            .map((c) => getCountry(c)?.name ?? c)
            .join(", ") || "None enabled"
        }
      />
      <StatTile
        label="Upcoming opportunities"
        value={opportunities.length}
        icon={CalendarClock}
        hint={`Within ${plan.planningHorizonMonths} months`}
      />
      <StatTile
        label="Active & scheduled"
        value={activeCount}
        icon={Megaphone}
        hint={`${campaigns.length} campaigns total`}
      />
      <StatTile
        label="Current plan"
        value={plan.name}
        icon={CalendarRange}
        hint={`Plan ${plan.planningHorizonMonths} months ahead`}
      />
    </div>
  );
}
