import type {
  Campaign,
  CampaignStatus,
  CountryCode,
  EventAction,
  GlobalEvent,
} from "~/types/domain";
import { eventOccurrence } from "~/lib/events";

/** Editable shape of a campaign in the form (strings for inputs). */
export interface CampaignFormValues {
  name: string;
  globalEventId: string;
  country: string;
  objective: string;
  description: string;
  prepStart: string;
  startDate: string;
  endDate: string;
  offer: string;
  notes: string;
  status: CampaignStatus;
  productRefs: string[];
  actions: EventAction[];
}

export function emptyCampaignValues(
  defaults?: Partial<CampaignFormValues>,
): CampaignFormValues {
  return {
    name: "",
    globalEventId: "",
    country: "",
    objective: "",
    description: "",
    prepStart: "",
    startDate: "",
    endDate: "",
    offer: "",
    notes: "",
    status: "draft",
    productRefs: [],
    actions: [],
    ...defaults,
  };
}

export function valuesFromCampaign(c: Campaign): CampaignFormValues {
  return {
    name: c.name,
    globalEventId: c.globalEventId ?? "",
    country: c.country ?? "",
    objective: c.objective ?? "",
    description: c.description ?? "",
    prepStart: c.prepStart ?? "",
    startDate: c.startDate,
    endDate: c.endDate,
    offer: c.offer ?? "",
    notes: c.notes ?? "",
    status: c.status,
    productRefs: c.productRefs ?? [],
    actions: c.actions ?? [],
  };
}

/** Prefill a campaign from an official event occurrence in a given year. */
export function valuesFromEvent(
  event: GlobalEvent,
  year: number,
  defaultCountry?: CountryCode,
): CampaignFormValues {
  const occ = eventOccurrence(event, year);
  const country =
    defaultCountry && event.countryCodes.includes(defaultCountry)
      ? defaultCountry
      : event.countryCodes[0] ?? "";
  return emptyCampaignValues({
    name: `${event.name} ${year}`,
    globalEventId: event.id,
    country,
    objective: event.description ?? "",
    prepStart: occ.prepStart ? isoOf(occ.prepStart) : "",
    startDate: occ.startISO,
    endDate: occ.endISO,
    actions: [],
  });
}

function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convert form values to a campaign payload (undefined for empty optionals). */
export function valuesToCampaignInput(v: CampaignFormValues) {
  return {
    name: v.name.trim(),
    globalEventId: v.globalEventId || undefined,
    country: v.country || undefined,
    objective: v.objective.trim() || undefined,
    description: v.description.trim() || undefined,
    prepStart: v.prepStart || undefined,
    startDate: v.startDate,
    endDate: v.endDate,
    offer: v.offer.trim() || undefined,
    notes: v.notes.trim() || undefined,
    status: v.status,
    productRefs: v.productRefs,
    actions: v.actions,
  };
}

export type CampaignFormErrors = Partial<
  Record<"name" | "startDate" | "endDate", string>
>;

export function validateCampaign(v: CampaignFormValues): CampaignFormErrors {
  const errors: CampaignFormErrors = {};
  if (!v.name.trim()) errors.name = "Give the campaign a name.";
  if (!v.startDate) errors.startDate = "Start date is required.";
  if (!v.endDate) errors.endDate = "End date is required.";
  if (v.startDate && v.endDate && v.endDate < v.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }
  return errors;
}
