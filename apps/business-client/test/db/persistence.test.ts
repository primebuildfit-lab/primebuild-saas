// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync, existsSync } from "node:fs";
import type { Campaign, CustomEvent, TenantScope } from "~/types/domain";
import {
  createMemoryRepository,
  type InMemoryBusinessRepository,
} from "~/db/memoryRepository";
import { createFileRepository } from "~/db/fileRepository.server";
import { RepositoryError } from "~/db/repository";
import { dispatchDataAction } from "~/db/dataActions";

// ── scope helpers (server-resolved in production; fixed here) ──
const scopeFor = (workspaceId: string): TenantScope => ({
  userId: "u_test",
  organizationId: `org_${workspaceId}`,
  organizationName: "Test Org",
  workspaceId,
  role: "owner",
});
const A = scopeFor("ws_a");
const B = scopeFor("ws_b");

const campaignInput = (
  over: Partial<Campaign> = {},
): Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt"> => ({
  name: "Summer Sale",
  startDate: "2026-07-01",
  endDate: "2026-07-07",
  status: "draft",
  productRefs: [],
  actions: [],
  ...over,
});

const eventInput = (over: Partial<CustomEvent> = {}): Omit<CustomEvent, "id" | "storeId"> => ({
  name: "Anniversary",
  startDate: "2026-05-01",
  category: "seasonal",
  recurring: false,
  ...over,
});

let repo: InMemoryBusinessRepository;
beforeEach(() => {
  repo = createMemoryRepository();
});

// ─────────────────────────── CRUD: campaigns ───────────────────────────
describe("campaign CRUD", () => {
  it("creates, reads back, updates, and soft-deletes a campaign", async () => {
    const created = await repo.createCampaign(A, campaignInput());
    expect(created.id).toBeTruthy();
    expect(created.storeId).toBe("ws_a");
    expect(created.version).toBe(1);

    let bundle = await repo.loadBundle(A);
    expect(bundle.campaigns).toHaveLength(1);

    const updated = await repo.updateCampaign(A, created.id, { name: "Summer Blowout" });
    expect(updated.name).toBe("Summer Blowout");
    expect(updated.updatedAt >= created.updatedAt).toBe(true);

    await repo.deleteCampaign(A, created.id);
    bundle = await repo.loadBundle(A);
    expect(bundle.campaigns).toHaveLength(0); // soft-deleted, excluded from reads
  });

  it("setCampaignStatus and moveCampaign persist", async () => {
    const c = await repo.createCampaign(A, campaignInput());
    await repo.setCampaignStatus(A, c.id, "active");
    await repo.moveCampaign(A, c.id, "2026-08-01", "2026-08-10");
    const [reloaded] = (await repo.loadBundle(A)).campaigns;
    expect(reloaded.status).toBe("active");
    expect(reloaded.startDate).toBe("2026-08-01");
    expect(reloaded.endDate).toBe("2026-08-10");
  });
});

// ─────────────────────────── Campaign memory / versioning (D15) ───────────────────────────
describe("campaign memory (never overwrites history)", () => {
  it("duplicate creates a NEW linked, higher-version draft and leaves the source intact", async () => {
    const source = await repo.createCampaign(A, campaignInput({ status: "completed" }));
    const copy = await repo.duplicateCampaign(A, source.id);

    expect(copy.id).not.toBe(source.id);
    expect(copy.createdFromId).toBe(source.id);
    expect(copy.version).toBe(2);
    expect(copy.status).toBe("draft");

    // Source unchanged (history preserved).
    const bundle = await repo.loadBundle(A);
    const reloadedSource = bundle.campaigns.find((c) => c.id === source.id)!;
    expect(reloadedSource.status).toBe("completed");
    expect(reloadedSource.version).toBe(1);
    expect(bundle.campaigns).toHaveLength(2);
  });
});

