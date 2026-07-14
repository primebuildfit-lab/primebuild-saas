import { useState, type CSSProperties, type ReactNode } from "react";
import { useData } from "~/context/DataContext";
import { accentVars } from "~/lib/accents";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { preferences } = useData();

  // Accent is applied as CSS variables here; Tailwind v4 `brand-*` utilities
  // resolve to these vars at runtime, so the whole app re-tints instantly.
  const style = accentVars(preferences.accent) as CSSProperties;

  return (
    <div className="min-h-screen bg-canvas text-ink" style={style}>
      <Sidebar />

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
