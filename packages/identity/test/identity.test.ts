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
