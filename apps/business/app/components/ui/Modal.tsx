import { useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "~/lib/cn";
import { useDialog } from "~/hooks/useDialog";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useDialog<HTMLDivElement>(open, onClose);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-surface-2/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-line bg-surface shadow-xl focus:outline-none",
          className,
        )}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id={titleId} className="text-sm font-semibold text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-ink-faint hover:bg-surface-2 hover:text-ink-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
