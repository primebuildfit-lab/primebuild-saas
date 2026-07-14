import { cn } from "~/lib/cn";
import { ScoreBadge } from "./ScoreBadge";
import type { ScoreFactor } from "~/lib/opportunities";

/**
 * Explains an opportunity score instead of showing a bare number: the composite
 * score chip plus the REAL weighted signals that produced it (relevance,
 * category value, market reach, reliability). No invented dimensions.
 */
export function ScoreBreakdown({
  score,
  factors,
  className,
}: {
  score: number;
  factors: ScoreFactor[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <ScoreBadge score={score} />
        <span className="text-xs text-ink-muted">Opportunity score · rules-based</span>
      </div>
      <dl className="flex flex-col gap-2">
        {factors.map((f) => {
          const pct = Math.max(0, Math.min(100, (f.value / f.max) * 100));
          return (
            <div key={f.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2">
              <dt className="truncate text-xs text-ink-muted">{f.label}</dt>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <dd className="text-right text-xs font-medium tabular-nums text-ink">
                {Math.round(f.value)}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="text-[11px] text-ink-faint">
        Competition &amp; historical success are not yet scored — they need real
        performance data, so Eventra does not fake them.
      </p>
    </div>
  );
}
