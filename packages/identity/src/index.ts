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

// ─────────────────────────── canonical role → permission model ───────────────────────────
/**
 * The LOCKED organization role set (D48). This is the single source of truth for
 * authorization inside an Eventra Business tenant. The legacy façade role `staff`
 * maps to `editor` (see apps/business planModel bridge). Platform-wide admin is a
 * SEPARATE principal type (`admin`) and is never reachable from a tenant role.
 */
export type OrgRole = "owner" | "admin" | "editor" | "viewer";

export const ORG_ROLES: readonly OrgRole[] = ["owner", "admin", "editor", "viewer"];

/**
 * Canonical business permission keys. Server enforcement checks these; the UI only
 * hides/disables controls as a convenience. Adding a capability = add a key here and
 * grant it in {@link ROLE_PERMISSIONS} — never scatter role string comparisons in
 * routes/components.
 */
export const BUSINESS_PERMISSIONS = {
  campaignRead: "campaign:read",
  campaignWrite: "campaign:write",
  campaignDelete: "campaign:delete",
  eventWrite: "event:write",
  eventDelete: "event:delete",
  templateWrite: "template:write",
  templateDelete: "template:delete",
  countryWrite: "country:write",
  noteWrite: "note:write",
  noteDelete: "note:delete",
  preferencesWrite: "preferences:write",
  /** billing / plan changes — owner only (D48: admin manages users, not billing). */
  planManage: "plan:manage",
  /** invite members / change roles — admin+ (never transfer ownership). */
  memberManage: "member:manage",
  /** transfer ownership / delete org — owner only. */
  orgManage: "org:manage",
} as const;

export type BusinessPermission =
  (typeof BUSINESS_PERMISSIONS)[keyof typeof BUSINESS_PERMISSIONS];

const P = BUSINESS_PERMISSIONS;

const VIEWER_PERMS: BusinessPermission[] = [P.campaignRead];

const EDITOR_PERMS: BusinessPermission[] = [
  ...VIEWER_PERMS,
  P.campaignWrite,
  P.campaignDelete,
  P.eventWrite,
  P.eventDelete,
  P.templateWrite,
  P.templateDelete,
  P.countryWrite,
  P.noteWrite,
  P.noteDelete,
  P.preferencesWrite,
];

const ADMIN_PERMS: BusinessPermission[] = [...EDITOR_PERMS, P.memberManage];

const OWNER_PERMS: BusinessPermission[] = [...ADMIN_PERMS, P.planManage, P.orgManage];

/** Immutable role → permission-set matrix (the canonical authorization table). */
export const ROLE_PERMISSIONS: Record<OrgRole, ReadonlySet<string>> = {
  viewer: new Set(VIEWER_PERMS),
  editor: new Set(EDITOR_PERMS),
  admin: new Set(ADMIN_PERMS),
  owner: new Set(OWNER_PERMS),
};

/** The permissions granted to a role (empty set for an unknown role — deny by default). */
export function permissionsForRole(role: OrgRole): ReadonlySet<string> {
  return ROLE_PERMISSIONS[role] ?? new Set<string>();
}

/**
 * Whether a role is authorized for a permission. Pure and deny-by-default: an
 * unknown role or unknown permission returns false. This is the function server
 * enforcement calls — see apps/business `lib/permissions.ts` + the `/app/data` gate.
 */
export function roleCan(role: OrgRole, permission: string): boolean {
  return permissionsForRole(role).has(permission);
}

// ═══════════════════════ PLATFORM (Internal OS) roles ═══════════════════════
/**
 * Platform-staff roles for the Eventra Internal OS (Phase 7 / Nivel A). These are
 * SEPARATE from tenant `OrgRole`s and only ever attach to an `admin` principal —
 * a business/tenant role can NEVER grant a platform permission. Brian is
 * `platform_owner`. See docs/PLATFORM_ADMIN_SECURITY.md.
 */
