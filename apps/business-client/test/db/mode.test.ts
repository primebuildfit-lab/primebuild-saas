// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { persistenceMode } from "~/db/env.server";
import {
  getBusinessRepository,
  __resetRepositorySingletons,
} from "~/db/repository.server";
import { DEMO_TENANT_SCOPE } from "~/db/mockScope";

const MODE_KEYS = ["EVENTRA_PERSISTENCE", "EVENTRA_PERSISTENCE_MODE"];

describe("persistence mode selection", () => {
  beforeEach(() => {
    MODE_KEYS.forEach((k) => delete process.env[k]);
    __resetRepositorySingletons();
  });
  afterEach(() => {
    MODE_KEYS.forEach((k) => delete process.env[k]);
    __resetRepositorySingletons();
  });

  it("defaults to mock mode with no env set", () => {
    expect(persistenceMode()).toBe("mock");
  });

  it("selects file mode when requested (no secrets required)", () => {
    process.env.EVENTRA_PERSISTENCE_MODE = "file";
    expect(persistenceMode()).toBe("file");
  });

  it("mock repository is a seeded singleton (demo data survives across calls)", async () => {
    const repo1 = getBusinessRepository();
    const bundle = await repo1.loadBundle(DEMO_TENANT_SCOPE);
    expect(bundle.campaigns.length).toBeGreaterThan(0); // demo seeded
    expect(bundle.subscription).not.toBeNull();

    // A write is visible on the next resolution (same process singleton).
    await repo1.createNote(DEMO_TENANT_SCOPE, "singleton check");
    const repo2 = getBusinessRepository();
    const notes = (await repo2.loadBundle(DEMO_TENANT_SCOPE)).notes;
    expect(notes.some((n) => n.body === "singleton check")).toBe(true);
  });
});
