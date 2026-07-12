import { useNavigate, Link } from "react-router";
import { Megaphone, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Button,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { Campaign } from "~/types/domain";
import { CampaignCard } from "~/features/campaigns/CampaignCard";

function openCampaign(navigate: ReturnType<typeof useNavigate>, c: Campaign) {
  navigate(`/app/campaigns?c=${c.id}`);
}

/** Currently active or scheduled campaigns. */
export function ActiveCampaigns({ onCreate }: { onCreate: () => void }) {
  const { campaigns } = useData();
  const navigate = useNavigate();
  const active = campaigns.filter(
    (c) => c.status === "active" || c.status === "scheduled",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active &amp; scheduled campaigns</CardTitle>
        <Link
          to="/app/campaigns"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          All campaigns
        </Link>
      </CardHeader>
      <CardContent className={active.length ? "grid gap-3 sm:grid-cols-2" : "p-0"}>
        {active.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nothing running yet"
            description="Create a campaign from an upcoming opportunity to see it here."
            action={<Button size="sm" onClick={onCreate}>Create campaign</Button>}
            className="m-4 border-0 bg-transparent py-10"
          />
        ) : (
          active.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onOpen={(camp) => openCampaign(navigate, camp)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

/** Most recently updated campaigns (saved/recent). */
export function RecentCampaigns() {
  const { campaigns } = useData();
  const navigate = useNavigate();
  const recent = [...campaigns]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent campaigns</CardTitle>
        <Link
          to="/app/campaign-library"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Campaign library
        </Link>
      </CardHeader>
      <CardContent className={recent.length ? "grid gap-3 sm:grid-cols-2" : "p-0"}>
        {recent.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No campaigns yet"
            description="Your saved campaigns build your reusable memory over time."
            className="m-4 border-0 bg-transparent py-10"
          />
        ) : (
          recent.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onOpen={(camp) => openCampaign(navigate, camp)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
