import { Calendar } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function CalendarRoute() {
  return (
    <Placeholder
      title="Calendar"
      description="Year and month planning views."
      icon={Calendar}
      gate={2}
      note="Year view, month view with drag-to-move events, and day details arrive in Phase 2 — Core Planning."
    />
  );
}
