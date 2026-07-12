/**
 * Plan selector. State now lives in DataContext; this thin re-export keeps
 * existing `~/context/PlanContext` imports valid.
 */
export { usePlan, DataProvider as PlanProvider } from "./DataContext";
