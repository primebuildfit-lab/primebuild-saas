import { useState } from "react";
import { useNavigate } from "react-router";
import { Menu, Search, Plus, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { useCurrentStore } from "~/context/StoreContext";
import { usePlan } from "~/context/PlanContext";
import { Badge } from "~/components/ui/Badge";

/**
 * Command-center top bar for the Business app: global search, workspace
 * identity, quick-create, notifications, help, connection status and profile.
 * Stays stable across every module. Controls that are not yet wired to a real
 * backend are honest (no fake counts/badges).
 */
export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { store } = useCurrentStore();
  const { plan } = usePlan();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/app/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search — opportunities, campaigns, events, templates, content… */}
      <form onSubmit={submit} className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search opportunities, campaigns, content…"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Quick create */}
        <button
          type="button"
          onClick={() => navigate("/app/campaigns?create=1")}
          className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/40 hover:bg-brand-500 sm:flex"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Create</span>
        </button>

        {/* Search (mobile) */}
        <button
          type="button"
          onClick={() => navigate("/app/search")}
          className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink sm:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications (no fake unread count until wired to a real source) */}
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Help */}
        <a
          href="https://help.eventra.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink sm:inline-flex"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </a>

        <Badge tone="brand">{plan.name}</Badge>

        {/* Workspace / store identity + connection status. Phase 5 → real store
            switcher from Shopify sessions; no dropdown affordance until it switches. */}
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-ok"
            title="Connected"
            aria-label="Connected"
          />
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
            {store.name.slice(0, 1)}
          </div>
          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:block">
            {store.name}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-ink-faint sm:block" aria-hidden />
        </div>
      </div>
    </header>
  );
}
