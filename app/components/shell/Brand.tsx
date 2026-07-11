import { CalendarRange } from "lucide-react";
import { cn } from "~/lib/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <CalendarRange className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-gray-900">
          Eventra
        </span>
        <span className="block text-[11px] font-medium text-gray-400">
          Marketing planner
        </span>
      </div>
    </div>
  );
}
