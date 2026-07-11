import { useCurrentStore } from "~/context/StoreContext";
import { usePlan } from "~/context/PlanContext";
import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";

export function Sidebar() {
  const { store } = useCurrentStore();
  const { plan } = usePlan();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Brand />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
          <p className="truncate text-sm font-medium text-gray-900">
            {store.name}
          </p>
          <p className="truncate text-xs text-gray-500">
            {plan.name} plan · {store.shopDomain}
          </p>
        </div>
      </div>
    </aside>
  );
}
