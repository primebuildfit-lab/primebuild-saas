import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DataProvider,
  useCampaignData,
  useCatalog,
  usePlanData,
  type InitialData,
} from "~/context/DataContext";
import { createMemoryRepository } from "~/db/memoryRepository";
import { dispatchDataAction, type DataIntent } from "~/db/dataActions";
import type { TenantScope } from "~/types/domain";

/**
 * UI → persistent-action integration (MM5, Part 3/13). Renders the real
 * DataProvider wired to a memory repository through the same `onPersist` seam the
 * `/app` route uses, drives mutations from components, and asserts the REPOSITORY
 * persisted them — proving the wiring end to end without a running server.
 */
const scope: TenantScope = {
  userId: "u",
  organizationId: "o",
  organizationName: "Test",
  workspaceId: "ws_wire",
  role: "owner",
};

function Harness() {
  const { campaigns, createCampaign } = useCampaignData();
  const { customEvents, addCustomEvent, setCountryEnabled, storeCountries } = useCatalog();
  const { setPlanId, planId } = usePlanData();
  return (
    <div>
      <span data-testid="campaign-count">{campaigns.length}</span>
      <span data-testid="event-count">{customEvents.length}</span>
      <span data-testid="ca-enabled">
        {String(storeCountries.find((c) => c.countryCode === "CA")?.enabled ?? false)}
      </span>
      <span data-testid="plan">{planId}</span>
      <button
        onClick={() =>
          createCampaign({
            name: "Wired Campaign",
            startDate: "2026-07-01",
            endDate: "2026-07-07",
            status: "draft",
            productRefs: [],
            actions: [],
          })
        }
      >
        add-campaign
      </button>
      <button
        onClick={() =>
          addCustomEvent({
            name: "Wired Event",
            startDate: "2026-05-01",
            category: "seasonal",
            recurring: false,
          })
        }
      >
        add-event
      </button>
      <button onClick={() => setCountryEnabled("CA", false)}>disable-ca</button>
      <button onClick={() => setPlanId("vip")}>set-vip</button>
    </div>
  );
}

async function setup() {
  const repo = createMemoryRepository({ seedWorkspaceIds: [scope.workspaceId] });
  const [catalog, bundle] = await Promise.all([repo.loadCatalog(), repo.loadBundle(scope)]);
  const initialData: InitialData = { catalog, bundle };
  const pending: Promise<unknown>[] = [];
  const onPersist = (intent: DataIntent) => {
    pending.push(dispatchDataAction(repo, scope, intent));
  };
  const flush = () => act(async () => { await Promise.all(pending); });
  render(
    <DataProvider initialData={initialData} onPersist={onPersist}>
      <Harness />
    </DataProvider>,
  );
  return { repo, flush };
}

describe("UI hydrates from loader data + persists through the action seam", () => {
  it("hydrates campaign list from initialData (seeded bundle)", async () => {
    const { repo } = await setup();
    const seeded = (await repo.loadBundle(scope)).campaigns.length;
    expect(Number(screen.getByTestId("campaign-count").textContent)).toBe(seeded);
    expect(seeded).toBeGreaterThan(0);
  });

  it("createCampaign in the UI persists to the repository (same id)", async () => {
    const { repo, flush } = await setup();
    const before = (await repo.loadBundle(scope)).campaigns.length;
    await userEvent.click(screen.getByText("add-campaign"));
    await flush();
    const after = await repo.loadBundle(scope);
    expect(after.campaigns.length).toBe(before + 1);
    expect(after.campaigns.some((c) => c.name === "Wired Campaign")).toBe(true);
  });

  it("addCustomEvent, country toggle, and plan change all persist", async () => {
    const { repo, flush } = await setup();
    await userEvent.click(screen.getByText("add-event"));
    await userEvent.click(screen.getByText("disable-ca"));
    await userEvent.click(screen.getByText("set-vip"));
    await flush();
    const bundle = await repo.loadBundle(scope);
    expect(bundle.customEvents.some((e) => e.name === "Wired Event")).toBe(true);
    expect(bundle.storeCountries.find((c) => c.countryCode === "CA")?.enabled).toBe(false);
    expect(bundle.subscription?.planId).toBe("vip"); // façade planId persisted
  });
});
