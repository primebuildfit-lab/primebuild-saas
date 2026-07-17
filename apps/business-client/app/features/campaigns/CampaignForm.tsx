import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import {
  Field,
  TextInput,
  Textarea,
  Select,
  Button,
  Toggle,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { createId } from "~/lib/id";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABEL } from "~/lib/campaigns";
import { getCountry } from "~/data";
import { AttachedRefs, ProductPicker } from "./ProductPicker";
import {
  type CampaignFormValues,
  type CampaignFormErrors,
} from "./campaignModel";

interface CampaignFormProps {
  values: CampaignFormValues;
  onChange: (patch: Partial<CampaignFormValues>) => void;
  errors: CampaignFormErrors;
  /** hide the status selector when creating from a fresh draft */
  showStatus?: boolean;
  idPrefix?: string;
}

export function CampaignForm({
  values,
  onChange,
  errors,
  showStatus = true,
  idPrefix = "cf",
}: CampaignFormProps) {
  const { globalEvents, enabledCountryCodes } = useData();
  const [pickerOpen, setPickerOpen] = useState(false);

  const addAction = () =>
    onChange({
      actions: [
        ...values.actions,
        { id: createId("act"), label: "New checklist item", done: false },
      ],
    });

  const updateAction = (id: string, patch: Partial<(typeof values.actions)[number]>) =>
    onChange({
      actions: values.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });

  const removeAction = (id: string) =>
    onChange({ actions: values.actions.filter((a) => a.id !== id) });

  return (
    <div className="space-y-4">
      <Field label="Campaign name" htmlFor={`${idPrefix}-name`} required error={errors.name}>
        <TextInput
          id={`${idPrefix}-name`}
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Black Friday 2026"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Linked event" htmlFor={`${idPrefix}-event`} hint="Optional">
          <Select
            id={`${idPrefix}-event`}
            value={values.globalEventId}
            onChange={(e) => onChange({ globalEventId: e.target.value })}
          >
            <option value="">No linked event</option>
            {globalEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Country" htmlFor={`${idPrefix}-country`} hint="Optional">
          <Select
            id={`${idPrefix}-country`}
            value={values.country}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            <option value="">All markets</option>
            {enabledCountryCodes.map((code) => (
              <option key={code} value={code}>
                {getCountry(code)?.name ?? code}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Objective" htmlFor={`${idPrefix}-objective`} hint="What is this campaign trying to achieve?">
        <TextInput
          id={`${idPrefix}-objective`}
          value={values.objective}
          onChange={(e) => onChange({ objective: e.target.value })}
          placeholder="e.g. Maximize Q4 revenue during peak season"
        />
      </Field>

      <Field label="Strategy / description" htmlFor={`${idPrefix}-description`}>
        <Textarea
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the plan, audience, and channels."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Prep start" htmlFor={`${idPrefix}-prep`} hint="When to begin">
          <TextInput
            id={`${idPrefix}-prep`}
            type="date"
            value={values.prepStart}
            onChange={(e) => onChange({ prepStart: e.target.value })}
          />
        </Field>
        <Field label="Start date" htmlFor={`${idPrefix}-start`} required error={errors.startDate}>
          <TextInput
            id={`${idPrefix}-start`}
            type="date"
            value={values.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </Field>
        <Field label="End date" htmlFor={`${idPrefix}-end`} required error={errors.endDate}>
          <TextInput
            id={`${idPrefix}-end`}
            type="date"
            value={values.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Offer / discount" htmlFor={`${idPrefix}-offer`}>
          <TextInput
            id={`${idPrefix}-offer`}
            value={values.offer}
            onChange={(e) => onChange({ offer: e.target.value })}
            placeholder="e.g. Up to 40% off"
          />
        </Field>
        {showStatus ? (
          <Field label="Status" htmlFor={`${idPrefix}-status`}>
            <Select
              id={`${idPrefix}-status`}
              value={values.status}
              onChange={(e) =>
                onChange({ status: e.target.value as CampaignFormValues["status"] })
              }
            >
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CAMPAIGN_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </div>

      <Field label="Products & collections" hint="Attach items this campaign promotes (optional)">
        <div className="rounded-lg border border-line p-3">
          <AttachedRefs ids={values.productRefs} />
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPickerOpen(true)}
            >
              <Package className="h-4 w-4" />
              Manage attachments
            </Button>
          </div>
        </div>
      </Field>

      <Field
        label="Action checklist"
        hint="Visual planning only — actions never change your store in V1."
      >
        <div className="space-y-2">
          {values.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2">
              <Toggle
                checked={action.done}
                onCheckedChange={(done) => updateAction(action.id, { done })}
                label={`Mark "${action.label}" done`}
              />
              <TextInput
                value={action.label}
                onChange={(e) => updateAction(action.id, { label: e.target.value })}
                className="h-9"
              />
              <button
                type="button"
                onClick={() => removeAction(action.id)}
                className="rounded-md p-2 text-ink-faint hover:bg-surface-2 hover:text-red-600"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addAction}>
            <Plus className="h-4 w-4" />
            Add checklist item
          </Button>
        </div>
      </Field>

      <Field label="Notes" htmlFor={`${idPrefix}-notes`}>
        <Textarea
          id={`${idPrefix}-notes`}
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Results, learnings, or reminders for next time."
        />
      </Field>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={values.productRefs}
        onChange={(productRefs) => onChange({ productRefs })}
      />
    </div>
  );
}
