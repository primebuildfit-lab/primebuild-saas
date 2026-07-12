import { useNavigate } from "react-router";
import { Plus, EyeOff, ExternalLink, Tag, CalendarPlus } from "lucide-react";
import { Drawer, Button, Badge, ColorDot, StatusPill, EmptyState } from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { GlobalEvent } from "~/types/domain";
import { entriesForYear, entriesOnDay } from "~/lib/planning";
import { formatDate } from "~/lib/dates";
import { CategoryBadge } from "~/features/events/eventDisplay";

interface DayDetailProps {
  open: boolean;
  date: Date | null;
  onClose: () => void;
  onCreateForEvent: (event: GlobalEvent, year: number) => void;
  onCreateOnDate: (dateISO: string) => void;
}

export function DayDetail({
  open,
  date,
  onClose,
  onCreateForEvent,
  onCreateOnDate,
}: DayDetailProps) {
  const navigate = useNavigate();
  const {
    globalEvents,
    customEvents,
    campaigns,
    enabledCountryCodes,
    eventPreferences,
    hideEvent,
  } = useData();

  if (!date) {
    return (
      <Drawer open={open} onClose={onClose} title="Day">
        {null}
      </Drawer>
    );
  }

  const year = date.getFullYear();
  const entries = entriesOnDay(
    entriesForYear({
      globalEvents,
      customEvents,
      campaigns,
      enabledCodes: enabledCountryCodes,
      prefs: eventPreferences,
      year,
    }),
    date,
  );

  const dateISO = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={formatDate(dateISO)}
      description={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
      footer={
        <Button onClick={() => onCreateOnDate(dateISO)}>
          <Plus className="h-4 w-4" />
          Add campaign
        </Button>
      }
    >
      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nothing scheduled"
          description="Add a campaign or check nearby opportunities."
          className="border-0 bg-transparent"
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            if (entry.kind === "event") {
              const event = globalEvents.find((e) => e.id === entry.refId);
              if (!event) return null;
              return (
                <li
                  key={entry.key}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <ColorDot importance={event.importance} />
                    <span className="text-sm font-medium text-gray-900">
                      {event.name}
                    </span>
                    <CategoryBadge category={event.category} />
                  </div>
                  {event.description ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {event.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onCreateForEvent(event, year)}
                    >
                      Create campaign
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => hideEvent(event.id)}
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </Button>
                  </div>
                </li>
              );
            }
            if (entry.kind === "campaign") {
              const campaign = campaigns.find((c) => c.id === entry.refId);
              if (!campaign) return null;
              return (
                <li
                  key={entry.key}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </span>
                    <StatusPill status={campaign.status} />
                  </div>
                  {campaign.offer ? (
                    <div className="mt-1.5">
                      <Badge tone="green">
                        <Tag className="h-3 w-3" />
                        {campaign.offer}
                      </Badge>
                    </div>
                  ) : null}
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/app/campaigns?c=${campaign.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open campaign
                    </Button>
                  </div>
                </li>
              );
            }
            // custom event
            const custom = customEvents.find((e) => e.id === entry.refId);
            if (!custom) return null;
            return (
              <li key={entry.key} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  {custom.color ? <ColorDot color={custom.color} /> : null}
                  <span className="text-sm font-medium text-gray-900">
                    {custom.name}
                  </span>
                  <CategoryBadge category={custom.category} />
                </div>
                {custom.description ? (
                  <p className="mt-1 text-xs text-gray-500">{custom.description}</p>
                ) : null}
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate("/app/events")}
                  >
                    Manage in Events
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
