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
 * maps to `editor` (see apps/business-client planModel bridge). Platform-wide admin is a
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
 * enforcement calls — see apps/business-client `lib/permissions.ts` + the `/app/data` gate.
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

// ═══════════════ BUSINESS ADMIN (monitoring console) PERMISSIONS ═══════════════
/**
 * Permissions for the **Eventra Business Admin** — the INTERNAL monitoring /
 * supervision console (`apps/business-admin`, Tauri-packaged) that oversees the
 * commercial **Eventra Business Client** (`apps/business-client`) used by client
 * companies.
 *
 * DISTINCT from tenant {@link BUSINESS_PERMISSIONS} (owner/admin/editor/viewer
 * INSIDE a client company) and coarser than {@link PLATFORM_PERMISSIONS}. An
 * operator NEVER acts as a client company: `*.view` = read/monitor only, `*.review`
 * = supervise marketing, `*.manage` = intervene with authority. Deny-by-default —
 * the console must check these keys, never a role string.
 */
export const BUSINESS_ADMIN_PERMISSIONS = {
  view: "business.view",
  companiesView: "business.companies.view",
  companiesManage: "business.companies.manage",
  storesView: "business.stores.view",
  storesManage: "business.stores.manage",
  ordersView: "business.orders.view",
  ordersManage: "business.orders.manage",
  marketingView: "business.marketing.view",
  marketingReview: "business.marketing.review",
  subscriptionsView: "business.subscriptions.view",
  subscriptionsManage: "business.subscriptions.manage",
  integrationsView: "business.integrations.view",
  integrationsManage: "business.integrations.manage",
  alertsView: "business.alerts.view",
  alertsManage: "business.alerts.manage",
  auditView: "business.audit.view",
} as const;

export type BusinessAdminPermission =
  (typeof BUSINESS_ADMIN_PERMISSIONS)[keyof typeof BUSINESS_ADMIN_PERMISSIONS];

const BA = BUSINESS_ADMIN_PERMISSIONS;

/** Every read/monitor permission (no intervention). */
export const BUSINESS_ADMIN_VIEWS: BusinessAdminPermission[] = [
  BA.view, BA.companiesView, BA.storesView, BA.ordersView, BA.marketingView,
  BA.subscriptionsView, BA.integrationsView, BA.alertsView, BA.auditView,
];

/**
 * Sensitive interventions — ONLY platform_owner / platform_admin. These touch a
 * tenant's lifecycle or money: administratively changing a company or a
 * subscription. (Operational interventions like stores/orders/integrations/alerts
 * are NOT here — operations may perform those.)
 */
export const BUSINESS_ADMIN_SENSITIVE: ReadonlySet<string> = new Set<string>([
  BA.companiesManage, BA.subscriptionsManage,
]);

export function isSensitiveBusinessAdminPermission(key: string): boolean {
  return BUSINESS_ADMIN_SENSITIVE.has(key);
}

// operational interventions (non-sensitive): stores/orders/integrations/alerts + marketing review.
const BA_OPERATIONAL: BusinessAdminPermission[] = [
  BA.storesManage, BA.ordersManage, BA.integrationsManage, BA.alertsManage, BA.marketingReview,
];
// support: monitor everything + triage alerts + review marketing (no lifecycle/money/stores/orders).
const BA_SUPPORT: BusinessAdminPermission[] = [...BUSINESS_ADMIN_VIEWS, BA.alertsManage, BA.marketingReview];
// operations: monitor + all operational interventions (NOT companies/subscriptions manage).
const BA_OPERATIONS: BusinessAdminPermission[] = [...BUSINESS_ADMIN_VIEWS, ...BA_OPERATIONAL];
// platform_admin & owner: full surface (incl. sensitive interventions).
const BA_ALL: BusinessAdminPermission[] = Object.values(BA);

/** Business-Admin authorization by operator PlatformRole. */
export const BUSINESS_ADMIN_ROLE_PERMISSIONS: Record<PlatformRole, ReadonlySet<string>> = {
  read_only: new Set(BUSINESS_ADMIN_VIEWS),
  analyst: new Set(BUSINESS_ADMIN_VIEWS),
  support: new Set(BA_SUPPORT),
  operations: new Set(BA_OPERATIONS),
  platform_admin: new Set(BA_ALL),
  platform_owner: new Set(BA_ALL),
};

