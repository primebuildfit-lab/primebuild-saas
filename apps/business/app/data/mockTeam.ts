import { DEMO_STORE_ID } from "./mockStore";
import type { MembershipRole } from "~/types/domain";

/**
 * Team mock (Business UI reorg). Extends the identity model with activity and
 * responsibilities for the Team screen. Roles reuse the domain MembershipRole.
 * Typed mock under app/data per SOP §7 — demo people only, never real merchants.
 */
export interface TeamMember {
  id: string;
  storeId: string;
  name: string;
  email: string;
  role: MembershipRole;
  /** area this person owns */
  responsibility: string;
  /** campaigns they're driving */
  campaigns: number;
  lastActive: string; // ISO
  status: "active" | "invited";
}

export const teamMembers: TeamMember[] = [
  {
    id: "tm_owner",
    storeId: DEMO_STORE_ID,
    name: "Demo Owner",
    email: "owner@demo-store.example",
    role: "owner",
    responsibility: "Strategy & billing",
    campaigns: 2,
    lastActive: "2026-07-13T06:30:00Z",
    status: "active",
  },
  {
    id: "tm_marketer",
    storeId: DEMO_STORE_ID,
    name: "Alex Planner",
    email: "alex@demo-store.example",
    role: "admin",
    responsibility: "Campaigns & content",
    campaigns: 3,
    lastActive: "2026-07-12T18:00:00Z",
    status: "active",
  },
  {
    id: "tm_designer",
    storeId: DEMO_STORE_ID,
    name: "Sam Studio",
    email: "sam@demo-store.example",
    role: "staff",
    responsibility: "Media & creative",
    campaigns: 1,
    lastActive: "2026-07-11T11:00:00Z",
    status: "active",
  },
  {
    id: "tm_analyst",
    storeId: DEMO_STORE_ID,
    name: "Jordan Metrics",
    email: "jordan@demo-store.example",
    role: "staff",
    responsibility: "Analytics & sources",
    campaigns: 0,
    lastActive: "2026-07-01T09:00:00Z",
    status: "invited",
  },
];
