import type { EventPrepStatus } from "~/types/domain";
import { Badge, type BadgeTone } from "~/components/ui";
import { PREP_STATUS_LABEL } from "~/lib/events";

const tone: Record<EventPrepStatus, BadgeTone> = {
  unprepared: "gray",
  planning: "amber",
  ready: "green",
  passed: "gray",
};

/** Event preparation status — kept visually distinct from campaign StatusPill. */
export function PrepStatusBadge({ status }: { status: EventPrepStatus }) {
  return <Badge tone={tone[status]}>{PREP_STATUS_LABEL[status]}</Badge>;
}