export function businessAdminPermissionsForRole(role: PlatformRole): ReadonlySet<string> {
  return BUSINESS_ADMIN_ROLE_PERMISSIONS[role] ?? new Set<string>();
}

/**
 * Deny-by-default authorization for the Business Admin console. An operator's
 * {@link PlatformRole} gates what they may monitor/intervene; sensitive
 * interventions ({@link BUSINESS_ADMIN_SENSITIVE}) are reserved for owner/admin.
 * This MUST also be enforced server-side, never in the UI alone.
 */
export function businessAdminCan(role: PlatformRole, permission: string): boolean {
  return businessAdminPermissionsForRole(role).has(permission);
}

/** Flat list of every Business-Admin permission key. */
export const ALL_BUSINESS_ADMIN_PERMISSIONS: readonly string[] = Object.values(BA);

// ═══════════════ GRANULAR INTERNAL-OS PERMISSION CATALOG (team & invitations) ═══════════════
/**
 * The FINE-GRAINED, module-organized permission catalog for internal team members
 * (orden §5/§6). This is the source of truth for the permissions an operator selects
 * one-by-one before sending an invitation, and for the EFFECTIVE authorization of an
 * internal member. It is intentionally richer than the coarse {@link PLATFORM_PERMISSIONS}
 * (which gates a handful of existing supervision screens): the coarse keys stay for
 * those screens; these granular keys are what a member actually carries.
 *
 * The real source of authorization is the set of EFFECTIVE permissions a member holds,
 * NEVER the descriptive role label (orden §8). Role templates below only PRESELECT.
 *
 * "IA y modelos" is deliberately ABSENT (orden §6): the AI surface has no real
 * implementation yet, so exposing AI permissions would be dishonest. The category
 * returns only when a functional AI integration exists — mirroring the Integraciones
 * precedent (data/live/integrations.ts).
 */
export interface PermissionModule {
  id: string;
  label: string;
  permissions: { key: string; label: string }[];
}

