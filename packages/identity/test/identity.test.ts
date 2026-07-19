import { describe, it, expect } from "vitest";
import {
  isConsumerPrincipal,
  isOrganizationPrincipal,
  isAdminPrincipal,
  canAccessOrganization,
  canAccessWorkspace,
  hasPermission,
  buildPrincipalClaims,
  validatePrincipalClaims,
  roleCan,
  permissionsForRole,
  ORG_ROLES,
  ROLE_PERMISSIONS,
  BUSINESS_PERMISSIONS as P,
  platformCan,
  platformPermissionsForRole,
  PLATFORM_ROLES,
  PLATFORM_PERMISSIONS as PP,
  PLATFORM_PERMISSION_CATALOG,
  ALL_CATALOG_PERMISSIONS,
  isCatalogPermission,
  isSensitivePermission,
  disallowedGrants,
  canGrantAll,
  resolveTemplatePermissions,
  ROLE_TEMPLATES,
  PLATFORM_OWNER,
  businessAdminCan,
  businessAdminPermissionsForRole,
  BUSINESS_ADMIN_PERMISSIONS as BA,
  BUSINESS_ADMIN_VIEWS,
  BUSINESS_ADMIN_SENSITIVE,
  isSensitiveBusinessAdminPermission,
  ALL_BUSINESS_ADMIN_PERMISSIONS,
  type OrgRole,
  type PlatformRole,
} from "../src/index";
import type { Principal } from "@eventra/types";

const consumer: Principal = { userId: "u1", type: "consumer", consumerProfileId: "cp1" };
const orgMember: Principal = {
  userId: "u2", type: "org_member", organizationId: "org1",
  workspaceIds: ["ws1", "ws2"], roles: ["owner"], permissions: ["campaign.write"],
};
const admin: Principal = { userId: "u3", type: "admin", permissions: ["deals.verify"] };

describe("principal guards", () => {
  it("classifies principals", () => {
    expect(isConsumerPrincipal(consumer)).toBe(true);
    expect(isOrganizationPrincipal(orgMember)).toBe(true);
    expect(isAdminPrincipal(admin)).toBe(true);
    expect(isConsumerPrincipal(orgMember)).toBe(false);
  });
});

describe("access checks never trust client ids", () => {
  it("org access requires the principal's OWN resolved org", () => {
    expect(canAccessOrganization(orgMember, "org1")).toBe(true);
    expect(canAccessOrganization(orgMember, "org2")).toBe(false); // forged id rejected
  });
  it("workspace access requires membership in the principal's resolved workspaces", () => {
    expect(canAccessWorkspace(orgMember, "ws1")).toBe(true);
    expect(canAccessWorkspace(orgMember, "ws999")).toBe(false); // forged id rejected
  });
  it("a consumer cannot access any org/workspace", () => {
    expect(canAccessOrganization(consumer, "org1")).toBe(false);
    expect(canAccessWorkspace(consumer, "ws1")).toBe(false);
  });
  it("permissions are explicit", () => {
    expect(hasPermission(orgMember, "campaign.write")).toBe(true);
    expect(hasPermission(orgMember, "billing.write")).toBe(false);
  });
});

describe("RLS-JWT claims", () => {
  it("builds claims with the consumer profile id as sub", () => {
    const c = buildPrincipalClaims(consumer);
    expect(c.sub).toBe("cp1");
    expect(c.kind).toBe("consumer");
  });
  it("builds org claims with org + workspaces", () => {
    const c = buildPrincipalClaims(orgMember);
    expect(c.sub).toBe("u2");
    expect(c.org).toBe("org1");
    expect(c.workspaces).toEqual(["ws1", "ws2"]);
  });
  it("validates claim shape and rejects junk", () => {
    expect(validatePrincipalClaims(buildPrincipalClaims(admin))).toBe(true);
    expect(validatePrincipalClaims({ sub: "", kind: "admin" })).toBe(false);
    expect(validatePrincipalClaims({ sub: "x", kind: "wizard" })).toBe(false);
    expect(validatePrincipalClaims(null)).toBe(false);
  });
});

