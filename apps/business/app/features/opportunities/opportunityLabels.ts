import type { BadgeTone } from "~/components/ui";
import type {
  OpportunityDifficulty,
  OpportunityPriority,
  OpportunityState,
} from "~/lib/opportunities";

export const STATE_LABEL: Record<OpportunityState, string> = {
  verified: "Verified",
  new: "New",
  modified: "Modified",
  cancelled: "Dismissed",
  archived: "Archived",
};

export const STATE_TONE: Record<OpportunityState, BadgeTone> = {
  verified: "green",
  new: "blue",
  modified: "amber",
  cancelled: "gray",
  archived: "gray",
};

export const PRIORITY_LABEL: Record<OpportunityPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_TONE: Record<OpportunityPriority, BadgeTone> = {
  urgent: "red",
  high: "amber",
  medium: "brand",
  low: "gray",
};

export const DIFFICULTY_LABEL: Record<OpportunityDifficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

/** Order the lifecycle tabs/filter chips are presented in. */
export const STATE_ORDER: OpportunityState[] = [
  "verified",
  "new",
  "modified",
  "cancelled",
  "archived",
];
