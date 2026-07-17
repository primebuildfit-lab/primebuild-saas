import type { Campaign, Country } from "~/types/domain";
import type { ScoredOpportunity } from "~/lib/opportunities";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";
import { humanizeCategory } from "~/lib/format";
import { PRIORITY_LABEL, STATE_LABEL } from "~/features/opportunities/opportunityLabels";

/**
 * Analytics builder core (Business UI reorg). Instead of fixed charts, the user
 * composes a report by choosing a dimension (X) and a measure (Y). This module
 * holds the pure grouping logic so the builder is testable and so every series is
 * derived from the same campaign/opportunity data the rest of the app uses.
 *
 * This is the V1 architecture — a small, honest set of dimensions/measures that
 * later expands without changing component contracts.
 */

export type AnalyticsDimension =
  | "campaign_status"
  | "country"
  | "opportunity_category"
  | "opportunity_priority"
  | "opportunity_state";

export type AnalyticsMeasure = "count" | "avg_score";

export interface DimensionDef {
  value: AnalyticsDimension;
  label: string;
  /** which entity this dimension groups */
  entity: "campaign" | "opportunity";
}

export interface MeasureDef {
  value: AnalyticsMeasure;
  label: string;
}

export const DIMENSIONS: DimensionDef[] = [
  { value: "campaign_status", label: "Campaign status", entity: "campaign" },
  { value: "country", label: "Country", entity: "opportunity" },
  { value: "opportunity_category", label: "Opportunity category", entity: "opportunity" },
  { value: "opportunity_priority", label: "Opportunity priority", entity: "opportunity" },
  { value: "opportunity_state", label: "Opportunity status", entity: "opportunity" },
];

export const MEASURES: MeasureDef[] = [
  { value: "count", label: "Count" },
  { value: "avg_score", label: "Avg. opportunity score" },
];

export interface SeriesPoint {
  label: string;
  value: number;
}

function dimensionOf(d: AnalyticsDimension): DimensionDef {
  return DIMENSIONS.find((x) => x.value === d) ?? DIMENSIONS[0];
}

/** Is a measure meaningful for a dimension? avg_score needs opportunities. */
export function measureApplies(
  dimension: AnalyticsDimension,
  measure: AnalyticsMeasure,
): boolean {
  if (measure === "avg_score") return dimensionOf(dimension).entity === "opportunity";
  return true;
}

function groupCampaigns(
  dimension: AnalyticsDimension,
  campaigns: Campaign[],
  countries: Country[],
): SeriesPoint[] {
  if (dimension === "campaign_status") {
    return CAMPAIGN_STATUSES.map((s) => ({
      label: CAMPAIGN_STATUS_LABEL[s],
      value: campaigns.filter((c) => c.status === s).length,
    }));
  }
  // country
  const points = countries.map((c) => ({
    label: c.name,
    value: campaigns.filter((cam) => cam.country === c.code).length,
  }));
  const none = campaigns.filter((c) => !c.country).length;
  return none ? [...points, { label: "No country", value: none }] : points;
}

function keyForOpportunity(
  dimension: AnalyticsDimension,
  o: ScoredOpportunity,
): { key: string; label: string }[] {
  switch (dimension) {
    case "opportunity_category":
      return [{ key: o.category, label: humanizeCategory(o.category) }];
    case "opportunity_priority":
      return [{ key: o.priority, label: PRIORITY_LABEL[o.priority] }];
    case "opportunity_state":
      return [{ key: o.state, label: STATE_LABEL[o.state] }];
    case "country":
      // one point per enabled market the opportunity reaches
      return o.reachCodes.map((c) => ({ key: c, label: c }));
    default:
      return [];
  }
}

function groupOpportunities(
  dimension: AnalyticsDimension,
  measure: AnalyticsMeasure,
  opportunities: ScoredOpportunity[],
  countries: Country[],
): SeriesPoint[] {
  const buckets = new Map<string, { label: string; sum: number; count: number }>();
  for (const o of opportunities) {
    for (const { key, label } of keyForOpportunity(dimension, o)) {
      const display =
        dimension === "country"
          ? countries.find((c) => c.code === key)?.name ?? label
          : label;
      const b = buckets.get(key) ?? { label: display, sum: 0, count: 0 };
      b.sum += o.score;
      b.count += 1;
      buckets.set(key, b);
    }
  }
  return [...buckets.values()].map((b) => ({
    label: b.label,
    value:
      measure === "avg_score"
        ? b.count
          ? Math.round(b.sum / b.count)
          : 0
        : b.count,
  }));
}

/** Build a report series from the chosen dimension + measure. */
export function buildSeries(params: {
  dimension: AnalyticsDimension;
  measure: AnalyticsMeasure;
  campaigns: Campaign[];
  opportunities: ScoredOpportunity[];
  countries: Country[];
}): SeriesPoint[] {
  const { dimension, measure, campaigns, opportunities, countries } = params;
  const def = dimensionOf(dimension);
  const effectiveMeasure = measureApplies(dimension, measure) ? measure : "count";
  if (def.entity === "campaign") {
    return groupCampaigns(dimension, campaigns, countries);
  }
  return groupOpportunities(dimension, effectiveMeasure, opportunities, countries);
}
