import { Globe } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function CountriesRoute() {
  return (
    <Placeholder
      title="Countries"
      description="Enable the markets you operate in."
      icon={Globe}
      gate={2}
      note="Per-store country enablement (StoreCountry) with plan limits arrives in Phase 2 — Core Planning."
    />
  );
}
