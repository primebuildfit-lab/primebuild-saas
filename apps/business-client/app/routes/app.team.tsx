import { UsersRound, UserCheck, Megaphone, Clock } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Badge,
  DataTable,
  Button,
  type BadgeTone,
  type Column,
} from "~/components/ui";
import { teamMembers, type TeamMember } from "~/data";
import type { MembershipRole } from "~/types/domain";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const ROLE_TONE: Record<MembershipRole, BadgeTone> = {
  owner: "brand",
  admin: "blue",
  staff: "gray",
};

export default function TeamRoute() {
  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const invited = teamMembers.filter((m) => m.status === "invited").length;
  const totalCampaigns = teamMembers.reduce((s, m) => s + m.campaigns, 0);

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      header: "Member",
      cell: (m) => (
        <div>
          <div className="font-medium text-ink">{m.name}</div>
          <div className="text-xs text-ink-muted">{m.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m) => <Badge tone={ROLE_TONE[m.role]}>{humanizeCategory(m.role)}</Badge>,
    },
    {
      key: "responsibility",
      header: "Responsibility",
      hideOnMobile: true,
      cell: (m) => <span className="text-sm text-ink-muted">{m.responsibility}</span>,
    },
    {
      key: "campaigns",
      header: "Campaigns",
      align: "right",
      hideOnMobile: true,
      cell: (m) => <span className="tabular-nums text-ink">{m.campaigns}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <Badge tone={m.status === "active" ? "green" : "amber"}>
          {m.status === "active" ? "Active" : "Invited"}
        </Badge>
      ),
    },
    {
      key: "lastActive",
      header: "Last active",
      align: "right",
      hideOnMobile: true,
      cell: (m) => <span className="text-sm text-ink-muted">{formatDate(m.lastActive.slice(0, 10))}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Team"
        description="Who's planning with you — roles, responsibilities, and the campaigns each member drives."
        actions={<Button size="sm" disabled title="Coming soon">Invite member</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Members" value={teamMembers.length} icon={UsersRound} />
        <StatTile label="Active" value={activeMembers} icon={UserCheck} />
        <StatTile label="Invited" value={invited} icon={Clock} />
        <StatTile label="Campaigns owned" value={totalCampaigns} icon={Megaphone} />
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={teamMembers} rowKey={(m) => m.id} />
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
