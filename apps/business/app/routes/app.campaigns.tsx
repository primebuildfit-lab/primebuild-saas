import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Megaphone, AlertTriangle } from "lucide-react";
import { PageHeader, Button, EmptyState, LinkButton } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { savedCampaignLimitReached } from "~/lib/planEntitlements";
import { readOnlyCampaignIds } from "~/lib/planLimits";
import { formatLimitValue } from "~/lib/format";
import { CampaignCard } from "~/features/campaigns/CampaignCard";
import {
  CampaignFilterBar,
  emptyCampaignFilters,
  type CampaignFilterState,
} from "~/features/campaigns/CampaignFilterBar";
import { CampaignDetail } from "~/features/campaigns/CampaignDetail";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import { emptyCampaignValues } from "~/features/campaigns/campaignModel";

export default function CampaignsRoute() {
  const { campaigns, plan } = useData();
  const [params, setParams] = useSearchParams();
  const detailId = params.get("c");

  const [filters, setFilters] = useState<CampaignFilterState>(emptyCampaignFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);

  const openDetail = (id: string) => {
    params.set("c", id);
    setParams(params, { replace: true });
  };
  const closeDetail = () => {
    params.delete("c");
    setParams(params, { replace: true });
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setEditOpen(true);
  };

  const atLimit = savedCampaignLimitReached(plan, campaigns.length);
  const readOnlyIds = useMemo(
    () => readOnlyCampaignIds(campaigns, plan),
    [campaigns, plan],
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return campaigns
      .filter((c) => (filters.status ? c.status === filters.status : true))
      .filter((c) => (filters.country ? c.country === filters.country : true))
      .filter((c) =>
        filters.eventId ? c.globalEventId === filters.eventId : true,
      )
      .filter((c) =>
        q
          ? c.name.toLowerCase().includes(q) ||
            (c.objective?.toLowerCase().includes(q) ?? false)
          : true,
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [campaigns, filters]);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} of ${formatLimitValue(
          plan.savedCampaignLimit,
        )} saved on your ${plan.name} plan.`}
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={atLimit}>
            <Plus className="h-4 w-4" />
            New campaign
          </Button>
        }
      />

      {atLimit ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">
            You’ve reached your plan’s saved-campaign limit. Existing campaigns
            stay editable, but you’ll need to upgrade to save more.
          </p>
          <LinkButton to="/app/billing" size="sm">
            Upgrade
          </LinkButton>
        </div>
      ) : null}

      <div className="space-y-4">
        <CampaignFilterBar filters={filters} onChange={setFilters} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={campaigns.length === 0 ? "No campaigns yet" : "No matches"}
            description={
              campaigns.length === 0
                ? "Create your first campaign from an opportunity or from scratch."
                : "Try adjusting your filters."
            }
            action={
              campaigns.length === 0 && !atLimit ? (
                <Button onClick={() => setCreateOpen(true)}>Create campaign</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                readOnly={readOnlyIds.has(c.id)}
                onOpen={(camp) => openDetail(camp.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CampaignDetail
        campaignId={detailId}
        onClose={closeDetail}
        onEdit={openEdit}
        onOpenOther={openDetail}
      />

      <CampaignFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialValues={emptyCampaignValues()}
        onSaved={(c) => openDetail(c.id)}
      />
      <CampaignFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        campaignId={editId}
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
