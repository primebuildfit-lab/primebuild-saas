import { createContext, useContext, type ReactNode } from "react";
import type { Plan, Subscription } from "~/types/domain";
import { demoSubscription } from "~/data";
import { getPlan, canAddCountry } from "~/lib/planEntitlements";

interface PlanContextValue {
  subscription: Subscription;
  plan: Plan;
  canAddCountry: (currentCount: number) => boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

/**
 * Provides the current store's plan + entitlements. Phase 1 reads mock data;
 * Phase 5 enforces limits SERVER-side (UI checks are convenience only).
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const subscription = demoSubscription;
  const plan = getPlan(subscription.planId);

  const value: PlanContextValue = {
    subscription,
    plan,
    canAddCountry: (currentCount: number) => canAddCountry(plan, currentCount),
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (!value) {
    throw new Error("usePlan must be used within <PlanProvider>");
  }
  return value;
}
