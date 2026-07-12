/**
 * @eventra/testing — shared, framework-agnostic test factories & fixtures.
 * Pure data builders (no React) so any package/app can compose deterministic
 * test state. React render helpers live per-app (each has its own RTL setup).
 */
import type {
  GlobalEvent,
  Organization,
  Principal,
  Workspace,
} from "@eventra/types";
import type {
  BusinessAccessInput,
  ConsumerAccessInput,
} from "@eventra/entitlements";

let seq = 0;
const id = (p: string) => `${p}_${(++seq).toString(36)}`;

// ─────────────────────────── principals ───────────────────────────
export function mockConsumerPrincipal(over: Partial<Principal> = {}): Principal {
  return { userId: id("user"), type: "consumer", consumerProfileId: id("cp"), ...over };
}
export function mockOrgPrincipal(over: Partial<Principal> = {}): Principal {
  const org = over.organizationId ?? id("org");
  return {
    userId: id("user"), type: "org_member", organizationId: org,
    workspaceIds: [id("ws")], roles: ["owner"], permissions: ["campaign.write"], ...over,
  };
}
export function mockAdminPrincipal(over: Partial<Principal> = {}): Principal {
  return { userId: id("admin"), type: "admin", permissions: [], ...over };
}

// ─────────────────────────── tenancy ───────────────────────────
export function mockOrganization(over: Partial<Organization> = {}): Organization {
  const oid = over.id ?? id("org");
  return { id: oid, name: "Demo Org", ownerUserId: id("user"), status: "active", ...over };
}
export function mockWorkspace(over: Partial<Workspace> = {}): Workspace {
  return { id: id("ws"), organizationId: over.organizationId ?? id("org"), name: "Demo Workspace", status: "active", ...over };
}

// ─────────────────────────── entitlement inputs ───────────────────────────
export function consumerAccess(over: Partial<ConsumerAccessInput> = {}): ConsumerAccessInput {
  return { surface: "consumer", dealIntelligence: false, adFree: false, ...over };
}
export function businessAccess(over: Partial<BusinessAccessInput> = {}): BusinessAccessInput {
  return { surface: "business", plan: "business.free", ...over };
}

// ─────────────────────────── calendar/event fixtures ───────────────────────────
export function mockGlobalEvent(over: Partial<GlobalEvent> = {}): GlobalEvent {
  return {
    id: id("ge"), name: "Demo Event", countryCodes: ["US"],
    startRule: { kind: "fixed", month: 7, day: 4 },
    category: "national_holiday", importance: "high", recommendedLeadDays: 21, recurring: true, ...over,
  };
}

/** Black Friday / Cyber Monday rules for cross-package date tests. */
export const BLACK_FRIDAY_RULE = { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 1 } as const;
export const CYBER_MONDAY_RULE = { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 4 } as const;
