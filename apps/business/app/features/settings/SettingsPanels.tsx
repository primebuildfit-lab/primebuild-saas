import { useState } from "react";
import { Plus, X, Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  TextInput,
  SegmentedControl,
  Badge,
  Button,
  LinkButton,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { ACCENT_OPTIONS } from "~/lib/accents";
import type { AccentColor, Density } from "~/types/domain";
import { cn } from "~/lib/cn";

/** Account overview (read-only store identity + plan link). */
export function AccountSettings() {
  const { store, user, plan } = useData();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name" htmlFor="acc-name">
          <TextInput id="acc-name" value={store.name} readOnly />
        </Field>
        <Field label="Shop domain" htmlFor="acc-domain">
          <TextInput id="acc-domain" value={store.shopDomain} readOnly />
        </Field>
        <Field label="Owner" htmlFor="acc-owner">
          <TextInput id="acc-owner" value={user.email} readOnly />
        </Field>
        <Field label="Current plan" hint="Manage in Plans & billing">
          <div className="flex h-10 items-center gap-2">
            <Badge tone="brand">{plan.name}</Badge>
            <LinkButton to="/app/billing" variant="secondary" size="sm">
              Change plan
            </LinkButton>
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}

/** Calendar preferences: week start, default view, reminders. */
export function CalendarSettings() {
  const { preferences, updatePreferences } = useData();
  const [newReminder, setNewReminder] = useState("");

  const reminders = [...preferences.reminderDefaults].sort((a, b) => b - a);

  const addReminder = () => {
    const n = Number(newReminder);
    if (!n || n <= 0 || reminders.includes(n)) return;
    updatePreferences({ reminderDefaults: [...reminders, n] });
    setNewReminder("");
  };

  const removeReminder = (n: number) =>
    updatePreferences({
      reminderDefaults: reminders.filter((r) => r !== n),
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Week starts on</span>
          <SegmentedControl<"0" | "1">
            aria-label="Week starts on"
            segments={[
              { value: "0", label: "Sunday" },
              { value: "1", label: "Monday" },
            ]}
            value={String(preferences.weekStartsOn) as "0" | "1"}
            onChange={(v) =>
              updatePreferences({ weekStartsOn: Number(v) as 0 | 1 })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Default view</span>
          <SegmentedControl<"month" | "year">
            aria-label="Default calendar view"
            segments={[
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
            value={preferences.calendarFormat}
            onChange={(v) => updatePreferences({ calendarFormat: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Bell className="h-4 w-4 text-ink-faint" />
            Reminder milestones (days before)
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {reminders.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-medium text-brand-300"
              >
                {r} days
                <button
                  type="button"
                  onClick={() => removeReminder(r)}
                  aria-label={`Remove ${r} day reminder`}
                  className="text-brand-400 hover:text-brand-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <TextInput
                type="number"
                min={1}
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="Add"
                className="h-8 w-20"
                aria-label="New reminder days"
              />
              <Button size="sm" variant="ghost" onClick={addReminder}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            In-app prep reminders only — no email/push automation in V1.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Appearance: accent + density, applied live via the shell. */
export function AppearanceSettings() {
  const { preferences, updatePreferences } = useData();
  const accent = preferences.accent ?? "indigo";
  const density = preferences.density ?? "comfortable";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Accent color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_OPTIONS.map((option) => {
              const active = option.value === accent;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferences({ accent: option.value as AccentColor })
                  }
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    active
                      ? "border-brand-500 bg-surface-2 ring-1 ring-inset ring-brand-500/40"
                      : "border-line hover:bg-surface-2",
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: option.swatch }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink-faint">
            The accent re-tints buttons, links, and highlights across the app.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Calendar density</span>
          <SegmentedControl<Density>
            aria-label="Calendar density"
            segments={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ]}
            value={density}
            onChange={(v) => updatePreferences({ density: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
