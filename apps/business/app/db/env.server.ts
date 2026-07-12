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
