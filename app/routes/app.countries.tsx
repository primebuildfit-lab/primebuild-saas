import { PageHeader } from "~/components/ui";
import { CountryManager } from "~/features/countries/CountryManager";

export default function CountriesRoute() {
  return (
    <div>
      <PageHeader
        title="Countries"
        description="Choose the markets you plan for. Each country unlocks its official events and opportunities."
      />
      <CountryManager />
    </div>
  );
}
