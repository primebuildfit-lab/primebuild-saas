// @vitest-environment node
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync, existsSync } from "node:fs";
import type { Campaign, TenantScope } from "~/types/domain";
import { createFileRepository } from "~/db/fileRepository.server";

/**
 * "Survives reload" proof at the process boundary (MM5, Part 4). Writes via the
 * file repository, then reads the on-disk snapshot back from a SEPARATE `node`
 * child process (a real restart), and confirms campaign memory/versioning +
 * non-destructive history on disk. This is the local, honest equivalent of a
 * browser/server reload — Shopify in-Admin reload remains gated until install.
 */
const scope: TenantScope = {
  userId: "u",
  organizationId: "o",
  organizationName: "Reload",
  workspaceId: "ws_reload",
  role: "owner",
};

const campaignInput = (): Omit<Campaign, "id" | "storeId" | "createdAt" | "updatedAt"> => ({
  name: "Persisted Sale",
  startDate: "2026-07-01",
  endDate: "2026-07-07",
  status: "completed",
  productRefs: [],
  actions: [],
});

// Child process: read the snapshot file and assert persistence + versioning.
const CHILD = `
const fs = require("node:fs");
const path = process.argv[1];
const snap = JSON.parse(fs.readFileSync(path, "utf8"));
const ws = snap.workspaces["ws_reload"];
if (!ws) { console.error("no workspace"); process.exit(2); }
const live = ws.campaigns.filter((c) => !c.deletedAt);
const source = live.find((c) => c.name === "Persisted Sale");
const copy = live.find((c) => c.createdFromId && c.createdFromId === (source && source.id));
if (!source) { console.error("source missing"); process.exit(3); }
if (source.status !== "completed" || source.version !== 1) { console.error("source mutated"); process.exit(4); }
if (!copy) { console.error("duplicate missing"); process.exit(5); }
if (copy.version !== 2 || copy.status !== "draft") { console.error("bad version"); process.exit(6); }
process.exit(0);
`;

describe("file-mode persistence survives a real process restart", () => {
  it("a separate node process reads back the persisted + versioned campaigns", async () => {
    const path = join(tmpdir(), `eventra-reload-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    try {
      // Phase 1 (this process): create + duplicate, written to disk on each write.
      const repo = createFileRepository(path);
      const source = await repo.createCampaign(scope, campaignInput());
      await repo.duplicateCampaign(scope, source.id);
      expect(existsSync(path)).toBe(true);

      // Phase 2 (separate process): read the snapshot back and assert.
      execFileSync(process.execPath, ["-e", CHILD, path], { stdio: "pipe" });
      // execFileSync throws if the child exits non-zero; reaching here == pass.
      expect(true).toBe(true);
    } finally {
      if (existsSync(path)) rmSync(path);
    }
  });
});
