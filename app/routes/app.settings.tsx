import { Settings } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function SettingsRoute() {
  return (
    <Placeholder
      title="Settings"
      description="Account, calendar, appearance, and billing preferences."
      icon={Settings}
      gate={4}
      note="Account, calendar, appearance, and billing settings arrive in Phase 4 — Platform Surfaces."
    />
  );
}
