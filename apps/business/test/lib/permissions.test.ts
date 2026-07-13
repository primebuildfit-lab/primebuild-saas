// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import type { TenantScope } from "~/types/domain";
import {
  createMemoryRepository,
  type InMemoryBusinessRepository,
} from "~/db/memoryRepository";
import { dispatchDataAction, type DataIntent } from "~/db/dataActions";
import { RepositoryError } from "~/db/repository";
import { canPerform, requiredPermission } from "~/lib/permissions";

const scopeWithRole = (role: TenantScope["role"]): TenantScope => ({
  userId: "u_test",
  organizationId: "org_test",
  organizationName: "Test Org",
  workspaceId: "ws_test",
  role,
});

const createCampaign: DataIntent = {
  intent: "createCampaign",
  input: {
    name: "Fall Sale",
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    status: "draft",
    productRefs: [],
    actions: [],
  },
};
const setPlan: DataIntent = { intent: "setPlan", planId: "growth" };
const deleteCampaign: DataIntent = { intent: "deleteCampaign", id: "nope" };

describe("intent → permission mapping", () => {
  it("maps writes and deletes to distinct permissions", () => {
    expect(requiredPermission(createCampaign)).toBe("campaign:write");
    expect(requiredPermission(deleteCampaign)).toBe("campaign:delete");
    expect(requiredPermission(setPlan)).toBe("plan:manage");
    expect(requiredPermission({ intent: "updatePreferences", patch: {} })).toBe(
      "preferences:write",
    );
  });
});

describe("role capability matrix (pure)", () => {
  it("viewer can do no writes", () => {
    expect(canPerform("viewer", createCampaign)).toBe(false);
    expect(canPerform("viewer", setPlan)).toBe(false);
  });
  it("editor can write campaigns/events but NOT manage the plan", () => {
    expect(canPerform("editor", createCampaign)).toBe(true);
    expect(canPerform("editor", deleteCampaign)).toBe(true);
    expect(canPerform("editor", setPlan)).toBe(false); // billing is owner-only
  });
  it("admin can write but still NOT manage the plan", () => {
    expect(canPerform("admin", createCampaign)).toBe(true);
    expect(canPerform("admin", setPlan)).toBe(false);
  });
  it("owner can do everything including plan changes", () => {
    expect(canPerform("owner", createCampaign)).toBe(true);
    expect(canPerform("owner", setPlan)).toBe(true);
  });
});

describe("dispatchDataAction enforces the gate (server choke point)", () => {
  let repo: InMemoryBusinessRepository;
  beforeEach(() => {
    repo = createMemoryRepository();
  });

  it("denies a viewer with a forbidden RepositoryError (never reaches the repo)", async () => {
    const scope = scopeWithRole("viewer");
    await expect(dispatchDataAction(repo, scope, createCampaign)).rejects.toMatchObject({
      code: "forbidden",
    });
    // No write happened.
    const bundle = await repo.loadBundle(scope);
    expect(bundle.campaigns.some((c) => c.name === "Fall Sale")).toBe(false);
  });

  it("denies an editor the plan change (owner-only)", async () => {
    await expect(
      dispatchDataAction(repo, scopeWithRole("editor"), setPlan),
    ).rejects.toBeInstanceOf(RepositoryError);
  });

  it("allows an owner to create a campaign", async () => {
    const scope = scopeWithRole("owner");
    await dispatchDataAction(repo, scope, createCampaign);
    const bundle = await repo.loadBundle(scope);
    expect(bundle.campaigns.some((c) => c.name === "Fall Sale")).toBe(true);
  });

  it("allows an editor to create a campaign", async () => {
    const scope = scopeWithRole("editor");
    await dispatchDataAction(repo, scope, createCampaign);
    const bundle = await repo.loadBundle(scope);
    expect(bundle.campaigns.some((c) => c.name === "Fall Sale")).toBe(true);
  });
});
