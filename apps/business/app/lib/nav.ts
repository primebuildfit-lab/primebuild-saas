import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  Megaphone,
  Library,
  LayoutTemplate,
  Globe,
  BarChart3,
  Settings,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** approval gate that delivers this surface (for internal reference) */
  gate: number;
  /** end match for the index route */
  end?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard, gate: 2, end: true },
  { label: "Calendar", to: "/app/calendar", icon: Calendar, gate: 2 },
  { label: "Events", to: "/app/events", icon: CalendarClock, gate: 2 },
  { label: "Campaigns", to: "/app/campaigns", icon: Megaphone, gate: 3 },
  { label: "Campaign Library", to: "/app/campaign-library", icon: Library, gate: 3 },
  { label: "Templates", to: "/app/templates", icon: LayoutTemplate, gate: 3 },
  { label: "Countries", to: "/app/countries", icon: Globe, gate: 2 },
  { label: "Analytics", to: "/app/analytics", icon: BarChart3, gate: 4 },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", to: "/app/settings", icon: Settings, gate: 4 },
  { label: "Billing", to: "/app/billing", icon: CreditCard, gate: 4 },
];

export const adminNav: NavItem[] = [
  { label: "Admin", to: "/app/admin", icon: ShieldCheck, gate: 4 },
];
