/** Server-only environment access + the persistence feature gate. */

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * True only when the pilot is explicitly enabled AND every Supabase secret is
 * present. When false, Eventra runs on in-memory mock data (Phases 2–4).
 */
export function persistenceEnabled(): boolean {
  return (
    process.env.EVENTRA_PERSISTENCE === "true" &&
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_ANON_KEY) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    Boolean(process.env.SUPABASE_JWT_SECRET)
  );
}

/**
 * Persistence mode selector (MM4, Part 10). Precedence:
 *  1. `supabase`  — real Postgres + RLS, only when {@link persistenceEnabled}.
 *  2. `file`      — local snapshot-on-disk dev persistence (survives restarts)
 *                   when `EVENTRA_PERSISTENCE_MODE=file`.
 *  3. `mock`      — in-memory demo data (default; ephemeral per process).
 * `mock` and `file` require NO secrets, so the app always runs out of the box.
 */
export type PersistenceMode = "mock" | "file" | "supabase";

export function persistenceMode(): PersistenceMode {
  if (persistenceEnabled()) return "supabase";
  if (process.env.EVENTRA_PERSISTENCE_MODE === "file") return "file";
  return "mock";
}

/** Absolute path for the `file` mode snapshot (dev only). */
export function fileSnapshotPath(): string {
  return process.env.EVENTRA_PERSISTENCE_FILE || ".eventra/dev-store.json";
}
