import { cn } from "~/lib/cn";

interface ScoreBadgeProps {
  /** 0–100 opportunity score */
  score: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Opportunity score chip. Colour encodes the score band and is deliberately
 * distinct from the official-date importance colours (D11) so a strong score is
 * never confused with a "high importance" tag — it uses filled solid chips, not
 * the ring-style Badge tones.
 */
export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  const band =
    score >= 80
      ? "bg-emerald-600 text-white"
      : score >= 60
        ? "bg-brand-600 text-white"
        : score >= 40
          ? "bg-amber-500 text-white"
          : "bg-gray-400 text-white";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold tabular-nums",
        size === "sm" ? "h-6 min-w-[1.75rem] px-1.5 text-xs" : "h-7 min-w-[2.25rem] px-2 text-sm",
        band,
        className,
      )}
      title={`Opportunity score ${score} / 100`}
      aria-label={`Score ${score} out of 100`}
    >
      {score}
    </span>
  );
}
