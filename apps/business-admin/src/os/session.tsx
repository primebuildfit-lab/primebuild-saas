/**
 * Operator session for the Business Admin.
 *
 * Access requires an INTERNAL operator with a platform role — never a client-company
 * (tenant) user. There is no real privileged backend wired yet, so the console runs
 * in FOUNDATION mode: the operator is resolved once from `PLATFORM_OWNER`
 * (@eventra/identity, Brian = platform_owner), NOT hard-coded here, and NO real
 * cross-tenant data is reachable (every provider returns "not connected"). When a
 * real operator auth + platform read-path exist, `resolveSession()` swaps for them.
 *
 * The important invariant regardless of mode: authorization is by EFFECTIVE
 * `business.*` permissions via `businessAdminCan(role, perm)`, never a role string.
 */
import { createContext, useContext, type ReactNode } from "react";
import { PLATFORM_OWNER, type PlatformRole } from "@eventra/identity";

export interface OperatorSession {
  /** Whether a real privileged backend is connected. Foundation mode ⇒ false. */
  connected: boolean;
  operator: { userId: string; displayName: string; email: string; role: PlatformRole };
}

function resolveSession(): OperatorSession {
  // Foundation mode: single resolved owner, no live privileged access.
  return {
    connected: false,
    operator: {
      userId: PLATFORM_OWNER.userId,
      displayName: PLATFORM_OWNER.displayName,
      email: PLATFORM_OWNER.email,
      role: "platform_owner",
    },
  };
}

const SessionCtx = createContext<OperatorSession | null>(null);

export function SessionProvider({ children, value }: { children: ReactNode; value?: OperatorSession }) {
  return <SessionCtx.Provider value={value ?? resolveSession()}>{children}</SessionCtx.Provider>;
}

export function useSession(): OperatorSession {
  const s = useContext(SessionCtx);
  if (!s) throw new Error("useSession must be used within <SessionProvider>");
  return s;
}
