import { CalendarRange } from "lucide-react";
import { cn } from "~/lib/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-900/40">
        <CalendarRange className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-ink">
          Eventra
        </span>
        <span className="block text-[11px] font-medium text-ink-faint">
          Marketing planner
        </span>
      </div>
    </div>
  );
}
