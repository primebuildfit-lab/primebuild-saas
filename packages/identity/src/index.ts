/**
 * @eventra/identity — identity & authorization domain foundation.
 *
 * Contracts + pure helpers only. **No real OAuth/provider connections** (Shopify/
 * Google/Apple adapters stay abstract). The golden rule: authorization is checked
 * against a principal's SERVER-RESOLVED scope, never against raw client-submitted
 * organization/workspace/store ids. See docs/RLS_SECURITY_MODEL.md.
 */
import type {
  OrganizationId,
  Principal,
  PrincipalType,
  WorkspaceId,
} from "@eventra/types";

// ─────────────────────────── principal guards ───────────────────────────
export function isConsumerPrincipal(p: Principal): boolean {
  return p.type === "consumer";
}
export function isOrganizationPrincipal(p: Principal): boolean {
  return p.type === "org_member";
}
export function isAdminPrincipal(p: Principal): boolean {
  return p.type === "admin";
}
export function isServicePrincipal(p: Principal): boolean {
  return p.type === "service";
}

// ─────────────────────────── access checks ───────────────────────────
/**
 * Whether the principal may access an organization. Compares the requested id
 * against the principal's own server-resolved organizationId — a client-supplied
 * id is only a hint and is never trusted here.
 */
export function canAccessOrganization(
  p: Principal,
  requestedOrgId: OrganizationId,
): boolean {
  if (isAdminPrincipal(p)) return true; // admins gated by permission + audit elsewhere
  return p.type === "org_member" && p.organizationId === requestedOrgId;
}

export function canAccessWorkspace(
  p: Principal,
  requestedWorkspaceId: WorkspaceId,
): boolean {
  if (isAdminPrincipal(p)) return true;
  return (
    p.type === "org_member" &&
    Array.isArray(p.workspaceIds) &&
    p.workspaceIds.includes(requestedWorkspaceId)
  );
}

export function hasPermission(p: Principal, permission: string): boolean {
  return Array.isArray(p.permissions) && p.permissions.includes(permission);
}

// ─────────────────────────── RLS-JWT claims ───────────────────────────
export interface PrincipalClaims {
  sub: string; // user/principal id
  kind: PrincipalType;
  org?: OrganizationId;
  workspaces?: WorkspaceId[];
  roles?: string[];
  permissions?: string[];
}

/** Build the short-lived RLS-JWT claims from a server-resolved principal. */
export function buildPrincipalClaims(p: Principal): PrincipalClaims {
  return {
    sub: p.consumerProfileId ?? p.userId,
    kind: p.type,
    org: p.organizationId,
    workspaces: p.workspaceIds,
    roles: p.roles,
    permissions: p.permissions,
  };
}

/** Structural validation of inbound claims (shape only; signature check is server-side). */
export function validatePrincipalClaims(claims: unknown): claims is PrincipalClaims {
  if (typeof claims !== "object" || claims === null) return false;
  const c = claims as Record<string, unknown>;
  const kinds: PrincipalType[] = [
    "consumer", "org_member", "advertiser", "admin", "service",
  ];
  return (
    typeof c.sub === "string" &&
    c.sub.length > 0 &&
    typeof c.kind === "string" &&
    kinds.includes(c.kind as PrincipalType)
  );
}

// ─────────────────────────── abstract auth adapter ───────────────────────────
/**
 * Abstract contract for a future auth provider (Shopify session, Google/Apple,
 * email). Implementations live in Phase-5+ and resolve a verified Principal from
 * a request. Kept abstract here — no provider is connected.
 */
export interface AuthAdapter {
  readonly id: string; // e.g. "shopify" | "google" | "email"
  resolvePrincipal(request: Request): Promise<Principal>;
}
