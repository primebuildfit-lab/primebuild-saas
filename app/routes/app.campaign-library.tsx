import { PageHeader } from "~/components/ui";
import { CampaignLibrary } from "~/features/library/CampaignLibrary";

export default function CampaignLibraryRoute() {
  return (
    <div>
      <PageHeader
        title="Campaign Library"
        description="Your marketing memory — every campaign you've run, grouped by opportunity and ready to reuse."
      />
      <CampaignLibrary />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
