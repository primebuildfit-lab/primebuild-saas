import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  createMemoryRepository,
  type InMemoryBusinessRepository,
  type MemorySnapshot,
} from "./memoryRepository";
import type { BusinessRepository } from "./repository";

/**
 * File-backed dev persistence (MM4, Part 10). Wraps the in-memory repository and
 * writes its snapshot to disk after every mutation, so local dev data SURVIVES a
 * process restart without any cloud project. Server-only (uses node:fs). Never for
 * production — that is the Supabase adapter.
 */
function loadSnapshot(path: string): MemorySnapshot | undefined {
  try {
    if (!existsSync(path)) return undefined;
    return JSON.parse(readFileSync(path, "utf8")) as MemorySnapshot;
  } catch {
    return undefined;
  }
}

function saveSnapshot(path: string, snapshot: MemorySnapshot): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(snapshot, null, 2), "utf8");
}

const MUTATORS = new Set<keyof BusinessRepository>([
  "setCountryEnabled",
  "setEventHidden",
  "createCustomEvent",
  "updateCustomEvent",
  "deleteCustomEvent",
  "createCampaign",
  "updateCampaign",
  "deleteCampaign",
  "duplicateCampaign",
  "setCampaignStatus",
  "moveCampaign",
  "addTemplate",
  "deleteTemplate",
  "createNote",
  "updateNote",
  "deleteNote",
  "updatePreferences",
  "setPlan",
]);

export function createFileRepository(
  path: string,
  seedWorkspaceIds: string[] = [],
): BusinessRepository {
  const inner: InMemoryBusinessRepository = createMemoryRepository({
    snapshot: loadSnapshot(path),
    seedWorkspaceIds,
  });
  // Persist the initial (possibly freshly-seeded) state.
  saveSnapshot(path, inner.snapshot());

  return new Proxy(inner, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      if (!MUTATORS.has(prop as keyof BusinessRepository)) return value.bind(target);
      return async (...args: unknown[]) => {
        const result = await (value as (...a: unknown[]) => unknown).apply(target, args);
        saveSnapshot(path, target.snapshot());
        return result;
      };
    },
  }) as unknown as BusinessRepository;
}
