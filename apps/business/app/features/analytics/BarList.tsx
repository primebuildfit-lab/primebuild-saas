import { cn } from "~/lib/cn";

export interface BarDatum {
  label: string;
  value: number;
  colorClass?: string;
}

/** Minimal horizontal bar list — light analytics, no charting dependency. */
export function BarList({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-gray-500">
            {d.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn("h-full rounded-full bg-brand-500", d.colorClass)}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-medium text-gray-700">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
