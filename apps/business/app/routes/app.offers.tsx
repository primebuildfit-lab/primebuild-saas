import { useMemo, useState } from "react";
import { Tag, Plus, Percent } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Badge,
  DataTable,
  Button,
  EmptyState,
  Modal,
  Field,
  type Column,
} from "~/components/ui";
import { TextInput, Select } from "~/components/ui/FormControls";
import { useAdvertising } from "~/context/AdvertisingContext";
import { formatDate } from "~/lib/dates";
import type { Offer, OfferType } from "~/types/advertising";
import { OFFER_TYPE_LABEL } from "~/features/advertising/advertisingLabels";

const OFFER_TYPES: OfferType[] = [
  "percentage",
  "fixed_price",
  "amount_off",
  "bundle",
  "free_gift",
  "free_shipping",
  "condition",
];

/**
 * Offers — the reusable commercial benefits (%, price, bundle, gift, shipping…).
 * An offer is NOT trapped inside a template: it can be applied to many templates
 * and advertisements. Real tenant data only.
 */
export default function OffersRoute() {
  const { offers, createOffer } = useAdvertising();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<OfferType>("percentage");
  const [value, setValue] = useState("");
  const [condition, setCondition] = useState("");

  const active = useMemo(() => offers.filter((o) => o.status === "active").length, [offers]);

  const submit = () => {
    if (!name.trim()) return;
    createOffer({
      name: name.trim(),
      type,
      value: value ? Number(value) : undefined,
      condition: condition.trim() || undefined,
      productRefs: [],
      status: "draft",
    });
    setName("");
    setValue("");
    setCondition("");
    setType("percentage");
    setOpen(false);
  };

  const columns: Column<Offer>[] = [
    { key: "name", header: "Offer", cell: (o) => <span className="font-medium text-ink">{o.name}</span> },
    { key: "type", header: "Type", cell: (o) => <Badge tone="brand">{OFFER_TYPE_LABEL[o.type]}</Badge> },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (o) =>
        o.value != null
          ? o.type === "percentage"
            ? `${o.value}%`
            : `${o.value}`
          : o.condition || "—",
    },
    { key: "status", header: "Status", cell: (o) => <Badge tone={o.status === "active" ? "green" : "gray"}>{o.status}</Badge> },
    { key: "updated", header: "Updated", align: "right", hideOnMobile: true, cell: (o) => <span className="text-sm text-ink-muted">{formatDate(o.updatedAt.slice(0, 10))}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Offers"
        description="Reusable commercial benefits — discounts, bundles, gifts, free shipping. Apply the same offer across templates and advertisements."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New offer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Offers" value={offers.length} icon={Tag} />
        <StatTile label="Active" value={active} icon={Percent} />
      </div>

      <div className="mt-6">
        {offers.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No offers yet"
            description="Create your first offer — a percentage, a fixed price, a bundle or free shipping — then reuse it in the Promotion Builder."
            action={<Button onClick={() => setOpen(true)}>Create offer</Button>}
          />
        ) : (
          <DataTable columns={columns} rows={offers} rowKey={(o) => o.id} />
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New offer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!name.trim()}>
              Create offer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Black Friday 25%" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value as OfferType)}>
                {OFFER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {OFFER_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Value" hint="Percent or amount (optional)">
              <TextInput type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="25" />
            </Field>
          </div>
          <Field label="Condition" hint="Optional (e.g. orders over $50)">
            <TextInput value={condition} onChange={(e) => setCondition(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
