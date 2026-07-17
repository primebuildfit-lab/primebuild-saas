import type { ReactNode } from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  LinkButton,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { formatLimitValue, formatPrice } from "~/lib/format";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function AccountRoute() {
  const { user, store, membership, plan } = useData();

  return (
    <div>
      <PageHeader
        title="Account"
        description="Your identity, workspace, and plan at a glance. Manage the details from Settings, Team, and Billing."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Role" value={<Badge tone="brand">{membership.role}</Badge>} />
            </dl>
            <div className="mt-4">
              <LinkButton to="/app/settings" variant="secondary" size="sm">
                Edit in Settings
              </LinkButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Store" value={store.name} />
              <Row label="Domain" value={store.shopDomain} />
              <Row label="Store ID" value={<code className="text-xs">{store.id}</code>} />
            </dl>
            <div className="mt-4">
              <LinkButton to="/app/team" variant="secondary" size="sm">
                Manage team
              </LinkButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Plan" value={<Badge tone="green">{plan.name}</Badge>} />
              <Row label="Price" value={formatPrice(plan.priceMonthly)} />
              <Row label="Planning horizon" value={`${plan.planningHorizonMonths} months`} />
              <Row label="Country limit" value={formatLimitValue(plan.countryLimit)} />
              <Row label="Saved campaigns" value={formatLimitValue(plan.savedCampaignLimit)} />
            </dl>
            <div className="mt-4">
              <LinkButton to="/app/billing" size="sm">
                Manage billing
              </LinkButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">
              Eventra signs in through your Shopify session — there’s no separate
              password to manage here. Session and access controls live in Settings.
            </p>
            <div className="mt-4">
              <LinkButton to="/app/settings" variant="secondary" size="sm">
                Security settings
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
