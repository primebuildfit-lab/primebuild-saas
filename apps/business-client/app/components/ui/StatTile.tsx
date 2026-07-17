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
        "rounded-xl border border-line bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-ink-faint" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
