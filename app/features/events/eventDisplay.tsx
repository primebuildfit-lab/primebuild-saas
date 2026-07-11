import {
  Tag,
  Flag,
  Sun,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory, Importance } from "~/types/domain";
import { Badge } from "~/components/ui";
import { humanizeCategory } from "~/lib/format";

/**
 * Category visuals use a NEUTRAL icon+label (never the 🟢🟡🔴 importance colors)
 * so priority and category are never confused (D11/D12).
 */
const categoryIcon: Record<EventCategory, LucideIcon> = {
  major_sales: Tag,
  national_holiday: Flag,
  seasonal: Sun,
  cultural: Sparkles,
};

export function CategoryBadge({ category }: { category: EventCategory }) {
  const Icon = categoryIcon[category];
  return (
    <Badge tone="gray">
      <Icon className="h-3 w-3" />
      {humanizeCategory(category)}
    </Badge>
  );
}

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  high: "High importance",
  medium: "Medium importance",
  low: "Niche / low",
};

export const EVENT_CATEGORIES: EventCategory[] = [
  "major_sales",
  "national_holiday",
  "seasonal",
  "cultural",
];

export const IMPORTANCE_LEVELS: Importance[] = ["high", "medium", "low"];
