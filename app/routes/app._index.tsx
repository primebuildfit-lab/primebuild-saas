import { Globe, CalendarClock, Layers, CalendarRange, CheckCircle2 } from "lucide-react";
import { useCurrentStore } from "~/context/StoreContext";
import { usePlan } from "~/context/PlanContext";
import { globalEvents, campaigns, getCountry } from "~/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatTile,
  Badge,
  Button,
} from "~/components/ui";
import { PageHeader } from "~/components/ui/PageHeader";

const foundationChecklist = [
  "Official Shopify React Router app template (App Bridge + auth)",
  "TypeScript + Tailwind design system",
  "Responsive app shell & navigation",
  "Reusable UI component library",
  "Typed mock-data architecture",
  "Store & Plan tenant contexts",
];

export default function AppHome() {
  const { store, enabledCountryCodes } = useCurrentStore();
  const { plan } = usePlan();

  return (
    <div>
      <PageHeader
        title={`Welcome to Eventra, ${store.name}`}
        description="Plan marketing events, prepare campaigns early, and reuse what works."
        actions={
          <Button disabled title="Available in Phase 2">
            Create campaign
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Active countries"
          value={enabledCountryCodes.length}
          icon={Globe}
          hint={enabledCountryCodes
            .map((c) => getCountry(c)?.name ?? c)
            .join(", ")}
        />
        <StatTile
          label="Official events"
          value={globalEvents.length}
          icon={CalendarClock}
          hint="US + Canada catalog (mock)"
        />
        <StatTile
          label="Demo campaigns"
          value={campaigns.length}
          icon={Layers}
          hint="Seed data for previewing"
        />
        <StatTile
          label="Plan"
          value={plan.name}
          icon={CalendarRange}
          hint={`Plan ${plan.planningHorizonMonths} months ahead`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Phase 1 — Foundation (ready for review)</CardTitle>
            <Badge tone="green">Ready for review</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The app now runs on the official Shopify React Router template with
              App Bridge and an authenticated <code>/app</code> layout. The UI,
              design system, domain types, and mock data are driven by typed mock
              data (swappable for real Supabase/API reads in Phase 5). Typecheck
              and production build pass.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {foundationChecklist.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next: Phase 2 — Core Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The real dashboard, year &amp; month calendars (with drag-to-move),
              country management, and the event creator land in the next gate.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="gray">Dashboard</Badge>
              <Badge tone="gray">Calendar</Badge>
              <Badge tone="gray">Events</Badge>
              <Badge tone="gray">Countries</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
