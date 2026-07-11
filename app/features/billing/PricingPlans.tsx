import { Check, Globe } from "lucide-react";
import { Button, Badge } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { formatPrice, formatLimitValue } from "~/lib/format";
import { cn } from "~/lib/cn";

/** Plan comparison grid. Switching updates the plan locally (no live payments in V1). */
export function PricingPlans() {
  const { plans, planId, setPlanId } = useData();

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {plans.map((plan) => {
        const current = plan.id === planId;
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-xl border bg-white p-5 shadow-sm",
              current ? "border-brand-400 ring-1 ring-brand-200" : "border-gray-200",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{plan.name}</h3>
              {current ? <Badge tone="brand">Current</Badge> : null}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
              {formatPrice(plan.priceMonthly)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <Globe className="h-3.5 w-3.5" />
              {formatLimitValue(plan.countryLimit)}{" "}
              {plan.countryLimit === 1 ? "country" : "countries"}
            </p>

            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <Button
                variant={current ? "secondary" : "primary"}
                disabled={current}
                onClick={() => setPlanId(plan.id)}
                className="w-full"
              >
                {current ? "Current plan" : `Switch to ${plan.name}`}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
