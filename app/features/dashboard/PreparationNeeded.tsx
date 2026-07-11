import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "~/components/ui";
import { CheckCircle2 } from "lucide-react";
import { getCountry } from "~/data";
import { relativeDays } from "~/lib/dates";
import type { Opportunity } from "~/lib/planning";
import type { GlobalEvent } from "~/types/domain";

interface PreparationNeededProps {
  items: Opportunity[];
  onPrepare: (event: GlobalEvent, year: number) => void;
}

/** Events whose prep window is open but that aren't ready — nudge to act. */
export function PreparationNeeded({ items, onPrepare }: PreparationNeededProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preparation needed</CardTitle>
        {items.length > 0 ? (
          <Badge tone="amber">{items.length}</Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            You're on track — nothing needs prep right now.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((op) => (
              <li
                key={`${op.event.id}:${op.year}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {op.event.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {op.event.countryCodes
                      .map((c) => getCountry(c)?.flag ?? c)
                      .join(" ")}{" "}
                    · starts {relativeDays(op.occurrence.startISO)}
                    {op.event.recommendedLeadDays
                      ? ` · ${op.event.recommendedLeadDays}-day lead`
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPrepare(op.event, op.year)}
                >
                  Prepare
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
