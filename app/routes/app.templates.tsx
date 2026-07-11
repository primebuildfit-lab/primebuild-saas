import { LayoutTemplate } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function TemplatesRoute() {
  return (
    <Placeholder
      title="Templates"
      description="Reusable campaign structures."
      icon={LayoutTemplate}
      gate={3}
      note="Template duplication arrives in Phase 3 — Campaign Memory. Advanced templates are plan-gated later."
    />
  );
}
