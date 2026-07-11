import { Library } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function CampaignLibraryRoute() {
  return (
    <Placeholder
      title="Campaign Library"
      description="Reuse what worked — your marketing memory."
      icon={Library}
      gate={3}
      note="Saved campaigns and non-destructive reuse (Campaign Memory) arrive in Phase 3 — Campaign Memory."
    />
  );
}
