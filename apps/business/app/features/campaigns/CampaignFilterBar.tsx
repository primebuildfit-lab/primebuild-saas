import { Card, CardContent, Select, SearchInput } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import type { CampaignStatus } from "~/types/domain";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";

export interface CampaignFilterState {
  status: "" | CampaignStatus;
  country: string;
  eventId: string;
  query: string;
}

export const emptyCampaignFilters: CampaignFilterState = {
  status: "",
  country: "",
  eventId: "",
  query: "",
};

interface CampaignFilterBarProps {
  filters: CampaignFilterState;
  onChange: (f: CampaignFilterState) => void;
}

export function CampaignFilterBar({ filters, onChange }: CampaignFilterBarProps) {
  const { enabledCountryCodes, globalEvents } = useData();
  const set = (patch: Partial<CampaignFilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <SearchInput
          value={filters.query}
          onValueChange={(query) => set({ query })}
          placeholder="Search campaigns…"
          aria-label="Search campaigns"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Select
            value={filters.status}
            onChange={(e) => set({ status: e.target.value as CampaignStatus | "" })}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CAMPAIGN_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select
            value={filters.country}
            onChange={(e) => set({ country: e.target.value })}
            aria-label="Filter by country"
          >
            <option value="">All countries</option>
            {enabledCountryCodes.map((code) => (
              <option key={code} value={code}>
                {getCountry(code)?.name ?? code}
              </option>
            ))}
          </Select>
          <Select
            value={filters.eventId}
            onChange={(e) => set({ eventId: e.target.value })}
            aria-label="Filter by linked event"
          >
            <option value="">All events</option>
            {globalEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
