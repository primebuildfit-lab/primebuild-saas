import { useState } from "react";
import { useNavigate } from "react-router";
import { Menu, ChevronDown, Search } from "lucide-react";
import { useCurrentStore } from "~/context/StoreContext";
import { usePlan } from "~/context/PlanContext";
import { Badge } from "~/components/ui/Badge";

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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={submit} className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, campaigns…"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/app/search")}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 sm:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <Badge tone="brand">{plan.name}</Badge>
        {/* Store identity. Phase 5: becomes a real store switcher from Shopify sessions. */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-[11px] font-semibold text-white">
            {store.name.slice(0, 1)}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {store.name}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