// ─────────────────────────── CRUD: custom events + duplicate prevention ───────────────────────────
describe("custom event CRUD + duplicate prevention", () => {
  it("creates, updates, and soft-deletes", async () => {
    const ev = await repo.createCustomEvent(A, eventInput());
    expect(ev.storeId).toBe("ws_a");
    const up = await repo.updateCustomEvent(A, ev.id, { name: "Big Anniversary" });
    expect(up.name).toBe("Big Anniversary");
    await repo.deleteCustomEvent(A, ev.id);
    expect((await repo.loadBundle(A)).customEvents).toHaveLength(0);
  });

  it("rejects a duplicate (same name + date)", async () => {
    await repo.createCustomEvent(A, eventInput());
    await expect(repo.createCustomEvent(A, eventInput())).rejects.toMatchObject({
      code: "duplicate",
    });
  });
});

// ─────────────────────────── CRUD: templates, countries, events, prefs, plan, notes ───────────────────────────
describe("templates / countries / events / preferences / plan / notes", () => {
  it("adds and soft-deletes templates; blocks duplicate names", async () => {
    const t = await repo.addTemplate(A, {
      id: "",
      name: "BFCM",
      category: "major_sales",
      defaultDurationDays: 4,
      defaultLeadDays: 30,
    });
    expect(t.id).toBeTruthy();
    await expect(
      repo.addTemplate(A, {
        id: "",
        name: "bfcm",
        category: "major_sales",
        defaultDurationDays: 4,
        defaultLeadDays: 30,
      }),
    ).rejects.toMatchObject({ code: "duplicate" });
    await repo.deleteTemplate(A, t.id);
    expect((await repo.loadBundle(A)).templates).toHaveLength(0);
  });

  it("enables/disables countries idempotently", async () => {
    await repo.setPlan(A, "growth"); // unlimited countries (enforcement covered in enforcement.test)
    await repo.setCountryEnabled(A, "US", true);
    await repo.setCountryEnabled(A, "US", false);
    await repo.setCountryEnabled(A, "CA", true);
    const { storeCountries } = await repo.loadBundle(A);
    expect(storeCountries.find((c) => c.countryCode === "US")!.enabled).toBe(false);
    expect(storeCountries.find((c) => c.countryCode === "CA")!.enabled).toBe(true);
  });

  it("hides and restores a global event (never a global delete)", async () => {
    await repo.setEventHidden(A, "ge_us_halloween", true);
    let prefs = (await repo.loadBundle(A)).eventPreferences;
    expect(prefs.find((p) => p.globalEventId === "ge_us_halloween")!.hidden).toBe(true);
    await repo.setEventHidden(A, "ge_us_halloween", false);
    prefs = (await repo.loadBundle(A)).eventPreferences;
    expect(prefs.find((p) => p.globalEventId === "ge_us_halloween")!.hidden).toBe(false);
  });

  it("updates preferences and plan", async () => {
    const p = await repo.updatePreferences(A, { accent: "emerald", weekStartsOn: 1 });
    expect(p.accent).toBe("emerald");
    expect(p.weekStartsOn).toBe(1);
    const sub = await repo.setPlan(A, "growth");
    expect(sub.planId).toBe("growth");
    expect((await repo.loadBundle(A)).subscription!.planId).toBe("growth");
  });

  it("creates, updates, and soft-deletes notes", async () => {
    const n = await repo.createNote(A, "prep the BFCM assets");
    const up = await repo.updateNote(A, n.id, "prep BFCM + email flow");
    expect(up.body).toBe("prep BFCM + email flow");
    await repo.deleteNote(A, n.id);
    expect((await repo.loadBundle(A)).notes).toHaveLength(0);
  });
});

// ─────────────────────────── Tenant isolation (Part 6) ───────────────────────────
describe("workspace isolation", () => {
  it("never leaks data across workspaces", async () => {
    await repo.createCampaign(A, campaignInput({ name: "A-only" }));
    await repo.createCustomEvent(A, eventInput({ name: "A-event" }));

    const bundleB = await repo.loadBundle(B);
    expect(bundleB.campaigns).toHaveLength(0);
    expect(bundleB.customEvents).toHaveLength(0);

    const bundleA = await repo.loadBundle(A);
    expect(bundleA.campaigns).toHaveLength(1);
    expect(bundleA.campaigns[0].name).toBe("A-only");
  });

  it("update/delete cannot reach another workspace's row", async () => {
    const c = await repo.createCampaign(A, campaignInput());
    await expect(repo.updateCampaign(B, c.id, { name: "hijack" })).rejects.toMatchObject({
      code: "not_found",
    });
    await expect(repo.deleteCampaign(B, c.id)).rejects.toMatchObject({ code: "not_found" });
  });
});

