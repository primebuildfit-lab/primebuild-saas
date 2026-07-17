/**
 * Plan + tenancy reconciliation bridge (MM4, Part 2/3).
 *
 * The Business app's client façade still speaks the legacy vocabulary
 * (`PlanId = free|starter|growth|vip`, `MembershipRole = owner|admin|staff`,
 * `storeId`). The DATABASE and `@eventra/entitlements` speak the LOCKED platform
 * model (`business.*` plan ids, `owner|admin|editor|viewer` roles, org/workspace).
 *
 * This module is the single, pure, testable bridge between the two. It contains
 * NO secrets and NO DB/IO — safe to import anywhere. See docs/MM4_PERSISTENCE.md §2.
 */
import type { BusinessPlanId } from "@eventra/types";
import { BUSINESS_PLANS } from "@eventra/config";
import {
  resolveEntitlements,
  type EntitlementSet,
} from "@eventra/entitlements";
import type { MembershipRole, PlanId } from "~/types/domain";

// ─────────────────────────── plan id mapping ───────────────────────────
/** Façade → locked. `vip` is the documented legacy alias of Business Pro (A1). */
const FACADE_TO_LOCKED: Record<PlanId, BusinessPlanId> = {
  free: "business.free",
  starter: "business.starter",
  growth: "business.growth",
  vip: "business.pro",
};

const LOCKED_TO_FACADE: Record<BusinessPlanId, PlanId> = {
  "business.free": "free",
  "business.starter": "starter",
  "business.growth": "growth",
  "business.pro": "vip",
};

export function toLockedPlanId(id: PlanId): BusinessPlanId {
  return FACADE_TO_LOCKED[id];
}

export function toFacadePlanId(id: BusinessPlanId): PlanId {
  return LOCKED_TO_FACADE[id];
}

export function isBusinessPlanId(value: unknown): value is BusinessPlanId {
  return typeof value === "string" && value in BUSINESS_PLANS;
}

/** Accepts either vocabulary and normalizes to the locked id (defensive). */
export function normalizeToLocked(value: string): BusinessPlanId {
  if (isBusinessPlanId(value)) return value;
  if (value in FACADE_TO_LOCKED) return FACADE_TO_LOCKED[value as PlanId];
  throw new Error(`Unknown plan id: ${value}`);
}

// ─────────────────────────── role mapping ───────────────────────────
export type LockedRole = "owner" | "admin" | "editor" | "viewer";

const ROLE_TO_LOCKED: Record<MembershipRole, LockedRole> = {
  owner: "owner",
  admin: "admin",
  staff: "editor",
};

const ROLE_TO_FACADE: Record<LockedRole, MembershipRole> = {
  owner: "owner",
  admin: "admin",
  editor: "staff",
  viewer: "staff",
};

export function toLockedRole(role: MembershipRole): LockedRole {
  return ROLE_TO_LOCKED[role];
}

export function toFacadeRole(role: LockedRole): MembershipRole {
  return ROLE_TO_FACADE[role];
}

// ─────────────────────────── entitlement helpers ───────────────────────────
/**
 * Resolve the authoritative (locked) entitlement set for a façade plan id.
 * This is the SERVER-side enforcement source — not the legacy `mockPlans`
 * `countryLimit`/`planningHorizonMonths` display fields (see §2.2 R3/R4/R7).
 */
export function resolveBusinessEntitlements(planId: PlanId): EntitlementSet {
  return resolveEntitlements({
    surface: "business",
    plan: toLockedPlanId(planId),
  });
}

/** Locked country limit (null = unlimited) for a façade plan. */
export function lockedCountryLimit(planId: PlanId): number | null {
  return BUSINESS_PLANS[toLockedPlanId(planId)].countryLimit;
}

/** Locked workspace limit (null = unlimited) for a façade plan. */
export function lockedWorkspaceLimit(planId: PlanId): number | null {
  return BUSINESS_PLANS[toLockedPlanId(planId)].workspaceLimit;
}

/** Locked planning horizon in YEARS for a façade plan. */
export function lockedPlanningHorizonYears(planId: PlanId): number {
  return BUSINESS_PLANS[toLockedPlanId(planId)].planningHorizonYears;
}
