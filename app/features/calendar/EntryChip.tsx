import { useDraggable } from "@dnd-kit/core";
import type { CalendarEntry } from "~/lib/planning";
import { cn } from "~/lib/cn";

const importanceBorder: Record<string, string> = {
  high: "border-l-emerald-500",
  medium: "border-l-amber-500",
  low: "border-l-red-500",
};

const statusBg: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  completed: "bg-brand-100 text-brand-800",
  archived: "bg-gray-100 text-gray-500",
};

function chipClasses(entry: CalendarEntry): string {
  if (entry.kind === "campaign") {
    return cn("border-l-2 border-l-transparent", statusBg[entry.status ?? "draft"]);
  }
  if (entry.kind === "event") {
    return cn(
      "border-l-2 bg-white text-gray-700",
      importanceBorder[entry.importance ?? "low"],
    );
  }
  return "border-l-2 border-l-gray-300 bg-gray-50 text-gray-700";
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
