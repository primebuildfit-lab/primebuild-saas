import { Info, Gift, Sparkles } from "lucide-react";
import { PageHeader } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { BillingSummary } from "~/features/billing/BillingSummary";
import { PricingPlans } from "~/features/billing/PricingPlans";

export default function BillingRoute() {
  const { plan } = useData();
  const isFree = plan.id === "free";

  return (
    <div>
      <PageHeader
        title="Plans & billing"
        description="Choose the plan that fits how far ahead you plan and how many markets you run."
      />

      <div className="space-y-6">
        {/* Trial / free-plan status — honest: no charge happens in this version. */}
        {isFree ? (
          <div className="flex items-start gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3">
            <Gift className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
            <div className="text-sm">
              <p className="font-semibold text-ink">You’re on the Free plan</p>
              <p className="mt-0.5 text-ink-muted">
                Choose a paid plan below to start a <strong className="text-ink">45-day free trial</strong> —
                you won’t be charged until the trial ends.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div className="text-sm">
              <p className="font-semibold text-ink">45-day free trial on the {plan.name} plan</p>
              <p className="mt-0.5 text-ink-muted">
                No charge until your trial ends. You can change or cancel anytime.
              </p>
            </div>
          </div>
        )}

        <BillingSummary />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Compare plans</h2>
          <PricingPlans />
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Prices are working prices and switching a plan here updates limits instantly for previewing. Real
            Shopify Billing and charges are wired in a later phase — no money moves in this version.
          </p>
        </div>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
