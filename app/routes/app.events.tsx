import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Button, Tabs } from "~/components/ui";
import type { GlobalEvent } from "~/types/domain";
import { useData } from "~/context/DataContext";
import { EventCatalog } from "~/features/events/EventCatalog";
import { CustomEventList } from "~/features/events/CustomEventList";
import { CustomEventFormModal } from "~/features/events/CustomEventFormModal";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import {
  emptyCampaignValues,
  valuesFromEvent,
  type CampaignFormValues,
} from "~/features/campaigns/campaignModel";

export default function EventsRoute() {
  const { enabledCountryCodes } = useData();
  const [tab, setTab] = useState("official");

  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignValues, setCampaignValues] = useState<CampaignFormValues>(() =>
    emptyCampaignValues(),
  );

  const [eventModal, setEventModal] = useState(false);
  const [editEventId, setEditEventId] = useState<string | undefined>(undefined);

  const createCampaignForEvent = (event: GlobalEvent, year: number) => {
    setCampaignValues(valuesFromEvent(event, year, enabledCountryCodes[0]));
    setCampaignModal(true);
  };

  const openCreateEvent = () => {
    setEditEventId(undefined);
    setEventModal(true);
  };

  const openEditEvent = (id: string) => {
    setEditEventId(id);
    setEventModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Browse official opportunities and manage your own store events."
        actions={
          <Button onClick={openCreateEvent}>
            <Plus className="h-4 w-4" />
            New event
          </Button>
        }
      />

      <Tabs
        className="mb-4"
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "official", label: "Official events" },
          { value: "custom", label: "My events" },
        ]}
      />

      {tab === "official" ? (
        <EventCatalog onCreateCampaign={createCampaignForEvent} />
      ) : (
        <CustomEventList onEdit={openEditEvent} onCreate={openCreateEvent} />
      )}

      <CampaignFormModal
        open={campaignModal}
        onClose={() => setCampaignModal(false)}
        initialValues={campaignValues}
      />
      <CustomEventFormModal
        open={eventModal}
        onClose={() => setEventModal(false)}
        eventId={editEventId}
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
