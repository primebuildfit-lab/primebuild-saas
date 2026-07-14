import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  Sparkles,
  Megaphone,
  Wand2,
  Tag,
  FolderKanban,
  BarChart3,
  Users,
  LayoutTemplate,
  Image,
  Rss,
  Globe,
  BrainCog,
  UsersRound,
  Plug,
  CreditCard,
  Settings,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** approval gate that delivers this surface (internal reference) */
  gate: number;
  /** end match for the index route */
  end?: boolean;
  /** short helper shown in command surfaces / tooltips */
  hint?: string;
}

export interface NavGroup {
  /** section label rendered above the group (uppercase) */
  label: string;
  items: NavItem[];
}

/**
 * Definitive Eventra Business navigation — commercial redesign (2026-07-13).
 *
 * The product is organised around the real commercial flow:
 *   discover opportunity → evaluate → select → campaign → content → publish →
 *   results → learning → reuse next year.
 * Opportunities is the centre; the calendar is one tool inside the product.
 *
 * Five commercial groups (Planning / Create / Knowledge / Resources / Company)
 * replace the old technical grouping. Labels stay English to match the shipped
 * product, tests, and page headings. Internal/administrative surfaces (AI,
 * Automations, Jobs, Admin) are intentionally OUT of the primary Business nav —
 * the Internal OS stays separate. Their routes remain reachable by deep link and
 * from Settings. See docs/BUSINESS_INFORMATION_ARCHITECTURE.md.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutDashboard, gate: 2, end: true, hint: "What to do today" },
    ],
  },
  {
    label: "Planning",
    items: [
      { label: "Calendar", to: "/app/calendar", icon: Calendar, gate: 2, hint: "Annual marketing calendar" },
      { label: "Events & news", to: "/app/events", icon: Newspaper, gate: 2, hint: "Marketing events & news feed" },
      { label: "Opportunities", to: "/app/opportunities", icon: Sparkles, gate: 2, hint: "Commercial value of events" },
      { label: "Advertisements", to: "/app/advertisements", icon: Megaphone, gate: 3, hint: "The marketing pieces you run" },
      { label: "Campaigns", to: "/app/campaigns", icon: FolderKanban, gate: 3, hint: "Group advertisements" },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Promotion Builder", to: "/app/promotion-builder", icon: Wand2, gate: 3, hint: "Event → offer → advertisement" },
      { label: "Offers", to: "/app/offers", icon: Tag, gate: 3, hint: "Reusable commercial benefits" },
      { label: "Templates", to: "/app/templates", icon: LayoutTemplate, gate: 3, hint: "Reusable structures" },
      { label: "Content", to: "/app/content", icon: FolderKanban, gate: 3, hint: "Marketing workspace" },
      { label: "Media", to: "/app/media", icon: Image, gate: 3, hint: "Images, video, files" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Marketing Memory", to: "/app/memory", icon: BrainCog, gate: 3, hint: "What worked, to reuse" },
      { label: "Analytics", to: "/app/analytics", icon: BarChart3, gate: 4, hint: "Ask questions of your data" },
      { label: "Countries", to: "/app/countries", icon: Globe, gate: 2, hint: "Where to focus" },
      { label: "Sources", to: "/app/sources", icon: Rss, gate: 4, hint: "Where events come from" },
      { label: "Audiences", to: "/app/audiences", icon: Users, gate: 4, hint: "Segments & comparison" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Team", to: "/app/team", icon: UsersRound, gate: 4, hint: "Members & roles" },
      { label: "Integrations", to: "/app/integrations", icon: Plug, gate: 4, hint: "Connected platforms" },
      { label: "Plan & billing", to: "/app/billing", icon: CreditCard, gate: 4, hint: "Plan, trial, limits" },
      { label: "Settings", to: "/app/settings", icon: Settings, gate: 4, hint: "Preferences" },
    ],
  },
];

/** Platform surface — kept separate; visible to platform roles only in later gates. */
export const platformNav: NavItem[] = [
  { label: "Admin", to: "/app/admin", icon: ShieldCheck, gate: 4 },
];

/** Flat list of every navigable destination (command palette, tests, breadcrumbs). */
export const allNavItems: NavItem[] = [
  ...navGroups.flatMap((g) => g.items),
  ...platformNav,
];
