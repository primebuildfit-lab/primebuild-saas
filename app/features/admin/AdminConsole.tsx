import { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  Toggle,
  Badge,
  ColorDot,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { CategoryBadge, IMPORTANCE_LABEL } from "~/features/events/eventDisplay";

/**
 * Platform-admin console for the shared catalog (countries + official events).
 * These are platform-owned (no storeId). Active-state toggles are local previews;
 * the real admin backend + persistence lands in Phase 5.
 */
export function AdminConsole() {
  const { globalEvents, countries } = useData();
  const [tab, setTab] = useState("events");
  const [inactive, setInactive] = useState<Set<string>>(new Set());

  const toggleActive = (id: string) =>
    setInactive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Platform admin — the country and official-event catalog is shared by
          every store. Merchants can hide events for themselves but can't edit
          this catalog.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "events", label: `Official events (${globalEvents.length})` },
          { value: "countries", label: `Countries (${countries.length})` },
        ]}
      />

      {tab === "events" ? (
        <Card>
          <CardHeader>
            <CardTitle>Official event catalog</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {globalEvents.map((event) => {
                const active = !inactive.has(event.id);
                return (
                  <li
                    key={event.id}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <ColorDot importance={event.importance} />
                        <span className="text-sm font-medium text-gray-900">
                          {event.name}
                        </span>
                        <CategoryBadge category={event.category} />
                        {event.recurring ? (
                          <Badge tone="blue">Recurring</Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {event.countryCodes
                          .map((c) => getCountry(c)?.flag ?? c)
                          .join(" ")}{" "}
                        · {IMPORTANCE_LABEL[event.importance]}
                        {event.recommendedLeadDays
                          ? ` · ${event.recommendedLeadDays}-day lead`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {active ? "Active" : "Inactive"}
                      </span>
                      <Toggle
                        checked={active}
                        onCheckedChange={() => toggleActive(event.id)}
                        label={`Toggle ${event.name} active`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Country catalog</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {countries.map((country) => {
                const eventCount = globalEvents.filter((e) =>
                  e.countryCodes.includes(country.code),
                ).length;
                return (
                  <li
                    key={country.code}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {country.name}
                        </p>
                        <p className="text-xs text-gray-400">{country.code}</p>
                      </div>
                    </div>
                    <Badge tone="gray">{eventCount} events</Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <Info className="h-3.5 w-3.5" />
        Full catalog editing and persistence are delivered with the admin backend
        in Phase 5.
      </p>
    </div>
  );
}
