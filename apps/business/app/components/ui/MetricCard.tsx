import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "~/lib/cn";

export interface MetricStat {
  label: string;
  value: string | number;
  /** optional tone for the value chip */
  tone?: "gray" | "green" | "amber" | "red" | "brand";
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** navigates here on click; renders the card as a link with an affordance */
  to?: string;
  /** small sub-metrics rendered as a wrap of label:value pairs */
  stats?: MetricStat[];
  /** freeform footer (e.g. a coverage bar) */
  footer?: ReactNode;
  hint?: string;
  className?: string;
}

const toneText: Record<NonNullable<MetricStat["tone"]>, string> = {
  gray: "text-ink-muted",
  green: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
  brand: "text-brand-300",
};

/**
 * A richer, clickable dashboard KPI card. Unlike StatTile it carries a set of
 * sub-metrics and an optional footer, and (when `to` is set) links into its
 * module — the Business dashboard is a control center, so every top card is a
 * doorway into the surface it summarizes.
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  to,
  stats,
  footer,
  hint,
  className,
}: MetricCardProps) {
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-sm transition-colors",
        to && "hover:border-brand-500/40 hover:bg-brand-500/10",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {to ? (
          <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-brand-500" />
        ) : Icon ? (
          <Icon className="h-4 w-4 text-ink-faint" />
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-ink">
          {value}
        </p>
        {Icon && to ? <Icon className="h-4 w-4 text-ink-faint" /> : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}

      {stats && stats.length > 0 ? (
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-1 text-xs">
              <dt className="text-ink-muted">{s.label}</dt>
              <dd className={cn("font-semibold", toneText[s.tone ?? "gray"])}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );

  if (!to) return body;
  return (
    <Link to={to} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl">
      {body}
    </Link>
  );
}
