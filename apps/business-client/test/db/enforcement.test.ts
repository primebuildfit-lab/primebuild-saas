// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import type { StoreCountry, TenantScope } from "~/types/domain";
import { createMemoryRepository, type InMemoryBusinessRepository } from "~/db/memoryRepository";
import { assertCanEnableCountry, readOnlyCountryCodes } from "~/db/enforcement";
import { RepositoryError } from "~/db/repository";

const scope: TenantScope = {
  userId: "u",
  organizationId: "o",
  organizationName: "Ent",
  workspaceId: "ws_ent",
  role: "owner",
};

describe("assertCanEnableCountry (locked limits, authoritative)", () => {
  it("Free is manual-only (0 countries) — always blocks", () => {
    expect(() => assertCanEnableCountry("free", 0)).toThrow(RepositoryError);
  });
  it("Starter allows exactly 1", () => {
    expect(() => assertCanEnableCountry("starter", 0)).not.toThrow();
    expect(() => assertCanEnableCountry("starter", 1)).toThrow(RepositoryError);
  });
  it("Growth and Pro are unlimited", () => {
    expect(() => assertCanEnableCountry("growth", 50)).not.toThrow();
    expect(() => assertCanEnableCountry("vip", 100)).not.toThrow();
  });
});

describe("readOnlyCountryCodes (non-destructive downgrade)", () => {
  const enabled: StoreCountry[] = [
    { storeId: "w", countryCode: "US", enabled: true },
    { storeId: "w", countryCode: "CA", enabled: true },
  ];
  it("Free makes all enabled countries read-only (kept, not deleted)", () => {
    expect(readOnlyCountryCodes("free", enabled)).toEqual(["US", "CA"]);
  });
  it("Starter keeps the first, marks the rest read-only", () => {
    expect(readOnlyCountryCodes("starter", enabled)).toEqual(["CA"]);
  });
  it("Growth marks none read-only", () => {
    expect(readOnlyCountryCodes("growth", enabled)).toEqual([]);
  });
});

describe("repository enforces country limits on write", () => {
  let repo: InMemoryBusinessRepository;
  beforeEach(() => {
    repo = createMemoryRepository();
  });

  it("blocks enabling a country on Free, but disabling is always allowed", async () => {
    await repo.setPlan(scope, "free");
    await expect(repo.setCountryEnabled(scope, "US", true)).rejects.toMatchObject({
      code: "forbidden",
    });
    // disabling never blocked
    await expect(repo.setCountryEnabled(scope, "US", false)).resolves.toBeUndefined();
  });

  it("allows exactly one country on Starter", async () => {
    await repo.setPlan(scope, "starter");
    await repo.setCountryEnabled(scope, "US", true);
    await expect(repo.setCountryEnabled(scope, "CA", true)).rejects.toMatchObject({
      code: "forbidden",
    });
  });

  it("allows many countries on Growth", async () => {
    await repo.setPlan(scope, "growth");
    await repo.setCountryEnabled(scope, "US", true);
    await repo.setCountryEnabled(scope, "CA", true);
    const { storeCountries } = await repo.loadBundle(scope);
    expect(storeCountries.filter((c) => c.enabled)).toHaveLength(2);
  });
});
