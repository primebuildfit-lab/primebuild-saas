import { CalendarClock } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function EventsRoute() {
  return (
    <Placeholder
      title="Events"
      description="Official date catalog and your custom events."
      icon={CalendarClock}
      gate={2}
      note="The events catalog and the Event Creator (the core feature) arrive in Phase 2 — Core Planning."
    />
  );
}
