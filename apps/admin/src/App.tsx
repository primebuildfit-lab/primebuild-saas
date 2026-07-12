import type { ReactNode } from "react";
import { Link as RouterLink, Route, Routes, useLocation } from "react-router";
import { AppShell, Card, PlaceholderPage, type NavItem } from "@eventra/ui";
import { PRODUCTS } from "@eventra/config";
import { isAdminPrincipal } from "@eventra/identity";
import type { Principal } from "@eventra/types";

function Link({ to, children, style }: { to: string; children: ReactNode; style?: React.CSSProperties }) {
  return <RouterLink to={to} style={style}>{children}</RouterLink>;
}

// Grouped admin navigation (desktop-first). Mirrors ADMIN_CONSOLE.md IA.
const NAV: Omit<NavItem, "active">[] = [
  { label: "Overview", to: "/", group: "" },
  { label: "Consumers", to: "/consumers", group: "People" },
  { label: "Businesses", to: "/businesses", group: "People" },
  { label: "Plans", to: "/plans", group: "Revenue" },
  { label: "Trials", to: "/trials", group: "Revenue" },
  { label: "Billing", to: "/billing", group: "Revenue" },
  { label: "Companies", to: "/companies", group: "Deals & Ads" },
  { label: "Deals", to: "/deals", group: "Deals & Ads" },
  { label: "Advertising", to: "/advertising", group: "Deals & Ads" },
  { label: "Notifications", to: "/notifications", group: "Platform" },
  { label: "Integrations", to: "/integrations", group: "Platform" },
  { label: "Moderation", to: "/moderation", group: "Platform" },
  { label: "Analytics", to: "/analytics", group: "System" },
  { label: "System Health", to: "/health", group: "System" },
  { label: "Feature Flags", to: "/flags", group: "System" },
  { label: "Audit Logs", to: "/audit", group: "System" },
  { label: "Settings", to: "/settings", group: "System" },
];

/** Mock admin principal boundary (no real privileged access). */
const MOCK_ADMIN: Principal = { userId: "admin_demo", type: "admin", permissions: ["overview.read"] };

function Overview() {
  const isAdmin = isAdminPrincipal(MOCK_ADMIN);
  return (
    <div>
      <PlaceholderPage title="Overview" note="Platform KPIs, health, trials ending, deal queue. Foundation shell." />
      <Card style={{ marginTop: 16, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--eventra-text-muted)" }}>
          Admin-principal boundary wired (mock): access requires an admin principal —{" "}
          <b>{isAdmin ? "granted (mock)" : "denied"}</b>. No real privileged access; no live mutations.
        </div>
      </Card>
    </div>
  );
}

export function App() {
  const { pathname } = useLocation();
  const nav: NavItem[] = NAV.map((n) => ({
    ...n,
    active: n.to === "/" ? pathname === "/" : pathname.startsWith(n.to),
  }));
  const page = (title: string, note: string) => <PlaceholderPage title={title} note={note} />;
  return (
    <AppShell productName={PRODUCTS.admin.name} badge="Admin" nav={nav} Link={Link} desktopFirst>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/consumers" element={page("Consumers", "Consumer users.")} />
        <Route path="/businesses" element={page("Businesses", "Business customers.")} />
        <Route path="/plans" element={page("Plans", "Plans & entitlements config.")} />
        <Route path="/trials" element={page("Trials", "45-day business trials + consumer trials.")} />
        <Route path="/billing" element={page("Billing", "Providers, entitlements, reconciliation.")} />
        <Route path="/companies" element={page("Companies", "Company registry + monitoring.")} />
        <Route path="/deals" element={page("Deals", "Verified-deal review queue + sources.")} />
        <Route path="/advertising" element={page("Advertising", "Advertisers, campaigns, placements.")} />
        <Route path="/notifications" element={page("Notifications", "Delivery monitoring + templates.")} />
        <Route path="/integrations" element={page("Integrations", "Commerce connections + health.")} />
        <Route path="/moderation" element={page("Moderation", "Reports + content safety.")} />
        <Route path="/analytics" element={page("Analytics", "Cross-product analytics.")} />
        <Route path="/health" element={page("System Health", "Services, queues, incidents.")} />
        <Route path="/flags" element={page("Feature Flags", "Rollout + kill-switches.")} />
        <Route path="/audit" element={page("Audit Logs", "Every admin write, logged.")} />
        <Route path="/settings" element={page("Settings", "Platform configuration.")} />
        <Route path="*" element={page("Not found", "Unknown route.")} />
      </Routes>
    </AppShell>
  );
}
