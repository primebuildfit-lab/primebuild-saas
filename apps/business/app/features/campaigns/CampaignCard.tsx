import { CalendarRange, Tag, Lock } from "lucide-react";
import type { Campaign } from "~/types/domain";
import { StatusPill, Badge } from "~/components/ui";
import { getCountry } from "~/data";
import { formatDateRange } from "~/lib/dates";
import { cn } from "~/lib/cn";

interface CampaignCardProps {
  campaign: Campaign;
  onOpen?: (campaign: Campaign) => void;
  /** over the plan's saved-campaign limit — retained but not editable (D16) */
  readOnly?: boolean;
  className?: string;
}

/** Compact, clickable campaign summary used across dashboard, list, and library. */
export function CampaignCard({
  campaign,
  onOpen,
  readOnly,
  className,
}: CampaignCardProps) {
  const country = campaign.country ? getCountry(campaign.country) : undefined;
  const interactive = Boolean(onOpen);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onOpen?.(campaign) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen?.(campaign);
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-line bg-surface p-4 shadow-sm transition-colors",
        interactive &&
          "cursor-pointer hover:border-brand-200 hover:bg-brand-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-ink">
          {campaign.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {readOnly ? (
            <Badge tone="amber">
              <Lock className="h-3 w-3" />
              Read-only
            </Badge>
          ) : null}
          <StatusPill status={campaign.status} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarRange className="h-3.5 w-3.5" />
          {formatDateRange(campaign.startDate, campaign.endDate)}
        </span>
        {country ? (
          <span className="inline-flex items-center gap-1">
            {country.flag} {country.name}
          </span>
        ) : null}
      </div>

      {campaign.offer ? (
        <div className="mt-3">
          <Badge tone="green">
            <Tag className="h-3 w-3" />
            {campaign.offer}
          </Badge>
        </div>
      ) : null}

      {campaign.objective ? (
        <p className="mt-2 line-clamp-2 text-xs text-ink-muted">
          {campaign.objective}
        </p>
      ) : null}
    </div>
  );
}
