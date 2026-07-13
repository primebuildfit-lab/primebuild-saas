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
