import type { Campaign, CampaignStatus, Template } from "~/types/domain";
import { createId } from "~/lib/id";
import { shiftISO } from "~/lib/calendar";

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "archived",
];

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

/**
 * Reuse = create a NEW record that links back to its source and never overwrites
 * history (D15 / roadmap "Campaign memory"). The copy starts as a draft.
 */
export function duplicateCampaign(
  source: Campaign,
  overrides?: Partial<Campaign>,
): Campaign {
  const now = new Date().toISOString();
  return {
    ...source,
    id: createId("cmp"),
    name: overrides?.name ?? `${source.name} (Copy)`,
    status: "draft",
    createdFromId: source.id,
    createdAt: now,
    updatedAt: now,
    actions: source.actions?.map((a) => ({
      ...a,
      id: createId("act"),
      done: false,
    })),
    ...overrides,
  };
}

/** Duplicate a campaign shifted forward by roughly one year (memory → next year). */
export function duplicateForNextYear(source: Campaign): Campaign {
  return duplicateCampaign(source, {
    name: `${stripCopySuffix(source.name)} ${nextYearLabel(source.startDate)}`,
    prepStart: source.prepStart ? shiftISO(source.prepStart, 364) : undefined,
    startDate: shiftISO(source.startDate, 364),
    endDate: shiftISO(source.endDate, 364),
  });
}

function stripCopySuffix(name: string): string {
  return name.replace(/\s*\(Copy\)\s*$/i, "").replace(/\s+\d{4}$/, "");
}

function nextYearLabel(iso: string): number {
  return new Date(`${iso}T00:00:00`).getFullYear() + 1;
}

/**
 * Build the create-input for a new draft campaign from a template. Dates are
 * anchored to today + the template's default lead/duration.
 */
export function templateToCampaignInput(
  template: Template,
): Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt"> {
  const start = new Date();
  start.setDate(start.getDate() + template.defaultLeadDays);
  const startISO = isoFrom(start);
  const endISO = shiftISO(startISO, Math.max(0, template.defaultDurationDays - 1));
  const prepISO = shiftISO(startISO, -template.defaultLeadDays);
  return {
    name: template.name,
    objective: template.notes,
    description: template.notes,
    prepStart: prepISO,
    startDate: startISO,
    endDate: endISO,
    offer: template.offer,
    productRefs: [],
    status: "draft",
    actions: [],
  };
}

/** A template captured from an existing campaign's structure. */
export function templateFromCampaign(
  campaign: Campaign,
  durationDays: number,
  leadDays: number,
): Template {
  return {
    id: createId("tpl"),
    storeId: campaign.storeId,
    name: `${stripCopySuffix(campaign.name)} template`,
    category: "major_sales",
    defaultDurationDays: Math.max(1, durationDays),
    defaultLeadDays: Math.max(0, leadDays),
    offer: campaign.offer,
    notes: campaign.objective ?? campaign.description,
  };
}

function isoFrom(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
