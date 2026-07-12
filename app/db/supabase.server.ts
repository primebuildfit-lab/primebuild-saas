import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import { env } from "./env.server";

/**
 * Supabase clients for the Eventra pilot (server-only).
 *
 * - The **admin** client (service role) bypasses RLS and is used ONLY to
 *   provision a store + membership on install. Never exposed to the client.
 * - The **user** client carries a short-lived JWT whose `sub` = the verified
 *   user id, so Postgres `auth.uid()` matches and RLS enforces tenant isolation
 *   as a second, independent gate (docs/SECURITY_PLAN.md §4, Option A).
 */

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      env("SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return adminClient;
}

/** Build the RLS-bridge JWT claims for a verified user id (pure/testable input). */
export async function signUserJwt(
  userId: string,
  secret = env("SUPABASE_JWT_SECRET"),
): Promise<string> {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(new TextEncoder().encode(secret));
}

/** A per-request client scoped to the user's identity; all reads/writes go
 *  through RLS. `storeId` is still passed explicitly by server code (from the
 *  resolved tenant) and is validated by RLS `WITH CHECK` — never trusted from
 *  the client. */
export async function getUserClient(userId: string): Promise<SupabaseClient> {
  const token = await signUserJwt(userId);
  return createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
