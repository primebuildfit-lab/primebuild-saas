/**
 * Internal OS navigation map (Phase 7, Bloque 1). Grouped, Shopify-ergonomics
 * (structure only, not their code/brand). `real: true` = a built screen; the rest
 * are honest scaffolds so the full IA is navigable without faking functionality.
 */
export interface OsNavItem {
  label: string;
  to: string;
  group: string;
  real?: boolean;
}

export const OS_NAV: OsNavItem[] = [
  { label: "Home", to: "/", group: "", real: true },
  { label: "Global Calendar", to: "/calendar", group: "Offers", real: true },
  { label: "Offers", to: "/offers", group: "Offers", real: true },
  { label: "Sources", to: "/sources", group: "Offers", real: true },
  { label: "Cancellations", to: "/cancellations", group: "Offers" },
  { label: "Campaigns", to: "/campaigns", group: "Marketing" },
  { label: "Content", to: "/content", group: "Marketing" },
  { label: "Templates", to: "/templates", group: "Marketing" },
  { label: "Media", to: "/media", group: "Marketing" },
  { label: "Companies", to: "/companies", group: "Customers", real: true },
  { label: "Users & Teams", to: "/users", group: "Customers", real: true },
  { label: "Audiences", to: "/audiences", group: "Customers" },
  { label: "Analytics", to: "/analytics", group: "Revenue", real: true },
  { label: "Plans & Membership", to: "/plans", group: "Revenue" },
  { label: "Commissions", to: "/commissions", group: "Revenue", real: true },
  { label: "Integrations", to: "/integrations", group: "Platform" },
  { label: "AI", to: "/ai", group: "Platform", real: true },
  { label: "Automations & Jobs", to: "/jobs", group: "Platform", real: true },
  { label: "Countries & Regions", to: "/countries", group: "Platform" },
  { label: "System Health", to: "/health", group: "System" },
  { label: "Logs", to: "/logs", group: "System" },
  { label: "Audit", to: "/audit", group: "System" },
  { label: "Settings", to: "/settings", group: "System" },
];

/** Command-palette actions (Bloque 21). Navigations + labeled quick actions. */
export interface Command {
  id: string;
  label: string;
  to?: string;
  hint?: string;
}

export const OS_COMMANDS: Command[] = [
  { id: "go-home", label: "Go to Home", to: "/" },
  { id: "go-calendar", label: "Open Global Calendar", to: "/calendar" },
  { id: "go-offers", label: "Open Offers", to: "/offers" },
  { id: "go-cancellations", label: "Review cancellations", to: "/cancellations" },
  { id: "go-sources", label: "Open Sources", to: "/sources" },
  { id: "go-companies", label: "Open Companies", to: "/companies" },
  { id: "go-jobs", label: "Open Automations & Jobs", to: "/jobs" },
  { id: "go-commissions", label: "Open Commissions", to: "/commissions" },
  { id: "go-health", label: "Open System Health", to: "/health" },
  { id: "new-offer", label: "New offer (mock)", hint: "requires operations role" },
  { id: "run-sync", label: "Run source sync (mock)", hint: "requires jobs:run" },
];
