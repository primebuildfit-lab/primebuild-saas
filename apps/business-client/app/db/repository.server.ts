import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusinessRepository } from "./repository";
import { createMemoryRepository, type InMemoryBusinessRepository } from "./memoryRepository";
import { createFileRepository } from "./fileRepository.server";
import { createSupabaseRepository } from "./supabaseRepository.server";
import { fileSnapshotPath, persistenceMode } from "./env.server";
import { DEMO_TENANT_SCOPE } from "./mockScope";

/**
 * Repository selector (MM4, Part 10). Returns the BusinessRepository for the
 * active {@link persistenceMode}. `mock`/`file` are process singletons (so data
 * persists across requests); `supabase` is per-request and needs the RLS-scoped
 * client. Callers depend only on the BusinessRepository contract.
 */
let memorySingleton: InMemoryBusinessRepository | null = null;
let fileSingleton: BusinessRepository | null = null;

export function getBusinessRepository(client?: SupabaseClient): BusinessRepository {
  const mode = persistenceMode();

  if (mode === "supabase") {
    if (!client) {
      throw new Error("Supabase persistence requires an RLS-scoped client (resolve the tenant first).");
    }
    return createSupabaseRepository(client);
  }

  if (mode === "file") {
    fileSingleton ??= createFileRepository(fileSnapshotPath(), [DEMO_TENANT_SCOPE.workspaceId]);
    return fileSingleton;
  }

  memorySingleton ??= createMemoryRepository({
    seedWorkspaceIds: [DEMO_TENANT_SCOPE.workspaceId],
  });
  return memorySingleton;
}

/** Test/support hook: drop the process singletons so a fresh mode/state is built. */
export function __resetRepositorySingletons(): void {
  memorySingleton = null;
  fileSingleton = null;
}
