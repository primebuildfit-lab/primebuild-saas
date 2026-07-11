import { Megaphone } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function CampaignsRoute() {
  return (
    <Placeholder
      title="Campaigns"
      description="Create, edit, and track your marketing campaigns."
      icon={Megaphone}
      gate={3}
      note="Full campaign CRUD, status lifecycle, and product attachment arrive in Phase 3 — Campaign Memory."
    />
  );
}
