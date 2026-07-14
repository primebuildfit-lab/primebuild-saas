import { useEffect, useState } from "react";
import { Modal, Button, Field, TextInput, Textarea, Select } from "~/components/ui";
import { useData } from "~/context/DataContext";
import type { EventCategory, Template } from "~/types/domain";
import { createId } from "~/lib/id";
import { EVENT_CATEGORIES } from "~/features/events/eventDisplay";
import { humanizeCategory } from "~/lib/format";

interface TemplateFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface Values {
  name: string;
  category: EventCategory;
  defaultDurationDays: string;
  defaultLeadDays: string;
  offer: string;
  notes: string;
}

const empty: Values = {
  name: "",
  category: "major_sales",
  defaultDurationDays: "7",
  defaultLeadDays: "30",
  offer: "",
  notes: "",
};

/** Create a reusable campaign template from scratch (MVP: basic structure). */
export function TemplateFormModal({ open, onClose }: TemplateFormModalProps) {
  const { store, addTemplate } = useData();
  const [values, setValues] = useState<Values>(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setValues(empty);
      setError("");
    }
  }, [open]);

  const patch = (p: Partial<Values>) => setValues((v) => ({ ...v, ...p }));

  const save = () => {
    if (!values.name.trim()) return setError("Give the template a name.");
    const template: Template = {
      id: createId("tpl"),
      storeId: store.id,
      name: values.name.trim(),
      category: values.category,
      defaultDurationDays: Math.max(1, Number(values.defaultDurationDays) || 1),
      defaultLeadDays: Math.max(0, Number(values.defaultLeadDays) || 0),
      offer: values.offer.trim() || undefined,
      notes: values.notes.trim() || undefined,
    };
    addTemplate(template);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New template"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Create template</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}
        <Field label="Template name" htmlFor="tpl-name" required>
          <TextInput
            id="tpl-name"
            value={values.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="e.g. Holiday Sale"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" htmlFor="tpl-cat">
            <Select
              id="tpl-cat"
              value={values.category}
              onChange={(e) => patch({ category: e.target.value as EventCategory })}
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanizeCategory(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Duration (days)" htmlFor="tpl-dur">
            <TextInput
              id="tpl-dur"
              type="number"
              min={1}
              value={values.defaultDurationDays}
              onChange={(e) => patch({ defaultDurationDays: e.target.value })}
            />
          </Field>
          <Field label="Lead (days)" htmlFor="tpl-lead">
            <TextInput
              id="tpl-lead"
              type="number"
              min={0}
              value={values.defaultLeadDays}
              onChange={(e) => patch({ defaultLeadDays: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Offer" htmlFor="tpl-offer">
          <TextInput
            id="tpl-offer"
            value={values.offer}
            onChange={(e) => patch({ offer: e.target.value })}
            placeholder="e.g. 20% off"
          />
        </Field>
        <Field label="Notes / strategy" htmlFor="tpl-notes">
          <Textarea
            id="tpl-notes"
            value={values.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="Structure, checklist, or strategy notes."
          />
        </Field>
      </div>
    </Modal>
  );
}
