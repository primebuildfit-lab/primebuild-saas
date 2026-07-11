import { Menu, ChevronDown } from "lucide-react";
import { useCurrentStore } from "~/context/StoreContext";
import { usePlan } from "~/context/PlanContext";
import { Badge } from "~/components/ui/Badge";
import { currentMonthLabel } from "~/lib/dates";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { store } = useCurrentStore();
  const { plan } = usePlan();

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

      <p className="hidden text-sm font-medium text-gray-500 sm:block">
        {currentMonthLabel()}
      </p>

      <div className="ml-auto flex items-center gap-3">
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
