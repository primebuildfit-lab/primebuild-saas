import { useMemo } from "react";
import { Globe, Sparkles, Megaphone, Layers } from "lucide-react";
import { StatTile, DataTable, ScoreBadge, type Column } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { buildOpportunities } from "~/lib/opportunities";
import { humanizeCategory } from "~/lib/format";

interface CountryRow {
  code: string;
  name: string;
  flag: string;
  opportunities: number;
  campaigns: number;
  avgScore: number;
  topCategory: string;
}

/**
 * Countries becomes an insight surface, not just an on/off list: per enabled
 * market it shows discovered opportunities, campaigns, average score, and the
 * dominant opportunity category — so coverage decisions are informed. Derived
 * from the opportunity engine + campaigns.
 */
export function CountryInsights() {
  const {
    countries,
    enabledCountryCodes,
    globalEvents,
    eventPreferences,
    campaigns,
    plan,
  } = useData();

  const rows = useMemo<CountryRow[]>(() => {
    const opps = buildOpportunities({
      globalEvents,
      enabledCodes: enabledCountryCodes,
      prefs: eventPreferences,
      campaigns,
      planHorizonMonths: plan.planningHorizonMonths,
    });
    return enabledCountryCodes.map((code) => {
      const forCountry = opps.filter((o) => o.reachCodes.includes(code));
      const avg = forCountry.length
        ? Math.round(forCountry.reduce((s, o) => s + o.score, 0) / forCountry.length)
        : 0;
      const catCounts = new Map<string, number>();
      for (const o of forCountry) {
        catCounts.set(o.category, (catCounts.get(o.category) ?? 0) + 1);
      }
      const topCategory =
        [...catCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      const c = getCountry(code);
      return {
        code,
        name: c?.name ?? code,
        flag: c?.flag ?? "",
        opportunities: forCountry.length,
        campaigns: campaigns.filter((cam) => cam.country === code).length,
        avgScore: avg,
        topCategory: topCategory === "—" ? "—" : humanizeCategory(topCategory),
      };
    });
  }, [enabledCountryCodes, globalEvents, eventPreferences, campaigns, plan]);

  const totalOpps = rows.reduce((s, r) => s + r.opportunities, 0);
  const totalCampaigns = rows.reduce((s, r) => s + r.campaigns, 0);
  const coverage = countries.length
    ? Math.round((enabledCountryCodes.length / countries.length) * 100)
    : 0;

  const columns: Column<CountryRow>[] = [
    {
      key: "name",
      header: "Market",
      cell: (r) => (
        <span className="font-medium text-ink">
          {r.flag} {r.name}
        </span>
      ),
    },
    {
      key: "opps",
      header: "Opportunities",
      align: "right",
      cell: (r) => <span className="tabular-nums text-ink">{r.opportunities}</span>,
    },
    {
      key: "avg",
      header: "Avg. score",
      align: "center",
      cell: (r) => <ScoreBadge score={r.avgScore} size="sm" />,
    },
    {
      key: "campaigns",
      header: "Campaigns",
      align: "right",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-ink">{r.campaigns}</span>,
    },
    {
      key: "category",
      header: "Top category",
      hideOnMobile: true,
      cell: (r) => <span className="text-sm text-ink-muted">{r.topCategory}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active markets" value={enabledCountryCodes.length} icon={Globe} />
        <StatTile label="Coverage" value={`${coverage}%`} icon={Layers} hint={`of ${countries.length} in catalog`} />
        <StatTile label="Opportunities" value={totalOpps} icon={Sparkles} />
        <StatTile label="Campaigns" value={totalCampaigns} icon={Megaphone} />
      </div>
      {rows.length > 0 ? (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.code} />
      ) : null}
    </div>
  );
}
