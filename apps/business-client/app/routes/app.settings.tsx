import { useState } from "react";
import { PageHeader, Tabs } from "~/components/ui";
import {
  AccountSettings,
  CalendarSettings,
  AppearanceSettings,
} from "~/features/settings/SettingsPanels";
import { BillingSummary } from "~/features/billing/BillingSummary";

export default function SettingsRoute() {
  const [tab, setTab] = useState("account");

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account, calendar preferences, and appearance."
      />

      <Tabs
        className="mb-4"
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "account", label: "Account" },
          { value: "calendar", label: "Calendar" },
          { value: "appearance", label: "Appearance" },
          { value: "billing", label: "Billing" },
        ]}
      />

      {tab === "account" ? <AccountSettings /> : null}
      {tab === "calendar" ? <CalendarSettings /> : null}
      {tab === "appearance" ? <AppearanceSettings /> : null}
      {tab === "billing" ? <BillingSummary /> : null}
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
