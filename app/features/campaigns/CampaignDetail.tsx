import { useState } from "react";
import {
  Pencil,
  Copy,
  CalendarPlus,
  BookmarkPlus,
  Trash2,
  Tag,
  GitBranch,
  CheckCircle2,
  Circle,
  SearchX,
} from "lucide-react";
import {
  Drawer,
  Button,
  Badge,
  StatusPill,
  ConfirmDialog,
  EmptyState,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";
import { formatDate, formatDateRange } from "~/lib/dates";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { duplicateForNextYear, templateFromCampaign } from "~/lib/campaigns";
import { AttachedRefs } from "./ProductPicker";
import { CampaignStatusMenu } from "./CampaignStatusMenu";

interface CampaignDetailProps {
  campaignId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  /** navigate/open a different campaign (lineage links) */
  onOpenOther: (id: string) => void;
}

export function CampaignDetail({
  campaignId,
  onClose,
  onEdit,
  onOpenOther,
}: CampaignDetailProps) {
  const {
    campaigns,
    globalEvents,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    setCampaignStatus,
    addTemplate,
  } = useData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [flash, setFlash] = useState("");

  const campaign = campaignId
    ? campaigns.find((c) => c.id === campaignId)
    : undefined;

  // A campaignId in the URL that resolves to nothing (stale/shared deep link, or
  // a record that no longer exists) gets an explicit "not found" state rather
  // than a silently-empty panel.
  if (campaignId && !campaign) {
    return (
      <Drawer open onClose={onClose} title="Campaign not found">
        <EmptyState
          icon={SearchX}
          title="This campaign doesn’t exist"
          description="It may have been deleted, or the link is out of date."
          action={
            <Button variant="secondary" onClick={onClose}>
              Back to campaigns
            </Button>
          }
        />
      </Drawer>
    );
  }

  if (!campaign) {
    return (
      <Drawer open={false} onClose={onClose}>
        {null}
      </Drawer>
    );
  }

  const event = campaign.globalEventId
    ? globalEvents.find((e) => e.id === campaign.globalEventId)
    : undefined;
  const country = campaign.country ? getCountry(campaign.country) : undefined;
  const reusedFrom = campaign.createdFromId
    ? campaigns.find((c) => c.id === campaign.createdFromId)
    : undefined;
  const reusedInto = campaigns.filter((c) => c.createdFromId === campaign.id);

  const notify = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(""), 2500);
  };

  const toggleAction = (actionId: string) => {
    updateCampaign(campaign.id, {
      actions: campaign.actions?.map((a) =>
        a.id === actionId ? { ...a, done: !a.done } : a,
      ),
    });
  };

  const handleDuplicate = () => {
    const copy = duplicateCampaign(campaign.id);
    if (copy) {
      notify("Duplicated as a new draft.");
      onOpenOther(copy.id);
    }
  };

  const handleNextYear = () => {
    // Reuse the next-year date/name logic, then insert as ONE new record that
    // links back to this campaign (memory link; never overwrites the source).
    const scaffold = duplicateForNextYear(campaign);
    const copy = duplicateCampaign(campaign.id, {
      name: scaffold.name,
      prepStart: scaffold.prepStart,
      startDate: scaffold.startDate,
      endDate: scaffold.endDate,
    });
    if (copy) {
      notify("Duplicated for next year as a new draft.");
      onOpenOther(copy.id);
    }
  };

  const handleSaveTemplate = () => {
    const duration =
      differenceInCalendarDays(
        parseISO(campaign.endDate),
        parseISO(campaign.startDate),
      ) + 1;
    const lead = campaign.prepStart
      ? differenceInCalendarDays(
          parseISO(campaign.startDate),
          parseISO(campaign.prepStart),
        )
      : 14;
    addTemplate(templateFromCampaign(campaign, duration, lead));
    notify("Saved as a reusable template.");
  };

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title={campaign.name}
        description={formatDateRange(campaign.startDate, campaign.endDate)}
        footer={
          <>
            <Button variant="secondary" onClick={() => onEdit(campaign.id)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button onClick={handleDuplicate}>
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {flash ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {flash}
            </p>
          ) : null}

          {/* Status + lifecycle */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <StatusPill status={campaign.status} />
              {country ? (
                <span className="text-sm text-gray-500">
                  {country.flag} {country.name}
                </span>
              ) : null}
            </div>
            <CampaignStatusMenu
              campaign={campaign}
              onChange={(status) => setCampaignStatus(campaign.id, status)}
            />
          </section>

          {/* Key facts */}
          <section className="grid grid-cols-2 gap-3 text-sm">
            <Fact label="Prep start" value={campaign.prepStart ? formatDate(campaign.prepStart) : "—"} />
            <Fact label="Runs" value={formatDateRange(campaign.startDate, campaign.endDate)} />
            {event ? <Fact label="Linked event" value={event.name} /> : null}
            {campaign.offer ? (
              <div>
                <p className="text-xs font-medium text-gray-400">Offer</p>
                <Badge tone="green">
                  <Tag className="h-3 w-3" />
                  {campaign.offer}
                </Badge>
              </div>
            ) : null}
          </section>

          {campaign.objective ? (
            <Section title="Objective">
              <p className="text-sm text-gray-600">{campaign.objective}</p>
            </Section>
          ) : null}
          {campaign.description ? (
            <Section title="Strategy">
              <p className="whitespace-pre-line text-sm text-gray-600">
                {campaign.description}
              </p>
            </Section>
          ) : null}

          <Section title="Products & collections">
            <AttachedRefs ids={campaign.productRefs ?? []} />
          </Section>

          {campaign.actions && campaign.actions.length > 0 ? (
            <Section title="Action checklist (visual only)">
              <ul className="space-y-1.5">
                {campaign.actions.map((action) => (
                  <li key={action.id}>
                    <button
                      type="button"
                      onClick={() => toggleAction(action.id)}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      {action.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300" />
                      )}
                      <span className={action.done ? "line-through text-gray-400" : ""}>
                        {action.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {campaign.notes ? (
            <Section title="Notes">
              <p className="whitespace-pre-line text-sm text-gray-600">
                {campaign.notes}
              </p>
            </Section>
          ) : null}

          {/* Memory / lineage */}
          {(reusedFrom || reusedInto.length > 0) && (
            <Section title="Campaign memory">
              <div className="space-y-2 text-sm">
                {reusedFrom ? (
                  <button
                    type="button"
                    onClick={() => onOpenOther(reusedFrom.id)}
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <GitBranch className="h-4 w-4" />
                    Reused from “{reusedFrom.name}”
                  </button>
                ) : null}
                {reusedInto.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onOpenOther(c.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <GitBranch className="h-4 w-4 text-gray-400" />
                    Reused into “{c.name}”
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Reuse actions */}
          <Section title="Reuse & memory actions">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleNextYear}>
                <CalendarPlus className="h-4 w-4" />
                Duplicate for next year
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSaveTemplate}>
                <BookmarkPlus className="h-4 w-4" />
                Save as template
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Reuse always creates a new record — your history is never overwritten.
            </p>
          </Section>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteCampaign(campaign.id);
          onClose();
        }}
        title="Delete campaign"
        message={`Delete "${campaign.name}"? This can't be undone. Campaigns reused from it keep their own copies.`}
        confirmLabel="Delete"
      />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
