import type { Campaign, CampaignStatus } from "~/types/domain";
import { Button, Select } from "~/components/ui";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";

const nextActions: Record<
  CampaignStatus,
  { to: CampaignStatus; label: string }[]
> = {
  draft: [
    { to: "scheduled", label: "Schedule" },
    { to: "active", label: "Activate" },
  ],
  scheduled: [
    { to: "active", label: "Activate" },
    { to: "draft", label: "Back to draft" },
  ],
  active: [{ to: "completed", label: "Mark complete" }],
  completed: [{ to: "archived", label: "Archive" }],
  archived: [{ to: "draft", label: "Restore to draft" }],
};

interface CampaignStatusMenuProps {
  campaign: Campaign;
  onChange: (status: CampaignStatus) => void;
}

/** Contextual lifecycle transitions plus a jump-to-any-status control. */
export function CampaignStatusMenu({ campaign, onChange }: CampaignStatusMenuProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {nextActions[campaign.status].map((action) => (
        <Button
          key={action.to}
          size="sm"
          variant="secondary"
          onClick={() => onChange(action.to)}
        >
          {action.label}
        </Button>
      ))}
      <Select
        value={campaign.status}
        onChange={(e) => onChange(e.target.value as CampaignStatus)}
        aria-label="Set status"
        className="h-8 w-auto py-0 text-xs"
      >
        {CAMPAIGN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CAMPAIGN_STATUS_LABEL[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