describe("canonical role → permission matrix", () => {
  it("defines exactly the four locked roles", () => {
    expect([...ORG_ROLES].sort()).toEqual(["admin", "editor", "owner", "viewer"]);
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([
      "admin", "editor", "owner", "viewer",
    ]);
  });

  it("is deny-by-default for unknown roles/permissions", () => {
    expect(roleCan("wizard" as OrgRole, P.campaignWrite)).toBe(false);
    expect(roleCan("owner", "not:a:real:permission")).toBe(false);
  });

  it("viewer is read-only", () => {
    expect(roleCan("viewer", P.campaignRead)).toBe(true);
    expect(roleCan("viewer", P.campaignWrite)).toBe(false);
    expect(roleCan("viewer", P.eventWrite)).toBe(false);
  });

  it("editor writes content but cannot manage billing, members, or the org", () => {
    expect(roleCan("editor", P.campaignWrite)).toBe(true);
    expect(roleCan("editor", P.templateDelete)).toBe(true);
    expect(roleCan("editor", P.planManage)).toBe(false);
    expect(roleCan("editor", P.memberManage)).toBe(false);
    expect(roleCan("editor", P.orgManage)).toBe(false);
  });

  it("admin manages members but NOT billing or ownership", () => {
    expect(roleCan("admin", P.memberManage)).toBe(true);
    expect(roleCan("admin", P.campaignWrite)).toBe(true);
    expect(roleCan("admin", P.planManage)).toBe(false);
    expect(roleCan("admin", P.orgManage)).toBe(false);
  });

  it("owner has every capability", () => {
    for (const perm of Object.values(P)) {
      expect(roleCan("owner", perm)).toBe(true);
    }
  });

  it("permission sets are strictly nested viewer ⊂ editor ⊂ admin ⊂ owner", () => {
    const sizes = (r: OrgRole) => permissionsForRole(r).size;
    expect(sizes("viewer")).toBeLessThan(sizes("editor"));
    expect(sizes("editor")).toBeLessThan(sizes("admin"));
    expect(sizes("admin")).toBeLessThan(sizes("owner"));
    // every lower-role permission is included in the higher role
    for (const perm of permissionsForRole("editor")) {
      expect(roleCan("admin", perm)).toBe(true);
    }
  });
});

describe("platform (Internal OS) role → permission matrix", () => {
  it("defines the six platform roles", () => {
    expect([...PLATFORM_ROLES].sort()).toEqual(
      ["analyst", "operations", "platform_admin", "platform_owner", "read_only", "support"],
    );
  });

  it("is deny-by-default", () => {
    expect(platformCan("wizard" as PlatformRole, PP.offersRead)).toBe(false);
    expect(platformCan("read_only", "platform:not:real")).toBe(false);
  });

  it("read_only and analyst can read but never write/verify/manage", () => {
    for (const role of ["read_only", "analyst"] as PlatformRole[]) {
      expect(platformCan(role, PP.offersRead)).toBe(true);
      expect(platformCan(role, PP.companiesRead)).toBe(true);
      expect(platformCan(role, PP.offersWrite)).toBe(false);
      expect(platformCan(role, PP.offersVerify)).toBe(false);
      expect(platformCan(role, PP.commissionsManage)).toBe(false);
      expect(platformCan(role, PP.impersonate)).toBe(false);
    }
  });

  it("support can impersonate (audited) + write company notes, but not curate offers or manage commissions", () => {
    expect(platformCan("support", PP.impersonate)).toBe(true);
    expect(platformCan("support", PP.companiesWrite)).toBe(true);
    expect(platformCan("support", PP.offersWrite)).toBe(false);
    expect(platformCan("support", PP.commissionsManage)).toBe(false);
  });

  it("operations curates offers/sources/jobs but cannot manage commissions/billing/settings or own", () => {
    expect(platformCan("operations", PP.offersWrite)).toBe(true);
    expect(platformCan("operations", PP.offersVerify)).toBe(true);
    expect(platformCan("operations", PP.jobsRun)).toBe(true);
    expect(platformCan("operations", PP.commissionsManage)).toBe(false);
    expect(platformCan("operations", PP.billingManage)).toBe(false);
    expect(platformCan("operations", PP.settingsManage)).toBe(false);
    expect(platformCan("operations", PP.ownerManage)).toBe(false);
  });

  it("platform_admin has everything except owner-only", () => {
    expect(platformCan("platform_admin", PP.commissionsManage)).toBe(true);
    expect(platformCan("platform_admin", PP.settingsManage)).toBe(true);
    expect(platformCan("platform_admin", PP.ownerManage)).toBe(false);
  });

  it("platform_owner (Brian) has every platform permission", () => {
    for (const perm of Object.values(PP)) {
      expect(platformCan("platform_owner", perm)).toBe(true);
    }
  });

  it("a tenant OrgRole string can never satisfy a platform permission", () => {
    // owner (tenant) is unrelated to platform_owner
    expect(platformCan("owner" as unknown as PlatformRole, PP.ownerManage)).toBe(false);
    expect(platformPermissionsForRole("owner" as unknown as PlatformRole).size).toBe(0);
  });
});

