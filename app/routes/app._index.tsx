import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Button } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { upcomingOpportunities, preparationNeeded } from "~/lib/planning";
import type { GlobalEvent } from "~/types/domain";
import { DashboardStats } from "~/features/dashboard/DashboardStats";
import { QuickActions } from "~/features/dashboard/QuickActions";
import { UpcomingOpportunities } from "~/features/dashboard/UpcomingOpportunities";
import {
  ActiveCampaigns,
  RecentCampaigns,
} from "~/features/dashboard/DashboardCampaigns";
import { PreparationNeeded } from "~/features/dashboard/PreparationNeeded";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import {
  emptyCampaignValues,
  valuesFromEvent,
  type CampaignFormValues,
} from "~/features/campaigns/campaignModel";

export default function DashboardRoute() {
  const {
    store,
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    campaigns,
    plan,
  } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<CampaignFormValues>(() =>
    emptyCampaignValues(),
  );

  const openBlank = () => {
    setInitialValues(emptyCampaignValues());
    setModalOpen(true);
  };

  const openForEvent = (event: GlobalEvent, year: number) => {
    setInitialValues(valuesFromEvent(event, year, enabledCountryCodes[0]));
    setModalOpen(true);
  };

  const opportunities = upcomingOpportunities({
    globalEvents,
    enabledCodes: enabledCountryCodes,
    prefs: eventPreferences,
    campaigns,
    horizonMonths: plan.planningHorizonMonths,
    limit: 6,
  });

  const prepItems = preparationNeeded({
    globalEvents,
    enabledCodes: enabledCountryCodes,
    prefs: eventPreferences,
    campaigns,
    limit: 5,
  });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${store.name}`}
        description="Plan marketing events, prepare campaigns early, and reuse what works."
        actions={
          <Button onClick={openBlank}>
            <Plus className="h-4 w-4" />
            Create campaign
          </Button>
        }
      />

      <DashboardStats />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UpcomingOpportunities
            opportunities={opportunities}
            onCreateCampaign={openForEvent}
          />
          <ActiveCampaigns onCreate={openBlank} />
          <RecentCampaigns />
        </div>
        <div className="space-y-6">
          <QuickActions onCreateCampaign={openBlank} />
          <PreparationNeeded items={prepItems} onPrepare={openForEvent} />
        </div>
      </div>

      <CampaignFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={initialValues}
      />
    </div>
  );
}
