import { Globe, Megaphone, CalendarRange } from "lucide-react";
import { Card, CardContent, Badge } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { formatPrice, formatLimitValue } from "~/lib/format";

/** Current subscription + plan-usage overview (billing view). */
export function BillingSummary() {
  const { plan, subscription, enabledCountryCodes, campaigns } = useData();

  const usage = [
    {
      icon: Globe,
      label: "Countries",
      value: `${enabledCountryCodes.length} / ${formatLimitValue(plan.countryLimit)}`,
    },
    {
      icon: Megaphone,
      label: "Saved campaigns",
      value: `${campaigns.length} / ${formatLimitValue(plan.savedCampaignLimit)}`,
    },
    {
      icon: CalendarRange,
      label: "Planning horizon",
      value: `${plan.planningHorizonMonths} months`,
    },
  ];

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                {plan.name} plan
              </h2>
              <Badge tone={subscription.status === "active" ? "green" : "amber"}>
                {subscription.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {formatPrice(plan.priceMonthly)} · working price (no live billing in V1)
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {usage.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="text-center sm:text-right">
                  <p className="flex items-center justify-center gap-1 text-xs text-gray-400 sm:justify-end">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
