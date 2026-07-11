import type { LucideIcon } from "lucide-react";
import { PageHeader } from "~/components/ui/PageHeader";
import { EmptyState } from "~/components/ui/EmptyState";

interface PlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** approval gate that will deliver this surface */
  gate: number;
  note: string;
}

/**
 * Honest placeholder for surfaces delivered in a later approval gate.
 * Follows the button-behavior rule: no fake-functional controls here.
 */
export function Placeholder({
  title,
  description,
  icon,
  gate,
  note,
}: PlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`Coming in Phase ${gate}`}
        description={note}
      />
    </div>
  );
}
