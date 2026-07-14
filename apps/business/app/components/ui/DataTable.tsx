import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** cell renderer */
  cell: (row: T) => ReactNode;
  /** header + cell alignment */
  align?: "left" | "right" | "center";
  /** hide below the `sm` breakpoint to keep tables usable on mobile */
  hideOnMobile?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

/**
 * Generic, responsive table. Wrapped in an `overflow-x-auto` container so wide
 * tables scroll horizontally on small screens instead of breaking the layout.
 * Columns may opt out of mobile with `hideOnMobile`.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-line bg-surface shadow-sm",
        className,
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-2/60">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted",
                  alignClass[c.align ?? "left"],
                  c.hideOnMobile && "hidden sm:table-cell",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                onRowClick && "cursor-pointer transition-colors hover:bg-surface-2",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-ink",
                    alignClass[c.align ?? "left"],
                    c.hideOnMobile && "hidden sm:table-cell",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
