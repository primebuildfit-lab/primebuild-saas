import { useDraggable } from "@dnd-kit/core";
import type { CalendarEntry } from "~/lib/planning";
import { cn } from "~/lib/cn";

const importanceBorder: Record<string, string> = {
  high: "border-l-emerald-500",
  medium: "border-l-amber-500",
  low: "border-l-red-500",
};

const statusBg: Record<string, string> = {
  draft: "bg-surface-2 text-ink",
  scheduled: "bg-sky-100 text-sky-800",
  active: "bg-emerald-500/20 text-emerald-800",
  completed: "bg-brand-500/25 text-brand-800",
  archived: "bg-surface-2 text-ink-muted",
};

function chipClasses(entry: CalendarEntry): string {
  if (entry.kind === "campaign") {
    return cn("border-l-2 border-l-transparent", statusBg[entry.status ?? "draft"]);
  }
  if (entry.kind === "event") {
    return cn(
      "border-l-2 bg-surface text-ink",
      importanceBorder[entry.importance ?? "low"],
    );
  }
  return "border-l-2 border-l-gray-300 bg-surface-2 text-ink";
}

interface EntryChipProps {
  entry: CalendarEntry;
  onClick?: () => void;
  compact?: boolean;
}

/** A calendar entry chip. Campaigns are draggable (drag-to-move); others static. */
export function EntryChip({ entry, onClick, compact }: EntryChipProps) {
  const draggable = entry.kind === "campaign";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `chip:${entry.key}`,
    data: { entry },
    disabled: !draggable,
  });

  return (
    <button
      ref={draggable ? setNodeRef : undefined}
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
        chipClasses(entry),
      )}
      style={
        entry.kind === "custom" && entry.color
          ? { borderLeftColor: entry.color }
          : undefined
      }
      title={entry.title}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
    >
      <span className="truncate">{compact ? "•" : entry.title}</span>
    </button>
  );
}
