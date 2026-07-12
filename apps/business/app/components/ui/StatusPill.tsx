import type { CampaignStatus } from "~/types/domain";
import { Badge, type BadgeTone } from "./Badge";

const map: Record<CampaignStatus, { tone: BadgeTone; label: string }> = {
  draft: { tone: "gray", label: "Draft" },
  scheduled: { tone: "blue", label: "Scheduled" },
  active: { tone: "green", label: "Active" },
  completed: { tone: "brand", label: "Completed" },
  archived: { tone: "gray", label: "Archived" },
};

export function StatusPill({ status }: { status: CampaignStatus }) {
  const { tone, label } = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}