export type PlatformRole =
  | "platform_owner"
  | "platform_admin"
  | "operations"
  | "support"
  | "analyst"
  | "read_only";

export const PLATFORM_ROLES: readonly PlatformRole[] = [
  "platform_owner", "platform_admin", "operations", "support", "analyst", "read_only",
];

/** Canonical Internal-OS permission keys (deny-by-default; never role string checks in UI). */
export const PLATFORM_PERMISSIONS = {
  companiesRead: "platform:companies:read",
  companiesWrite: "platform:companies:write",
  usersRead: "platform:users:read",
  usersWrite: "platform:users:write",
  offersRead: "platform:offers:read",
  offersWrite: "platform:offers:write",
  offersVerify: "platform:offers:verify",
  sourcesRead: "platform:sources:read",
  sourcesWrite: "platform:sources:write",
  jobsRead: "platform:jobs:read",
  jobsRun: "platform:jobs:run",
  analyticsRead: "platform:analytics:read",
  commissionsRead: "platform:commissions:read",
  commissionsManage: "platform:commissions:manage",
  integrationsRead: "platform:integrations:read",
  integrationsManage: "platform:integrations:manage",
  aiRead: "platform:ai:read",
  aiManage: "platform:ai:manage",
  auditRead: "platform:audit:read",
  impersonate: "platform:impersonate",
  billingManage: "platform:billing:manage",
  settingsManage: "platform:settings:manage",
  /** owner-only: ownership transfer, destructive platform ops. */
  ownerManage: "platform:owner",
} as const;

export type PlatformPermission =
  (typeof PLATFORM_PERMISSIONS)[keyof typeof PLATFORM_PERMISSIONS];

const PP = PLATFORM_PERMISSIONS;

const ALL_READS: PlatformPermission[] = [
  PP.companiesRead, PP.usersRead, PP.offersRead, PP.sourcesRead, PP.jobsRead,
  PP.analyticsRead, PP.commissionsRead, PP.integrationsRead, PP.aiRead, PP.auditRead,
];

// read_only: every read, no writes.
const READ_ONLY_PERMS: PlatformPermission[] = [...ALL_READS];
// analyst: reads (analytics-focused; identical read surface, no writes).
const ANALYST_PERMS: PlatformPermission[] = [...ALL_READS];
// support: reads + company notes + impersonation (audited).
const SUPPORT_PERMS: PlatformPermission[] = [...ALL_READS, PP.companiesWrite, PP.impersonate];
// operations: reads + offer/source curation + job runs + integrations + AI ops.
const OPERATIONS_PERMS: PlatformPermission[] = [
  ...ALL_READS,
  PP.offersWrite, PP.offersVerify, PP.sourcesWrite, PP.jobsRun, PP.integrationsManage, PP.aiManage,
];
// platform_admin: everything except owner-only.
const PLATFORM_ADMIN_PERMS: PlatformPermission[] = Object.values(PP).filter((p) => p !== PP.ownerManage);
// platform_owner: everything.
const PLATFORM_OWNER_PERMS: PlatformPermission[] = Object.values(PP);

export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, ReadonlySet<string>> = {
  read_only: new Set(READ_ONLY_PERMS),
  analyst: new Set(ANALYST_PERMS),
  support: new Set(SUPPORT_PERMS),
  operations: new Set(OPERATIONS_PERMS),
  platform_admin: new Set(PLATFORM_ADMIN_PERMS),
  platform_owner: new Set(PLATFORM_OWNER_PERMS),
};

export function platformPermissionsForRole(role: PlatformRole): ReadonlySet<string> {
  return PLATFORM_ROLE_PERMISSIONS[role] ?? new Set<string>();
}

/**
 * Deny-by-default platform authorization. A platform permission is ONLY reachable
 * through a platform role on an admin principal — never via a tenant OrgRole.
 */
export function platformCan(role: PlatformRole, permission: string): boolean {
  return platformPermissionsForRole(role).has(permission);
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
