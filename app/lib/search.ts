import type {
  Campaign,
  Country,
  CustomEvent,
  GlobalEvent,
  StoreEventPreference,
  Template,
} from "~/types/domain";
import { visibleGlobalEvents } from "~/lib/planning";
import { CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";
import { humanizeCategory } from "~/lib/format";

export type SearchKind =
  | "event"
  | "campaign"
  | "template"
  | "country"
  | "custom";

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  to: string;
}

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  results: SearchResult[];
}

const GROUP_LABEL: Record<SearchKind, string> = {
  event: "Official events",
  campaign: "Campaigns",
  template: "Templates",
  country: "Countries",
  custom: "Custom events",
};

interface SearchIndex {
  globalEvents: GlobalEvent[];
  campaigns: Campaign[];
  templates: Template[];
  countries: Country[];
  customEvents: CustomEvent[];
  enabledCodes: string[];
  prefs: StoreEventPreference[];
}

function match(haystack: (string | undefined)[], q: string): boolean {
  return haystack.some((h) => h?.toLowerCase().includes(q));
}

/**
 * Deterministic search across events, campaigns, templates, countries, and
 * custom events (roadmap: "deterministic search engine, not AI chat").
 */
export function searchAll(rawQuery: string, index: SearchIndex): SearchGroup[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const e of visibleGlobalEvents(
    index.globalEvents,
    index.enabledCodes,
    index.prefs,
  )) {
    if (match([e.name, e.description, humanizeCategory(e.category)], q)) {
      results.push({
        id: e.id,
        kind: "event",
        title: e.name,
        subtitle: `${humanizeCategory(e.category)} · ${e.countryCodes.join(", ")}`,
        to: `/app/events?q=${encodeURIComponent(rawQuery)}`,
      });
    }
  }

  for (const c of index.campaigns) {
    if (match([c.name, c.objective, c.description, c.offer], q)) {
      results.push({
        id: c.id,
        kind: "campaign",
        title: c.name,
        subtitle: `${CAMPAIGN_STATUS_LABEL[c.status]}${
          c.offer ? ` · ${c.offer}` : ""
        }`,
        to: `/app/campaigns?c=${c.id}`,
      });
    }
  }

  for (const t of index.templates) {
    if (match([t.name, t.notes, t.offer], q)) {
      results.push({
        id: t.id,
        kind: "template",
        title: t.name,
        subtitle: `Template · ${humanizeCategory(t.category)}`,
        to: `/app/templates`,
      });
    }
  }

  for (const country of index.countries) {
    if (match([country.name, country.code], q)) {
      results.push({
        id: country.code,
        kind: "country",
        title: `${country.flag} ${country.name}`,
        subtitle: "Country",
        to: `/app/countries`,
      });
    }
  }

  for (const ev of index.customEvents) {
    if (match([ev.name, ev.description], q)) {
      results.push({
        id: ev.id,
        kind: "custom",
        title: ev.name,
        subtitle: "Custom event",
        to: `/app/events`,
      });
    }
  }

  const order: SearchKind[] = [
    "event",
    "campaign",
    "template",
    "custom",
    "country",
  ];
  return order
    .map((kind) => ({
      kind,
      label: GROUP_LABEL[kind],
      results: results.filter((r) => r.kind === kind),
    }))
    .filter((g) => g.results.length > 0);
}

export function countResults(groups: SearchGroup[]): number {
  return groups.reduce((sum, g) => sum + g.results.length, 0);
}