export const PLATFORM_PERMISSION_CATALOG: PermissionModule[] = [
  {
    id: "dashboard", label: "Inicio y supervisión", permissions: [
      { key: "dashboard.view", label: "Ver panel de inicio" },
      { key: "dashboard.view_sensitive_metrics", label: "Ver métricas sensibles" },
      { key: "alerts.view", label: "Ver alertas" },
      { key: "alerts.review", label: "Revisar alertas" },
      { key: "alerts.dismiss", label: "Descartar alertas" },
    ],
  },
  {
    id: "calendar", label: "Calendario global", permissions: [
      { key: "calendar.view", label: "Ver calendario" },
      { key: "calendar.create", label: "Crear entradas" },
      { key: "calendar.edit", label: "Editar entradas" },
      { key: "calendar.delete", label: "Eliminar entradas" },
      { key: "calendar.manage_priorities", label: "Gestionar prioridades" },
      { key: "calendar.manage_colors", label: "Gestionar colores" },
      { key: "calendar.view_private_details", label: "Ver detalles privados" },
    ],
  },
  {
    id: "publications", label: "Publicaciones", permissions: [
      { key: "publications.view", label: "Ver publicaciones" },
      { key: "publications.create", label: "Crear publicaciones" },
      { key: "publications.edit", label: "Editar publicaciones" },
      { key: "publications.approve", label: "Aprobar publicaciones" },
      { key: "publications.reject", label: "Rechazar publicaciones" },
      { key: "publications.publish_mobile", label: "Publicar en Mobile" },
      { key: "publications.unpublish", label: "Despublicar" },
      { key: "publications.manage_queue", label: "Gestionar la cola" },
    ],
  },
  {
    id: "companies", label: "Empresas", permissions: [
      { key: "companies.view", label: "Ver empresas" },
      { key: "companies.view_details", label: "Ver detalles" },
      { key: "companies.view_members", label: "Ver miembros" },
      { key: "companies.change_status", label: "Cambiar estado" },
      { key: "companies.change_plan", label: "Cambiar plan" },
      { key: "companies.view_reputation", label: "Ver reputación" },
      { key: "companies.adjust_reputation", label: "Ajustar reputación" },
      { key: "companies.view_audit", label: "Ver auditoría de empresa" },
      { key: "companies.export", label: "Exportar" },
    ],
  },
  {
    id: "mobile_users", label: "Usuarios Mobile", permissions: [
      { key: "mobile_users.view", label: "Ver usuarios" },
      { key: "mobile_users.view_details", label: "Ver detalles" },
      { key: "mobile_users.view_membership", label: "Ver membresía" },
      { key: "mobile_users.change_status", label: "Cambiar estado" },
      { key: "mobile_users.export", label: "Exportar" },
    ],
  },
  {
    id: "reputation", label: "Reputación", permissions: [
      { key: "reputation.view", label: "Ver reputación" },
      { key: "reputation.view_ledger", label: "Ver libro de reputación" },
      { key: "reputation.review_alerts", label: "Revisar alertas" },
      { key: "reputation.dismiss_alerts", label: "Descartar alertas" },
      { key: "reputation.manual_adjustment", label: "Ajuste manual" },
      { key: "reputation.manage_rules", label: "Gestionar reglas" },
    ],
  },
  {
    id: "sources", label: "Fuentes", permissions: [
      { key: "sources.view", label: "Ver fuentes" },
      { key: "sources.create", label: "Crear fuentes" },
      { key: "sources.edit", label: "Editar fuentes" },
      { key: "sources.enable", label: "Activar fuentes" },
      { key: "sources.disable", label: "Desactivar fuentes" },
      { key: "sources.test_connection", label: "Probar conexión" },
      { key: "sources.view_errors", label: "Ver errores" },
    ],
  },
  {
    id: "countries", label: "Países e idiomas", permissions: [
      { key: "countries.view", label: "Ver países" },
      { key: "countries.create", label: "Crear países" },
      { key: "countries.edit", label: "Editar países" },
      { key: "countries.activate", label: "Activar países" },
      { key: "countries.disable", label: "Desactivar países" },
      { key: "countries.manage_languages", label: "Gestionar idiomas" },
      { key: "countries.manage_coverage", label: "Gestionar cobertura" },
    ],
  },
  {
    id: "settings", label: "Parámetros", permissions: [
      { key: "settings.view", label: "Ver parámetros" },
      { key: "settings.edit_general", label: "Editar generales" },
      { key: "settings.edit_scoring", label: "Editar scoring" },
      { key: "settings.edit_publications", label: "Editar publicaciones" },
      { key: "settings.edit_mobile", label: "Editar Mobile" },
      { key: "settings.edit_business", label: "Editar Business" },
      { key: "settings.edit_security", label: "Editar seguridad" },
      { key: "settings.edit_feature_flags", label: "Editar feature flags" },
    ],
  },
  {
    id: "plans", label: "Planes y membresías", permissions: [
      { key: "plans.view", label: "Ver planes" },
      { key: "plans.create", label: "Crear planes" },
      { key: "plans.edit", label: "Editar planes" },
      { key: "plans.activate", label: "Activar planes" },
      { key: "plans.disable", label: "Desactivar planes" },
      { key: "subscriptions.view", label: "Ver suscripciones" },
      { key: "subscriptions.manage", label: "Gestionar suscripciones" },
    ],
  },
  {
    id: "templates", label: "Plantillas", permissions: [
      { key: "templates.view", label: "Ver plantillas" },
      { key: "templates.create", label: "Crear plantillas" },
      { key: "templates.edit", label: "Editar plantillas" },
      { key: "templates.approve", label: "Aprobar plantillas" },
      { key: "templates.delete", label: "Eliminar plantillas" },
    ],
  },
  {
    id: "audiences", label: "Audiencias", permissions: [
      { key: "audiences.view", label: "Ver audiencias" },
      { key: "audiences.create", label: "Crear audiencias" },
      { key: "audiences.edit", label: "Editar audiencias" },
      { key: "audiences.delete", label: "Eliminar audiencias" },
      { key: "audiences.export", label: "Exportar" },
    ],
  },
  {
    id: "channels", label: "Canales", permissions: [
      { key: "channels.view", label: "Ver canales" },
      { key: "channels.configure", label: "Configurar canales" },
      { key: "channels.connect", label: "Conectar canales" },
      { key: "channels.disconnect", label: "Desconectar canales" },
      { key: "channels.test", label: "Probar canales" },
      { key: "channels.view_metrics", label: "Ver métricas" },
    ],
  },
  {
    id: "business", label: "Eventra Business", permissions: [
      { key: "business.view", label: "Ver Business" },
      { key: "business.manage", label: "Gestionar Business" },
      { key: "business.view_metrics", label: "Ver métricas" },
      { key: "business.manage_versions", label: "Gestionar versiones" },
      { key: "business.manage_releases", label: "Gestionar publicaciones" },
    ],
  },
  {
    id: "mobile", label: "Eventra Mobile", permissions: [
      { key: "mobile.view", label: "Ver Mobile" },
      { key: "mobile.manage", label: "Gestionar Mobile" },
      { key: "mobile.view_metrics", label: "Ver métricas" },
      { key: "mobile.manage_publications", label: "Gestionar publicaciones" },
      { key: "mobile.manage_notifications", label: "Gestionar notificaciones" },
      { key: "mobile.manage_versions", label: "Gestionar versiones" },
      { key: "mobile.manage_releases", label: "Gestionar publicaciones" },
    ],
  },
  {
    id: "integrations", label: "Integraciones", permissions: [
      { key: "integrations.view", label: "Ver integraciones" },
      { key: "integrations.connect", label: "Conectar" },
      { key: "integrations.reconnect", label: "Reconectar" },
      { key: "integrations.disconnect", label: "Desconectar" },
      { key: "integrations.test", label: "Probar" },
      { key: "integrations.sync", label: "Sincronizar" },
      { key: "integrations.view_logs", label: "Ver logs" },
      { key: "integrations.manage_secrets", label: "Gestionar secretos" },
    ],
  },
  {
    id: "automations", label: "Automatizaciones", permissions: [
      { key: "automations.view", label: "Ver automatizaciones" },
      { key: "automations.create", label: "Crear automatizaciones" },
      { key: "automations.edit", label: "Editar automatizaciones" },
      { key: "automations.run", label: "Ejecutar" },
      { key: "automations.pause", label: "Pausar" },
      { key: "automations.disable", label: "Desactivar" },
      { key: "automations.retry", label: "Reintentar" },
      { key: "automations.view_logs", label: "Ver logs" },
    ],
  },
  {
    id: "releases", label: "Versiones y publicaciones", permissions: [
      { key: "releases.view", label: "Ver versiones" },
      { key: "releases.change_readiness", label: "Cambiar preparación" },
      { key: "releases.certify", label: "Certificar" },
      { key: "releases.manage_versions", label: "Gestionar versiones" },
      { key: "releases.publish", label: "Publicar versiones" },
      { key: "releases.rollback", label: "Revertir versiones" },
    ],
  },
  {
    id: "team", label: "Equipos y permisos", permissions: [
      { key: "team.view", label: "Ver equipo" },
      { key: "team.invite", label: "Invitar miembros" },
      { key: "team.edit_member", label: "Editar miembro" },
      { key: "team.edit_permissions", label: "Editar permisos" },
      { key: "team.suspend", label: "Suspender miembros" },
      { key: "team.revoke", label: "Revocar miembros" },
      { key: "team.resend_invitation", label: "Reenviar invitación" },
    ],
  },
  {
    id: "audit", label: "Auditoría", permissions: [
      { key: "audit.view", label: "Ver auditoría" },
      { key: "audit.export", label: "Exportar auditoría" },
      { key: "audit.view_sensitive_changes", label: "Ver cambios sensibles" },
    ],
  },
  {
    id: "system_health", label: "Salud del sistema", permissions: [
      { key: "system_health.view", label: "Ver salud" },
      { key: "system_health.run_checks", label: "Ejecutar comprobaciones" },
      { key: "system_health.view_errors", label: "Ver errores" },
      { key: "system_health.restart_jobs", label: "Reiniciar jobs" },
      { key: "system_health.manage_maintenance", label: "Gestionar mantenimiento" },
    ],
  },
  {
    id: "platform_config", label: "Configuración general", permissions: [
      { key: "platform_config.view", label: "Ver configuración" },
      { key: "platform_config.edit", label: "Editar configuración" },
      { key: "platform_config.manage_environment", label: "Gestionar entorno" },
      { key: "platform_config.manage_security", label: "Gestionar seguridad" },
    ],
  },
];

