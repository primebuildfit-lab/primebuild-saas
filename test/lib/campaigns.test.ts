import { describe, it, expect } from "vitest";
import {
  duplicateCampaign,
  duplicateForNextYear,
  templateToCampaignInput,
  templateFromCampaign,
  CAMPAIGN_STATUS_LABEL,
} from "~/lib/campaigns";
import type { Campaign, Template } from "~/types/domain";
import { differenceInCalendarDays, parseISO } from "date-fns";

const source: Campaign = {
  id: "cmp_src",
  storeId: "store_demo",
  name: "Summer Sale",
  globalEventId: "ge_us_independence",
  country: "US",
  objective: "Clear inventory",
  startDate: "2026-07-01",
  endDate: "2026-07-07",
  prepStart: "2026-06-15",
  offer: "20% off",
  status: "completed",
  actions: [
    { id: "a1", label: "Enable discount", done: true },
    { id: "a2", label: "Email", done: true },
  ],
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-07-08T00:00:00Z",
};

describe("duplicateCampaign", () => {
  it("creates a new record linked to its source (memory link)", () => {
    const copy = duplicateCampaign(source);
    expect(copy.id).not.toBe(source.id);
    expect(copy.createdFromId).toBe(source.id);
    expect(copy.status).toBe("draft"); // copies always start as draft
    expect(copy.name).toBe("Summer Sale (Copy)");
  });

  it("resets action checklists to not-done with fresh ids", () => {
    const copy = duplicateCampaign(source);
    expect(copy.actions).toHaveLength(2);
    expect(copy.actions!.every((a) => a.done === false)).toBe(true);
    expect(copy.actions!.map((a) => a.id)).not.toEqual(
      source.actions!.map((a) => a.id),
    );
  });

  it("NEVER mutates or overwrites the source campaign", () => {
    const before = structuredClone(source);
    const copy = duplicateCampaign(source, { name: "Totally different" });
    // Source object untouched...
    expect(source).toEqual(before);
    // ...and the copy is a distinct object.
    expect(copy).not.toBe(source);
    expect(source.status).toBe("completed");
    expect(source.actions!.every((a) => a.done === true)).toBe(true);
  });

  it("applies overrides", () => {
    const copy = duplicateCampaign(source, { name: "Custom", country: "CA" });
    expect(copy.name).toBe("Custom");
    expect(copy.country).toBe("CA");
  });
});

describe("duplicateForNextYear", () => {
  it("shifts dates ~1 year forward and labels the new year", () => {
    const next = duplicateForNextYear(source);
    expect(next.createdFromId).toBe(source.id);
    expect(next.status).toBe("draft");
    expect(parseISO(next.startDate).getFullYear()).toBe(2027);
    expect(differenceInCalendarDays(parseISO(next.startDate), parseISO(source.startDate))).toBe(364);
    expect(differenceInCalendarDays(parseISO(next.endDate), parseISO(source.endDate))).toBe(364);
    expect(next.name).toContain("2027");
    expect(source.startDate).toBe("2026-07-01"); // source preserved
  });
});

describe("templateToCampaignInput", () => {
  const template: Template = {
    id: "tpl_x",
    storeId: "store_demo",
    name: "Flash Sale",
    category: "major_sales",
    defaultDurationDays: 3,
    defaultLeadDays: 14,
    offer: "25% off",
    notes: "Short urgency promo",
  };

  it("produces a draft campaign scaffold with a coherent timeline", () => {
    const input = templateToCampaignInput(template);
    expect(input.status).toBe("draft");
    expect(input.name).toBe("Flash Sale");
    expect(input.offer).toBe("25% off");
    expect(input.productRefs).toEqual([]);
    // duration spans defaultDurationDays inclusive.
    expect(
      differenceInCalendarDays(parseISO(input.endDate), parseISO(input.startDate)),
    ).toBe(2);
    // prep window equals the lead time.
    expect(
      differenceInCalendarDays(parseISO(input.startDate), parseISO(input.prepStart!)),
    ).toBe(14);
  });
});

describe("templateFromCampaign", () => {
  it("captures reusable structure from a campaign", () => {
    const tpl = templateFromCampaign(source, 7, 30);
    expect(tpl.id).not.toBe(source.id);
    expect(tpl.storeId).toBe(source.storeId);
    expect(tpl.defaultDurationDays).toBe(7);
    expect(tpl.defaultLeadDays).toBe(30);
    expect(tpl.offer).toBe(source.offer);
  });
});

describe("status labels", () => {
  it("labels every status", () => {
    expect(CAMPAIGN_STATUS_LABEL.draft).toBe("Draft");
    expect(CAMPAIGN_STATUS_LABEL.archived).toBe("Archived");
  });
});