describe("granular internal-OS permission catalog (orden §5-§8/§14)", () => {
  it("exposes a broad, module-organized catalog (IA absent — no real impl)", () => {
    expect(PLATFORM_PERMISSION_CATALOG.length).toBeGreaterThan(15);
    expect(PLATFORM_PERMISSION_CATALOG.map((m) => m.id)).not.toContain("ai");
    expect(isCatalogPermission("companies.change_status")).toBe(true);
    expect(isCatalogPermission("not.a.real.perm")).toBe(false);
    // no duplicate keys across modules
    const keys = ALL_CATALOG_PERMISSIONS;
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("templates only preselect; owner template = whole catalog", () => {
    expect(resolveTemplatePermissions("read_only").every((k) => k.includes(".view"))).toBe(true);
    expect(resolveTemplatePermissions("platform_owner")).toHaveLength(ALL_CATALOG_PERMISSIONS.length);
    expect(ROLE_TEMPLATES.some((t) => t.id === "operations")).toBe(true);
  });

  it("anti-escalation: only owner grants sensitive perms; nobody grants beyond scope", () => {
    expect(isSensitivePermission("integrations.manage_secrets")).toBe(true);
    // non-owner cannot grant a sensitive permission even if they hold it
    expect(disallowedGrants(["integrations.manage_secrets"], ["integrations.manage_secrets"], false))
      .toEqual(["integrations.manage_secrets"]);
    // owner can
    expect(disallowedGrants(["integrations.manage_secrets"], ["integrations.manage_secrets"], true)).toEqual([]);
    // cannot grant a non-sensitive perm you don't hold
    expect(disallowedGrants(["companies.view"], [], false)).toEqual(["companies.view"]);
    expect(canGrantAll(["companies.view"], ["companies.view"], false)).toBe(true);
  });

  it("the platform owner is defined once (Brian) — resolve, don't hard-code", () => {
    expect(PLATFORM_OWNER.displayName).toBe("Brian Almeida");
    expect(PLATFORM_OWNER.roleLabel).toBe("Platform Owner");
    expect(PLATFORM_OWNER.email).toMatch(/@/);
  });
});

describe("business-admin permissions (monitoring console)", () => {
  it("read_only + analyst get every view but no intervention", () => {
    for (const role of ["read_only", "analyst"] as PlatformRole[]) {
      for (const v of BUSINESS_ADMIN_VIEWS) expect(businessAdminCan(role, v)).toBe(true);
      // no manage/review of any kind
      expect(businessAdminCan(role, BA.companiesManage)).toBe(false);
      expect(businessAdminCan(role, BA.ordersManage)).toBe(false);
      expect(businessAdminCan(role, BA.marketingReview)).toBe(false);
      expect(businessAdminCan(role, BA.subscriptionsManage)).toBe(false);
    }
  });

  it("support can triage alerts and review marketing, but never touch lifecycle/money/orders", () => {
    expect(businessAdminCan("support", BA.alertsManage)).toBe(true);
    expect(businessAdminCan("support", BA.marketingReview)).toBe(true);
    expect(businessAdminCan("support", BA.companiesManage)).toBe(false);
    expect(businessAdminCan("support", BA.subscriptionsManage)).toBe(false);
    expect(businessAdminCan("support", BA.ordersManage)).toBe(false);
    expect(businessAdminCan("support", BA.storesManage)).toBe(false);
  });

  it("operations can perform operational interventions but NOT sensitive ones", () => {
    expect(businessAdminCan("operations", BA.storesManage)).toBe(true);
    expect(businessAdminCan("operations", BA.ordersManage)).toBe(true);
    expect(businessAdminCan("operations", BA.integrationsManage)).toBe(true);
    expect(businessAdminCan("operations", BA.alertsManage)).toBe(true);
    expect(businessAdminCan("operations", BA.marketingReview)).toBe(true);
    // sensitive → denied
    expect(businessAdminCan("operations", BA.companiesManage)).toBe(false);
    expect(businessAdminCan("operations", BA.subscriptionsManage)).toBe(false);
  });

  it("platform_admin and platform_owner hold the full surface (incl. sensitive)", () => {
    for (const role of ["platform_admin", "platform_owner"] as PlatformRole[]) {
      for (const p of ALL_BUSINESS_ADMIN_PERMISSIONS) expect(businessAdminCan(role, p)).toBe(true);
    }
  });

  it("sensitive set = companies.manage + subscriptions.manage, owner/admin only", () => {
    expect([...BUSINESS_ADMIN_SENSITIVE].sort()).toEqual(
      [BA.companiesManage, BA.subscriptionsManage].sort(),
    );
    expect(isSensitiveBusinessAdminPermission(BA.companiesManage)).toBe(true);
    expect(isSensitiveBusinessAdminPermission(BA.ordersManage)).toBe(false);
    for (const role of ["read_only", "analyst", "support", "operations"] as PlatformRole[]) {
      for (const s of BUSINESS_ADMIN_SENSITIVE) expect(businessAdminCan(role, s)).toBe(false);
    }
  });

  it("deny-by-default: unknown permission is never granted", () => {
    expect(businessAdminCan("platform_owner", "business.nonexistent")).toBe(false);
    expect(businessAdminPermissionsForRole("read_only").has("business.unknown")).toBe(false);
  });
});
