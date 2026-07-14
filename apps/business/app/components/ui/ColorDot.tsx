import type { Importance } from "~/types/domain";
import { cn } from "~/lib/cn";

/** Importance colors (D11): high=green, medium=amber, low=red. */
const importanceColor: Record<Importance, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

interface ColorDotProps {
  importance?: Importance;
  /** explicit color overrides importance (e.g. category color) */
  color?: string;
  className?: string;
}

export function ColorDot({ importance, color, className }: ColorDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        !color && importance && importanceColor[importance],
        !color && !importance && "bg-line-strong",
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
      aria-hidden
    />
  );
}