/** Every catalog permission key, flattened (deny-by-default reference set). */
export const ALL_CATALOG_PERMISSIONS: readonly string[] = PLATFORM_PERMISSION_CATALOG.flatMap(
  (m) => m.permissions.map((p) => p.key),
);

const CATALOG_KEY_SET = new Set(ALL_CATALOG_PERMISSIONS);

/** True when a key is a real catalog permission (unknown keys are never authorized). */
export function isCatalogPermission(key: string): boolean {
  return CATALOG_KEY_SET.has(key);
}

/**
 * Permissions of MAXIMUM sensitivity (orden §7/§14): only the platform owner may grant
 * them. They are: modifying permissions, adjusting reputation, managing secrets,
 * publishing versions, editing security, and administering other members.
 */
export const SENSITIVE_PERMISSIONS: ReadonlySet<string> = new Set<string>([
  "team.edit_permissions",
  "team.edit_member",
  "team.suspend",
  "team.revoke",
  "team.invite",
  "reputation.manual_adjustment",
  "integrations.manage_secrets",
  "releases.publish",
  "releases.rollback",
  "settings.edit_security",
  "platform_config.manage_security",
  "platform_config.manage_environment",
]);

export function isSensitivePermission(key: string): boolean {
  return SENSITIVE_PERMISSIONS.has(key);
}

