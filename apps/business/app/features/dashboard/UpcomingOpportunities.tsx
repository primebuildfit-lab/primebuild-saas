import { Link } from "react-router";
import { CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  ColorDot,
  EmptyState,
} from "~/components/ui";
import { getCountry } from "~/data";
import { formatDate, relativeDays } from "~/lib/dates";
import type { Opportunity } from "~/lib/planning";
import type { GlobalEvent } from "~/types/domain";
import { PrepStatusBadge } from "~/features/events/PrepStatusBadge";

interface UpcomingOpportunitiesProps {
  opportunities: Opportunity[];
  onCreateCampaign: (event: GlobalEvent, year: number) => void;
}

/** Dashboard "Upcoming Opportunities" — the answer to "what's coming?". */
export function UpcomingOpportunities({
  opportunities,
  onCreateCampaign,
}: UpcomingOpportunitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming opportunities</CardTitle>
        <Link
          to="/app/events"
          className="text-sm font-medium text-brand-700 hover:text-brand-700"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {opportunities.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming opportunities"
            description="Enable more countries or extend your planning horizon to see events."
            className="m-4 border-0 bg-transparent py-10"
          />
        ) : (
          <ul className="divide-y divide-line">
            {opportunities.map((op) => (
              <li
                key={`${op.event.id}:${op.year}`}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ColorDot importance={op.event.importance} />
                    <p className="truncate text-sm font-medium text-ink">
                      {op.event.name}
                    </p>
                    <PrepStatusBadge status={op.prepStatus} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {op.event.countryCodes
                      .map((c) => getCountry(c)?.flag ?? c)
                      .join(" ")}{" "}
                    · {formatDate(op.occurrence.startISO)} ·{" "}
                    <span className="font-medium text-ink-muted">
                      {relativeDays(op.occurrence.startISO)}
                    </span>
                  </p>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCreateCampaign(op.event, op.year)}
                  >
                    Create campaign
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
