import { BarChart3 } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function AnalyticsRoute() {
  return (
    <Placeholder
      title="Analytics"
      description="Lightweight planning stats."
      icon={BarChart3}
      gate={4}
      note="A light stats view arrives in Phase 4 — Platform Surfaces. Complex analytics are out of scope for V1."
    />
  );
}
