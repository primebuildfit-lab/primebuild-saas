import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search as SearchIcon,
  CalendarClock,
  Megaphone,
  LayoutTemplate,
  Globe,
  CalendarPlus,
  type LucideIcon,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TextInput,
  EmptyState,
  Skeleton,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { searchAll, countResults, type SearchKind } from "~/lib/search";

const kindIcon: Record<SearchKind, LucideIcon> = {
  event: CalendarClock,
  campaign: Megaphone,
  template: LayoutTemplate,
  country: Globe,
  custom: CalendarPlus,
};

export default function SearchRoute() {
  const {
    globalEvents,
    campaigns,
    templates,
    countries,
    customEvents,
    enabledCountryCodes,
    eventPreferences,
  } = useData();

  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  // "Searching" is derived, not stored: while the typed query differs from the
  // debounced value we are mid-debounce. This avoids a setState-in-effect.
  const searching = query !== debounced;

  // Debounced deterministic search: commit the query + sync the URL after a pause.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query);
      const next = new URLSearchParams(params);
      if (query) next.set("q", query);
      else next.delete("q");
      setParams(next, { replace: true });
    }, 180);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const groups = useMemo(
    () =>
      searchAll(debounced, {
        globalEvents,
        campaigns,
        templates,
        countries,
        customEvents,
        enabledCodes: enabledCountryCodes,
        prefs: eventPreferences,
      }),
    [
      debounced,
      globalEvents,
      campaigns,
      templates,
      countries,
      customEvents,
      enabledCountryCodes,
      eventPreferences,
    ],
  );

  const total = countResults(groups);

  return (
    <div>
      <PageHeader
        title="Search"
        description="Find events, campaigns, templates, and countries across your workspace."
      />

      <div className="relative mb-5">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything…"
          className="h-12 pl-11 text-base"
          aria-label="Search"
        />
      </div>

      {searching && query ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !debounced ? (
        <EmptyState
          icon={SearchIcon}
          title="Start typing to search"
          description="Results update as you type — searching names, offers, categories, and descriptions."
        />
      ) : total === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No results for “${debounced}”`}
          description="Try a different term, or check that the relevant country is enabled."
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const Icon = kindIcon[group.kind];
            return (
              <Card key={group.kind}>
                <CardHeader>
                  <CardTitle>{group.label}</CardTitle>
                  <span className="text-xs text-gray-400">
                    {group.results.length}
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {group.results.map((r) => (
                      <li key={`${r.kind}:${r.id}`}>
                        <Link
                          to={r.to}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-gray-900">
                              {r.title}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {r.subtitle}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
