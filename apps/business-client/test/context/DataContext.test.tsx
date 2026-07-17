import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DataProvider, useData } from "~/context/DataContext";
import { templateToCampaignInput } from "~/lib/campaigns";

function setup() {
  return renderHook(() => useData(), { wrapper: DataProvider });
}

describe("DataContext — tenant identity", () => {
  it("exposes exactly one current store, with a matching membership", () => {
    const { result } = setup();
    expect(result.current.store.id).toBe("store_demo");
    expect(result.current.membership.storeId).toBe(result.current.store.id);
    expect(result.current.membership.userId).toBe(result.current.user.id);
    // No PrimeBuild identifiers leak into the demo tenant.
    expect(result.current.store.shopDomain).not.toMatch(/primebuild/i);
  });
});

describe("DataContext — country enablement (per-store)", () => {
  it("enables/disables countries and reflects it in enabledCountryCodes", () => {
    const { result } = setup();
    expect(result.current.enabledCountryCodes).toEqual(
      expect.arrayContaining(["US", "CA"]),
    );

    act(() => result.current.setCountryEnabled("CA", false));
    expect(result.current.enabledCountryCodes).toContain("US");
    expect(result.current.enabledCountryCodes).not.toContain("CA");

    act(() => result.current.setCountryEnabled("CA", true));
    expect(result.current.enabledCountryCodes).toContain("CA");
  });
});

describe("DataContext — hide/restore official events (D13)", () => {
  it("hides per-store and restores, never deleting from the global catalog", () => {
    const { result } = setup();
    const id = "ge_us_christmas";
    const beforeCount = result.current.globalEvents.length;

    act(() => result.current.hideEvent(id));
    expect(result.current.isEventHidden(id)).toBe(true);

    act(() => result.current.restoreEvent(id));
    expect(result.current.isEventHidden(id)).toBe(false);

    // The global catalog is never mutated by hide/restore.
    expect(result.current.globalEvents.length).toBe(beforeCount);
    expect(result.current.globalEvents.some((e) => e.id === id)).toBe(true);
  });
});

describe("DataContext — campaign memory is never overwritten (D15)", () => {
  it("duplicating creates a new draft linked to the untouched source", () => {
    const { result } = setup();
    const before = result.current.campaigns.length;
    const source = result.current.campaigns.find((c) => c.status === "completed")!;
    const sourceName = source.name;
    const sourceStatus = source.status;

    let copyId = "";
    act(() => {
      copyId = result.current.duplicateCampaign(source.id)!.id;
    });

    expect(result.current.campaigns).toHaveLength(before + 1);
    const copy = result.current.campaigns.find((c) => c.id === copyId)!;
    expect(copy.createdFromId).toBe(source.id);
    expect(copy.status).toBe("draft");

    // Now edit the copy — the original must remain intact.
    act(() => result.current.updateCampaign(copyId, { name: "Reused + changed" }));
    const originalAfter = result.current.campaigns.find((c) => c.id === source.id)!;
    expect(originalAfter.name).toBe(sourceName);
    expect(originalAfter.status).toBe(sourceStatus);
  });
});

describe("DataContext — template → campaign", () => {
  it("creates a store-scoped draft campaign from a template", () => {
    const { result } = setup();
    const template = result.current.templates[0];

    let newId = "";
    act(() => {
      newId = result.current.createCampaign(templateToCampaignInput(template)).id;
    });

    const created = result.current.campaigns.find((c) => c.id === newId)!;
    expect(created).toBeDefined();
    expect(created.storeId).toBe(result.current.store.id); // tenant-keyed
    expect(created.status).toBe("draft");
    expect(created.name).toBe(template.name);
  });
});
