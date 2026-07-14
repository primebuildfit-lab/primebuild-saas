import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Field,
  TextInput,
  Textarea,
  Select,
  Toggle,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { CustomEvent, EventCategory } from "~/types/domain";
import { EVENT_CATEGORIES } from "./eventDisplay";
import { humanizeCategory } from "~/lib/format";

interface CustomEventFormModalProps {
  open: boolean;
  onClose: () => void;
  /** provide to edit an existing custom event */
  eventId?: string;
}

interface Values {
  name: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  color: string;
  description: string;
  recurring: boolean;
}

const empty: Values = {
  name: "",
  startDate: "",
  endDate: "",
  category: "seasonal",
  color: "",
  // Repeat next year defaults ON for recurring events (D14).
  recurring: true,
  description: "",
};

export function CustomEventFormModal({
  open,
  onClose,
  eventId,
}: CustomEventFormModalProps) {
  const { customEvents, addCustomEvent, updateCustomEvent } = useData();
  const editing = eventId
    ? customEvents.find((e) => e.id === eventId)
    : undefined;

  const [values, setValues] = useState<Values>(empty);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setValues({
        name: editing.name,
        startDate: editing.startDate,
        endDate: editing.endDate ?? "",
        category: editing.category,
        color: editing.color ?? "",
        description: editing.description ?? "",
        recurring: editing.recurring,
      });
    } else {
      setValues(empty);
    }
    setError("");
  }, [open, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (p: Partial<Values>) => setValues((v) => ({ ...v, ...p }));

  const save = () => {
    if (!values.name.trim()) return setError("Give the event a name.");
    if (!values.startDate) return setError("A start date is required.");
    if (values.endDate && values.endDate < values.startDate) {
      return setError("End date must be on or after the start date.");
    }
    const payload: Omit<CustomEvent, "id" | "storeId"> = {
      name: values.name.trim(),
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      category: values.category,
      color: values.color || undefined,
      description: values.description.trim() || undefined,
      recurring: values.recurring,
    };
    if (editing) {
      updateCustomEvent(editing.id, payload);
    } else {
      addCustomEvent(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit event" : "Create custom event"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{editing ? "Save changes" : "Create event"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <Field label="Event name" htmlFor="cev-name" required>
          <TextInput
            id="cev-name"
            value={values.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="e.g. Store Anniversary Sale"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="cev-start" required>
            <TextInput
              id="cev-start"
              type="date"
              value={values.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </Field>
          <Field label="End date" htmlFor="cev-end" hint="Optional (single day if empty)">
            <TextInput
              id="cev-end"
              type="date"
              value={values.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="cev-category">
            <Select
              id="cev-category"
              value={values.category}
              onChange={(e) =>
                patch({ category: e.target.value as EventCategory })
              }
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanizeCategory(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Color" htmlFor="cev-color" hint="Category indicator (optional)">
            <input
              id="cev-color"
              type="color"
              value={values.color || "#6366f1"}
              onChange={(e) => patch({ color: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="cev-desc">
          <Textarea
            id="cev-desc"
            value={values.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="What is this event and why does it matter?"
          />
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-ink">Repeat next year</p>
            <p className="text-xs text-ink-muted">
              Recurring events default to on; you can turn this off.
            </p>
          </div>
          <Toggle
            checked={values.recurring}
            onCheckedChange={(recurring) => patch({ recurring })}
            label="Repeat next year"
          />
        </div>
      </div>
    </Modal>
  );
}