// ─────────────────────────── Persistence across "reload" ───────────────────────────
describe("survives reload (snapshot round-trip)", () => {
  it("in-memory snapshot restores all data", async () => {
    await repo.createCampaign(A, campaignInput({ name: "Persisted" }));
    await repo.updatePreferences(A, { accent: "violet" });
    const snap = repo.snapshot();

    const reloaded = createMemoryRepository({ snapshot: snap });
    const bundle = await reloaded.loadBundle(A);
    expect(bundle.campaigns[0].name).toBe("Persisted");
    expect(bundle.preferences!.accent).toBe("violet");
  });

  it("file-backed repo persists to disk across new instances", async () => {
    const path = join(tmpdir(), `eventra-mm4-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    try {
      const first = createFileRepository(path);
      const created = await first.createCampaign(A, campaignInput({ name: "OnDisk" }));

      const second = createFileRepository(path); // simulates a fresh process
      const bundle = await second.loadBundle(A);
      expect(bundle.campaigns.find((c) => c.id === created.id)?.name).toBe("OnDisk");
    } finally {
      if (existsSync(path)) rmSync(path);
    }
  });

  it("snapshot retains soft-deleted rows (retention), reads exclude them", async () => {
    const c = await repo.createCampaign(A, campaignInput());
    await repo.deleteCampaign(A, c.id);
    const snap = repo.snapshot();
    // read path excludes it
    expect((await repo.loadBundle(A)).campaigns).toHaveLength(0);
    // retained in the raw snapshot with a deletedAt marker
    const rows = snap.workspaces["ws_a"].campaigns;
    expect(rows).toHaveLength(1);
    expect(rows[0].deletedAt).toBeTruthy();
  });
});

// ─────────────────────────── Validation & failure cases (Part 7) ───────────────────────────
describe("validation & failure cases", () => {
  it("rejects an end date before the start date", async () => {
    await expect(
      repo.createCampaign(A, campaignInput({ startDate: "2026-07-10", endDate: "2026-07-01" })),
    ).rejects.toBeInstanceOf(RepositoryError);
  });

  it("rejects an empty campaign name", async () => {
    await expect(repo.createCampaign(A, campaignInput({ name: "   " }))).rejects.toMatchObject({
      code: "validation",
    });
  });

  it("rejects an invalid custom-event category", async () => {
    await expect(
      // @ts-expect-error intentionally invalid category
      repo.createCustomEvent(A, eventInput({ category: "not_a_category" })),
    ).rejects.toMatchObject({ code: "validation" });
  });

  it("rejects a non-positive template duration", async () => {
    await expect(
      repo.addTemplate(A, {
        id: "",
        name: "Bad",
        category: "seasonal",
        defaultDurationDays: 0,
        defaultLeadDays: 5,
      }),
    ).rejects.toMatchObject({ code: "validation" });
  });

  it("throws not_found updating a missing campaign", async () => {
    await expect(repo.updateCampaign(A, "nope", { name: "x" })).rejects.toMatchObject({
      code: "not_found",
    });
  });

  it("rejects an empty note body", async () => {
    await expect(repo.createNote(A, "  ")).rejects.toMatchObject({ code: "validation" });
  });
});

// ─────────────────────────── Server-action dispatcher (Part 5) ───────────────────────────
describe("dispatchDataAction", () => {
  it("routes a createCampaign intent through the repository", async () => {
    const result = (await dispatchDataAction(repo, A, {
      intent: "createCampaign",
      input: campaignInput({ name: "Via Intent" }),
    })) as Campaign;
    expect(result.name).toBe("Via Intent");
    expect((await repo.loadBundle(A)).campaigns).toHaveLength(1);
  });

  it("throws on an unknown intent (never a silent no-op)", async () => {
    await expect(
      // @ts-expect-error unknown intent
      dispatchDataAction(repo, A, { intent: "explode" }),
    ).rejects.toBeInstanceOf(RepositoryError);
  });
});
