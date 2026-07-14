import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "~/lib/cn";

/** Inline spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-4 w-4 animate-spin text-ink-faint", className)}
      aria-hidden
    />
  );
}

/** Skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-line/70", className)}
      aria-hidden
    />
  );
}

/** Full-panel loading placeholder (used by route-level Suspense-like states). */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-16 text-sm text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <Spinner />
      {label}
    </div>
  );
}

/** Error panel shown by route ErrorBoundaries. */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-14 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/20 text-red-400">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
