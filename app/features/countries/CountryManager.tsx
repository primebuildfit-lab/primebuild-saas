import { Link } from "react-router";
import { Globe, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  Toggle,
  Badge,
  LinkButton,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { formatLimitValue } from "~/lib/format";
import { cn } from "~/lib/cn";

/** Country management with plan-limited enablement + downgrade read-only rule. */
export function CountryManager() {
  const {
    countries,
    storeCountries,
    enabledCountryCodes,
    setCountryEnabled,
    globalEvents,
    plan,
  } = useData();

  const enabledCount = enabledCountryCodes.length;
  const limit = plan.countryLimit; // null = unlimited
  const atLimit = limit !== null && enabledCount >= limit;
  const overLimit = limit !== null && enabledCount > limit;

  const eventsForCountry = (code: string) =>
    globalEvents.filter((e) => e.countryCodes.includes(code)).length;

  const isEnabled = (code: string) =>
    storeCountries.find((sc) => sc.countryCode === code)?.enabled ?? false;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {enabledCount} of {formatLimitValue(limit)} countries enabled
            </p>
            <p className="text-xs text-gray-500">
              Your {plan.name} plan includes {formatLimitValue(limit)}{" "}
              {limit === 1 ? "country" : "countries"}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {atLimit && !overLimit ? (
              <Badge tone="amber">Limit reached</Badge>
            ) : null}
            <LinkButton variant="secondary" size="sm" to="/app/billing">
              Change plan
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      {overLimit ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You have more countries enabled than your current plan allows.
            Existing countries stay active, but you can’t add more until you{" "}
            <Link to="/app/billing" className="font-medium underline">
              upgrade
            </Link>{" "}
            or disable some. Your data is never deleted on downgrade.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {countries.map((country) => {
          const enabled = isEnabled(country.code);
          const blockEnable = !enabled && atLimit;
          return (
            <div
              key={country.code}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm",
                enabled ? "border-brand-200" : "border-gray-200",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {country.flag}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {country.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {eventsForCountry(country.code)} official events
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Toggle
                  checked={enabled}
                  disabled={blockEnable}
                  onCheckedChange={(next) =>
                    setCountryEnabled(country.code, next)
                  }
                  label={`Enable ${country.name}`}
                />
                {blockEnable ? (
                  <span className="text-[11px] text-gray-400">Upgrade to add</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <Globe className="h-3.5 w-3.5" />
        More countries are added only after their event catalog is researched and
        validated (quality over quantity).
      </p>
    </div>
  );
}
