import { describe, it, expect } from "vitest";
import {
  mockConsumerPrincipal,
  mockOrgPrincipal,
  mockAdminPrincipal,
  mockOrganization,
  mockWorkspace,
  consumerAccess,
  businessAccess,
  mockGlobalEvent,
} from "../src/index";
import { resolveEntitlements, shouldShowAds } from "@eventra/entitlements";
import { isAdminPrincipal, canAccessWorkspace } from "@eventra/identity";

describe("@eventra/testing factories", () => {
  it("produces distinct ids on each call", () => {
    expect(mockConsumerPrincipal().userId).not.toBe(mockConsumerPrincipal().userId);
  });

  it("principals compose with @eventra/identity checks", () => {
    expect(isAdminPrincipal(mockAdminPrincipal())).toBe(true);
    const p = mockOrgPrincipal({ workspaceIds: ["ws1"] });
    expect(canAccessWorkspace(p, "ws1")).toBe(true);
    expect(canAccessWorkspace(p, "ws2")).toBe(false);
  });

  it("access fixtures compose with @eventra/entitlements", () => {
    expect(shouldShowAds(resolveEntitlements(consumerAccess()))).toBe(true);
    expect(shouldShowAds(resolveEntitlements(consumerAccess({ adFree: true })))).toBe(false);
    const biz = resolveEntitlements(businessAccess({ plan: "business.pro" }));
    expect(biz.limits.workspaceLimit).toBeNull();
  });

  it("tenancy + event fixtures have sane defaults", () => {
    expect(mockOrganization().status).toBe("active");
    expect(mockWorkspace().status).toBe("active");
    expect(mockGlobalEvent().recurring).toBe(true);
  });
});
