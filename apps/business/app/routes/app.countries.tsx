import { PageHeader } from "~/components/ui";
import { CountryInsights } from "~/features/countries/CountryInsights";
import { CountryManager } from "~/features/countries/CountryManager";

export default function CountriesRoute() {
  return (
    <div>
      <PageHeader
        title="Countries"
        description="Your markets — coverage, the opportunities each unlocks, and the campaigns running in them. Enable a country to plan for it."
      />
      <div className="space-y-8">
        <CountryInsights />
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Manage markets</h2>
          <CountryManager />
        </div>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
