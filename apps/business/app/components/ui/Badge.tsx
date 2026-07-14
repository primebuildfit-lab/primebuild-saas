import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

export type BadgeTone = "gray" | "brand" | "green" | "amber" | "red" | "blue";

const tones: Record<BadgeTone, string> = {
  gray: "bg-surface-2 text-ink ring-line",
  brand: "bg-brand-500/15 text-brand-300 ring-brand-500/30",
  green: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  red: "bg-red-500/15 text-red-300 ring-red-500/30",
  blue: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