/**
 * Descriptive role TEMPLATES (orden §8). They only PRESELECT catalog permissions to
 * speed up the invitation; the operator then adds/removes any permission before
 * sending. The label is descriptive — effective permissions are the real authority.
 */
export interface RoleTemplate {
  id: string;
  label: string;
  description: string;
  /** Preselected permission keys. `"*"` means every catalog permission (owner only). */
  permissions: string[];
}

const readsOf = (moduleIds: string[]): string[] =>
  PLATFORM_PERMISSION_CATALOG
    .filter((m) => moduleIds.includes(m.id))
    .flatMap((m) => m.permissions.map((p) => p.key))
    .filter((k) => k.endsWith(".view") || k.includes(".view_") || k.endsWith(".view_metrics"));

const ALL_READS_CATALOG: string[] = ALL_CATALOG_PERMISSIONS.filter(
  (k) => k.endsWith(".view") || k.includes(".view_"),
);

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "platform_owner", label: "Platform Owner",
    description: "Propietario de la plataforma — acceso total. Sus acciones sensibles quedan auditadas.",
    permissions: ["*"],
  },
  {
    id: "platform_admin", label: "Platform Admin",
    description: "Administración amplia; sin las acciones reservadas al propietario.",
    permissions: ALL_CATALOG_PERMISSIONS.filter((k) => !SENSITIVE_PERMISSIONS.has(k)),
  },
  {
    id: "operations", label: "Operaciones",
    description: "Curación de fuentes/ofertas, cola de publicación, automatizaciones e integraciones.",
    permissions: [
      ...ALL_READS_CATALOG,
      "publications.approve", "publications.reject", "publications.publish_mobile", "publications.manage_queue",
      "sources.create", "sources.edit", "sources.enable", "sources.disable", "sources.test_connection",
      "automations.create", "automations.edit", "automations.run", "automations.pause", "automations.retry",
      "integrations.connect", "integrations.reconnect", "integrations.test", "integrations.sync",
      "system_health.run_checks",
    ],
  },
  {
    id: "analyst", label: "Analista",
    description: "Solo lectura orientada a métricas y análisis.",
    permissions: ALL_READS_CATALOG,
  },
  {
    id: "support", label: "Soporte",
    description: "Lectura + revisión de alertas y estado de usuarios/empresas.",
    permissions: [
      ...readsOf(["dashboard", "companies", "mobile_users", "reputation", "publications", "system_health"]),
      "alerts.view", "alerts.review", "alerts.dismiss", "reputation.review_alerts",
    ],
  },
  {
    id: "publications", label: "Publicaciones",
    description: "Gestión completa de la cola de publicaciones y de Mobile.",
    permissions: [
      ...readsOf(["dashboard", "publications", "templates", "audiences", "channels", "mobile"]),
      "publications.create", "publications.edit", "publications.approve", "publications.reject",
      "publications.publish_mobile", "publications.unpublish", "publications.manage_queue",
      "mobile.manage_publications", "mobile.manage_notifications",
    ],
  },
  {
    id: "integrations", label: "Integraciones",
    description: "Conexión y operación de integraciones (sin gestionar secretos).",
    permissions: [
      ...readsOf(["dashboard", "integrations", "sources", "channels", "system_health"]),
      "integrations.connect", "integrations.reconnect", "integrations.disconnect", "integrations.test", "integrations.sync",
      "channels.connect", "channels.disconnect", "channels.configure", "channels.test",
    ],
  },
  {
    id: "security", label: "Seguridad",
    description: "Auditoría y salud del sistema; edición de seguridad (permiso sensible).",
    permissions: [
      ...readsOf(["dashboard", "audit", "system_health", "settings", "platform_config", "team"]),
      "audit.export", "audit.view_sensitive_changes", "system_health.run_checks", "system_health.view_errors",
    ],
  },
  {
    id: "read_only", label: "Solo lectura",
    description: "Cada lectura, ninguna escritura.",
    permissions: ALL_READS_CATALOG,
  },
];

