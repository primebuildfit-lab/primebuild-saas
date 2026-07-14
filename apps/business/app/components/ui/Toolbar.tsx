import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

interface ToolbarProps {
  /** left cluster — typically search + filters */
  children: ReactNode;
  /** right cluster — typically sort + primary actions */
  actions?: ReactNode;
  className?: string;
}

/**
 * Shared list-surface toolbar: a responsive row that stacks on mobile and holds
 * search/filters on the left and sort/actions on the right. Reused across
 * Opportunities, Content, Media, Sources, Integrations, etc.
 */
export function Toolbar({ children, actions, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
