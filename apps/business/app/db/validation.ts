/**
 * Business validation & integrity (MM4, Part 7). Pure, adapter-agnostic guards
 * used by every repository implementation so rules hold identically in mock and
 * production. Throw `RepositoryError` with a stable `code` on violation.
 */
import type {
  Campaign,
  CampaignStatus,
  CustomEvent,
  EventCategory,
  Template,
} from "~/types/domain";
import { RepositoryError } from "./repository";

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "archived",
];

const EVENT_CATEGORIES: EventCategory[] = [
  "major_sales",
  "national_holiday",
  "seasonal",
  "cultural",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RepositoryError(`${field} is required`, "validation");
  }
  return value.trim();
}

function requireDate(value: unknown, field: string): string {
  if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new RepositoryError(`${field} must be a valid date`, "validation");
  }
  return value;
}

function assertOrder(start: string, end: string | undefined, startField: string, endField: string) {
  if (end !== undefined && Date.parse(end) < Date.parse(start)) {
    throw new RepositoryError(`${endField} cannot be before ${startField}`, "validation");
  }
}

// ─────────────────────────── campaigns ───────────────────────────
export function validateCampaignInput(
  input: Pick<Campaign, "name" | "startDate" | "endDate" | "status">,
): void {
  requireText(input.name, "Campaign name");
  const start = requireDate(input.startDate, "Start date");
  const end = requireDate(input.endDate, "End date");
  assertOrder(start, end, "start date", "end date");
  if (!CAMPAIGN_STATUSES.includes(input.status)) {
    throw new RepositoryError(`Invalid campaign status: ${input.status}`, "validation");
  }
}

/** Patch validation — only checks fields that are present. */
export function validateCampaignPatch(patch: Partial<Campaign>, current: Campaign): void {
  if (patch.name !== undefined) requireText(patch.name, "Campaign name");
  const start = patch.startDate !== undefined ? requireDate(patch.startDate, "Start date") : current.startDate;
  const end = patch.endDate !== undefined ? requireDate(patch.endDate, "End date") : current.endDate;
  assertOrder(start, end, "start date", "end date");
  if (patch.status !== undefined && !CAMPAIGN_STATUSES.includes(patch.status)) {
    throw new RepositoryError(`Invalid campaign status: ${patch.status}`, "validation");
  }
}

// ─────────────────────────── custom events ───────────────────────────
export function validateCustomEventInput(
  input: Pick<CustomEvent, "name" | "startDate" | "category"> & { endDate?: string },
): void {
  requireText(input.name, "Event name");
  const start = requireDate(input.startDate, "Start date");
  if (input.endDate !== undefined && input.endDate !== null) {
    const end = requireDate(input.endDate, "End date");
    assertOrder(start, end, "start date", "end date");
  }
  if (!EVENT_CATEGORIES.includes(input.category)) {
    throw new RepositoryError(`Invalid event category: ${input.category}`, "validation");
  }
}

/** Duplicate prevention: same name + same start date within a workspace. */
export function assertNoDuplicateCustomEvent(
  existing: readonly CustomEvent[],
  candidate: Pick<CustomEvent, "name" | "startDate">,
  ignoreId?: string,
): void {
  const name = candidate.name.trim().toLowerCase();
  const dup = existing.find(
    (e) =>
      e.id !== ignoreId &&
      e.name.trim().toLowerCase() === name &&
      e.startDate === candidate.startDate,
  );
  if (dup) {
    throw new RepositoryError(
      `A custom event named "${candidate.name}" already exists on that date`,
      "duplicate",
    );
  }
}

// ─────────────────────────── templates ───────────────────────────
export function validateTemplateInput(
  input: Pick<Template, "name" | "defaultDurationDays" | "defaultLeadDays">,
): void {
  requireText(input.name, "Template name");
  if (!Number.isFinite(input.defaultDurationDays) || input.defaultDurationDays <= 0) {
    throw new RepositoryError("Template duration must be a positive number of days", "validation");
  }
  if (!Number.isFinite(input.defaultLeadDays) || input.defaultLeadDays < 0) {
    throw new RepositoryError("Template lead time cannot be negative", "validation");
  }
}

export function assertNoDuplicateTemplateName(
  existing: readonly Template[],
  name: string,
  ignoreId?: string,
): void {
  const norm = name.trim().toLowerCase();
  if (existing.some((t) => t.id !== ignoreId && t.name.trim().toLowerCase() === norm)) {
    throw new RepositoryError(`A template named "${name}" already exists`, "duplicate");
  }
}

// ─────────────────────────── notes ───────────────────────────
export function validateNoteBody(body: unknown): string {
  return requireText(body, "Note body");
}

// ─────────────────────────── referential integrity ───────────────────────────
export function assertCountryKnown(knownCodes: readonly string[], code: string | undefined): void {
  if (code !== undefined && code !== null && !knownCodes.includes(code)) {
    throw new RepositoryError(`Unknown country code: ${code}`, "validation");
  }
}

export function assertGlobalEventKnown(
  knownIds: readonly string[],
  id: string | undefined,
): void {
  if (id !== undefined && id !== null && !knownIds.includes(id)) {
    throw new RepositoryError(`Unknown global event: ${id}`, "validation");
  }
}

/** Generic "row must exist and belong to the tenant" guard. */
export function requireFound<T>(row: T | null | undefined, label: string): T {
  if (row === null || row === undefined) {
    throw new RepositoryError(`${label} not found`, "not_found");
  }
  return row;
}
