import type { ReactNode } from "react";
import { Link as RouterLink, Route, Routes, useLocation } from "react-router";
import { AppShell, Badge, Card, PlaceholderPage, type NavItem } from "@eventra/ui";
import { PRODUCTS } from "@eventra/config";
import { resolveEntitlements, shouldShowAds } from "@eventra/entitlements";

// Router-agnostic UI shell adapter → react-router Link.
function Link({ to, children, style }: { to: string; children: ReactNode; style?: React.CSSProperties }) {
  return <RouterLink to={to} style={style}>{children}</RouterLink>;
}

const NAV: Omit<NavItem, "active">[] = [
  { label: "Calendar", to: "/" },
  { label: "Deals", to: "/deals" },
  { label: "Companies", to: "/companies" },
  { label: "Saved", to: "/saved" },
  { label: "Notifications", to: "/notifications" },
  { label: "Subscription", to: "/subscription" },
  { label: "Settings", to: "/settings" },
];

/** Mock consumer principal on Core (foundation only) — demonstrates shared entitlements. */
function useMockEntitlements() {
  return resolveEntitlements({ surface: "consumer", dealIntelligence: false, adFree: false });
}

function Home() {
  const ent = useMockEntitlements();
  return (
    <div>
      <PlaceholderPage title="Calendar" note="Commercial calendar for the selected country. Foundation shell." />
      <Card style={{ marginTop: 16, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--eventra-text-muted)" }}>
          Shared entitlement engine wired: mock consumer on <b>Core</b> →{" "}
          <Badge>{shouldShowAds(ent) ? "Ads: on" : "Ads: off"}</Badge>{" "}
          <span style={{ marginLeft: 8 }}>Deal Intelligence: {ent.features.has("consumer.deal_intelligence") ? "yes" : "no"}</span>
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
  return (
    <AppShell productName={PRODUCTS.consumer.name} badge="Consumer" nav={nav} Link={Link}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deals" element={<PlaceholderPage title="Deals" note="Verified & likely deals feed (Deal Intelligence)." />} />
        <Route path="/companies" element={<PlaceholderPage title="Companies" note="Follow companies & categories." />} />
        <Route path="/saved" element={<PlaceholderPage title="Saved" note="Saved offers & wishlist." />} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" note="Alerts inbox." />} />
        <Route path="/subscription" element={<PlaceholderPage title="Subscription" note="Core / Deal Intelligence + independent Ad-Free add-on." />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" note="Region, notifications, privacy." />} />
        <Route path="*" element={<PlaceholderPage title="Not found" note="Unknown route." />} />
      </Routes>
    </AppShell>
  );
}
