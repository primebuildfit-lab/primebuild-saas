import { CreditCard } from "lucide-react";
import { Placeholder } from "~/components/Placeholder";

export default function BillingRoute() {
  return (
    <Placeholder
      title="Billing"
      description="Free, Starter, Growth, and VIP plans."
      icon={CreditCard}
      gate={4}
      note="The subscription/pricing UI arrives in Phase 4 (no live payments). Real Shopify Billing is wired in Phase 5."
    />
  );
}
