import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { PageHeader, Button, Tabs } from "~/components/ui";
import type { GlobalEvent } from "~/types/domain";
import { EventCatalog } from "~/features/events/EventCatalog";
import { CustomEventList } from "~/features/events/CustomEventList";
import { CustomEventFormModal } from "~/features/events/CustomEventFormModal";

export default function EventsRoute() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("official");

  const [eventModal, setEventModal] = useState(false);
  const [editEventId, setEditEventId] = useState<string | undefined>(undefined);

  // From an event the correct action is "Create advertisement" — jump into the
  // Promotion Builder with the event's opportunity (id = `${eventId}:${year}`).
  const createAdForEvent = (event: GlobalEvent, year: number) => {
    navigate(`/app/promotion-builder?opp=${encodeURIComponent(`${event.id}:${year}`)}`);
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
        title="Events & news"
        description="The marketing events and news for your markets. Turn any event into an advertisement, or add your own store events."
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
        <EventCatalog onCreateCampaign={createAdForEvent} />
      ) : (
        <CustomEventList onEdit={openEditEvent} onCreate={openCreateEvent} />
      )}

      <CustomEventFormModal
        open={eventModal}
        onClose={() => setEventModal(false)}
        eventId={editEventId}
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
