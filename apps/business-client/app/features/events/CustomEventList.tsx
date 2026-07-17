import { useState } from "react";
import { Pencil, Trash2, Repeat, CalendarPlus } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  ColorDot,
  EmptyState,
  ConfirmDialog,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { formatDateRange } from "~/lib/dates";
import { CategoryBadge } from "./eventDisplay";

interface CustomEventListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

/** Merchant-created events — editable and deletable (unlike official events). */
export function CustomEventList({ onEdit, onCreate }: CustomEventListProps) {
  const { customEvents, deleteCustomEvent } = useData();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (customEvents.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No custom events yet"
        description="Add store-specific dates like anniversaries, launches, or clearance days."
        action={<Button onClick={onCreate}>Create custom event</Button>}
      />
    );
  }

  const pending = customEvents.find((e) => e.id === confirmId);

  return (
    <div className="space-y-2">
      {customEvents.map((event) => (
        <Card key={event.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {event.color ? <ColorDot color={event.color} /> : null}
                <h3 className="text-sm font-semibold text-ink">
                  {event.name}
                </h3>
                <CategoryBadge category={event.category} />
                {event.recurring ? (
                  <Badge tone="blue">
                    <Repeat className="h-3 w-3" />
                    Repeats
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {formatDateRange(event.startDate, event.endDate ?? event.startDate)}
              </p>
              {event.description ? (
                <p className="mt-1 text-sm text-ink-muted">{event.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(event.id)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmId(event.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => pending && deleteCustomEvent(pending.id)}
        title="Delete custom event"
        message={`Delete "${pending?.name}"? This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
