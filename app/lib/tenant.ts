import type { StoreId, UserId } from "~/types/domain";

/**
 * Tenant authorization guard — PLACEHOLDER for Phase 5.
 *
 * SECURITY RULE (docs/ARCHITECTURE_REVIEW.md §8): never trust a client-supplied
 * storeId. In Phase 5 this resolves the authenticated user server-side, verifies a
 * Membership(userId, storeId) exists, and throws otherwise. Database isolation is
 * additionally enforced by Supabase RLS — this guard is defense-in-depth, not the
 * only gate.
 */
export function assertMembership(_userId: UserId, _storeId: StoreId): void {
  // TODO(Phase 5): server-side Membership lookup + throw on miss. RLS enforces at DB.
}
