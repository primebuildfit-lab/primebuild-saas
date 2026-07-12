import { Info } from "lucide-react";
import { PageHeader } from "~/components/ui";
import { BillingSummary } from "~/features/billing/BillingSummary";
import { PricingPlans } from "~/features/billing/PricingPlans";

export default function BillingRoute() {
  return (
    <div>
      <PageHeader
        title="Plans & billing"
        description="Choose the plan that fits how far ahead you plan and how many markets you run."
      />

      <div className="space-y-6">
        <BillingSummary />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Compare plans
          </h2>
          <PricingPlans />
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Prices are working prices and switching a plan here updates limits
            instantly for previewing. Real Shopify Billing and charges are wired in
            Phase 5 — no money moves in this version.
          </p>
        </div>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
