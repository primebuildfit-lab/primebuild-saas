import { ShieldCheck } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function AdminRoute() {
  return (
    <Placeholder
      title="Admin"
      description="Platform management of countries and official events."
      icon={ShieldCheck}
      gate={4}
      note="Admin management of the country catalog and official events arrives in Phase 4 — Platform Surfaces."
    />
  );
}
