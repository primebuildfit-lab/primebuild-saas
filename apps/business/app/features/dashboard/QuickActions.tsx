import { useNavigate } from "react-router";
import { Plus, Calendar, Globe, Library } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui";
import { cn } from "~/lib/cn";

interface QuickActionsProps {
  onCreateCampaign: () => void;
}

/** Dashboard shortcuts (roadmap "Quick Actions"). Every button does something. */
export function QuickActions({ onCreateCampaign }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    tone: string;
  }[] = [
    {
      label: "Create campaign",
      icon: Plus,
      onClick: onCreateCampaign,
      tone: "bg-brand-500/15 text-brand-300",
    },
    {
      label: "Open calendar",
      icon: Calendar,
      onClick: () => navigate("/app/calendar"),
      tone: "bg-sky-500/15 text-sky-600",
    },
    {
      label: "Manage countries",
      icon: Globe,
      onClick: () => navigate("/app/countries"),
      tone: "bg-emerald-500/15 text-emerald-400",
    },
    {
      label: "Review saved",
      icon: Library,
      onClick: () => navigate("/app/campaign-library"),
      tone: "bg-amber-500/15 text-amber-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex items-center gap-3 rounded-lg border border-line p-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-500/15/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  action.tone,
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-ink">
                {action.label}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
