import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/cn";

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}