export function roleTemplate(id: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find((t) => t.id === id);
}

/** Resolve a template's preselection into concrete catalog keys (`"*"` → all). */
export function resolveTemplatePermissions(id: string): string[] {
  const t = roleTemplate(id);
  if (!t) return [];
  if (t.permissions.includes("*")) return [...ALL_CATALOG_PERMISSIONS];
  return t.permissions.filter((k) => CATALOG_KEY_SET.has(k));
}

/**
 * ANTI-ESCALATION guard (orden §7/§14). A granter may only grant permissions that are
 * (1) real catalog keys, (2) already held by the granter (no granting beyond your own
 * scope), and (3) if sensitive, only when the granter is the platform owner. Returns
 * the disallowed subset — empty means the whole grant is authorized.
 */
export function disallowedGrants(
  requested: readonly string[],
  granterPermissions: readonly string[],
  granterIsOwner: boolean,
): string[] {
  const held = new Set(granterPermissions);
  return requested.filter((k) => {
    if (!CATALOG_KEY_SET.has(k)) return true; // unknown key
    if (isSensitivePermission(k)) return !granterIsOwner; // sensitive → owner only
    return !held.has(k); // cannot grant beyond own scope
  });
}

export function canGrantAll(
  requested: readonly string[],
  granterPermissions: readonly string[],
  granterIsOwner: boolean,
): boolean {
  return disallowedGrants(requested, granterPermissions, granterIsOwner).length === 0;
}

/**
 * The single, canonical definition of the platform owner (orden §4). Brian Almeida is
 * the real platform owner. Resolve the owner from HERE — never hard-code his name or
 * email across the app. `roleLabel` is descriptive; his authority is the full effective
 * permission set.
 */
export interface PlatformOwner {
  userId: string;
  email: string;
  displayName: string;
  roleLabel: string;
}

export const PLATFORM_OWNER: PlatformOwner = {
  userId: "brian_platform_owner",
  email: "primebuildfit@gmail.com",
  displayName: "Brian Almeida",
  roleLabel: "Platform Owner",
};

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
