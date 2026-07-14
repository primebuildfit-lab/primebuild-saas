import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Field,
  Select,
  SegmentedControl,
} from "~/components/ui";
import { BarList, type BarDatum } from "./BarList";
import type { Campaign, Country } from "~/types/domain";
import type { ScoredOpportunity } from "~/lib/opportunities";
import {
  DIMENSIONS,
  MEASURES,
  buildSeries,
  measureApplies,
  type AnalyticsDimension,
  type AnalyticsMeasure,
} from "~/lib/analyticsBuilder";

type Period = "all" | "plan" | "quarter";

const PERIOD_LABEL: Record<Period, string> = {
  all: "All",
  plan: "Plan horizon",
  quarter: "Next 90 days",
};

/**
 * Report builder: pick a dimension (X), a measure (Y), and a period; the series
 * is computed live from campaigns + opportunities. The period filters the
 * opportunity set by how far out the occurrence is, so opportunity-based reports
 * respond to it. This is the V1 architecture for self-serve analytics.
 */
export function AnalyticsBuilder({
  campaigns,
  opportunities,
  countries,
}: {
  campaigns: Campaign[];
  opportunities: ScoredOpportunity[];
  countries: Country[];
}) {
  const [dimension, setDimension] = useState<AnalyticsDimension>("opportunity_category");
  const [measure, setMeasure] = useState<AnalyticsMeasure>("count");
  const [period, setPeriod] = useState<Period>("all");

  const scopedOpps = useMemo(() => {
    if (period === "all") return opportunities;
    if (period === "plan") return opportunities.filter((o) => o.withinPlanHorizon);
    return opportunities.filter((o) => o.daysUntil >= 0 && o.daysUntil <= 90);
  }, [opportunities, period]);

  const applies = measureApplies(dimension, measure);

  const data: BarDatum[] = useMemo(
    () =>
      buildSeries({
        dimension,
        measure: applies ? measure : "count",
        campaigns,
        opportunities: scopedOpps,
        countries,
      }),
    [dimension, measure, applies, campaigns, scopedOpps, countries],
  );

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Dimension (X)">
            <Select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as AnalyticsDimension)}
            >
              {DIMENSIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Measure (Y)">
            <Select
              value={measure}
              onChange={(e) => setMeasure(e.target.value as AnalyticsMeasure)}
            >
              {MEASURES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Period">
            <SegmentedControl<Period>
              size="sm"
              segments={(Object.keys(PERIOD_LABEL) as Period[]).map((p) => ({
                value: p,
                label: PERIOD_LABEL[p],
              }))}
              value={period}
              onChange={setPeriod}
              aria-label="Period"
            />
          </Field>
        </div>

        {!applies ? (
          <p className="text-xs text-amber-600">
            Average score needs an opportunity dimension — showing counts instead.
          </p>
        ) : null}

        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">
            No data for this combination.
          </p>
        ) : (
          <BarList data={data} />
        )}
      </CardContent>
    </Card>
  );
}
