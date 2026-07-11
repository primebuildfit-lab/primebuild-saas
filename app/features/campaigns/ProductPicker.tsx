import { useState } from "react";
import { Package, Layers, Search, Check } from "lucide-react";
import { Modal, TextInput, Button, Badge } from "~/components/ui";
import { catalogRefs, getCatalogRef, type CatalogRef } from "~/data";
import { cn } from "~/lib/cn";

/** Read-only chips showing attached products/collections. */
export function AttachedRefs({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return <p className="text-sm text-gray-400">No products or collections attached.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const ref = getCatalogRef(id);
        if (!ref) return null;
        return (
          <Badge key={id} tone={ref.kind === "collection" ? "blue" : "gray"}>
            {ref.kind === "collection" ? (
              <Layers className="h-3 w-3" />
            ) : (
              <Package className="h-3 w-3" />
            )}
            {ref.title}
          </Badge>
        );
      })}
    </div>
  );
}

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Attach products/collections from the mock Shopify catalog. In Phase 5 this
 * reads live products via the Admin API; the shape (id references) is unchanged.
 */
export function ProductPicker({
  open,
  onClose,
  selected,
  onChange,
}: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? catalogRefs.filter((r) => r.title.toLowerCase().includes(q))
    : catalogRefs;

  const toggle = (ref: CatalogRef) => {
    onChange(
      selected.includes(ref.id)
        ? selected.filter((id) => id !== ref.id)
        : [...selected, ref.id],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attach products & collections"
      footer={
        <Button onClick={onClose}>
          Done ({selected.length})
        </Button>
      }
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search catalog…"
          className="pl-9"
          aria-label="Search catalog"
        />
      </div>

      <div className="max-h-80 space-y-1 overflow-y-auto">
        {results.map((ref) => {
          const isSelected = selected.includes(ref.id);
          return (
            <button
              key={ref.id}
              type="button"
              onClick={() => toggle(ref)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-brand-200 bg-brand-50"
                  : "border-transparent hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  ref.kind === "collection"
                    ? "bg-sky-100 text-sky-600"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {ref.kind === "collection" ? (
                  <Layers className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">
                  {ref.title}
                </span>
                <span className="block text-xs text-gray-400">
                  {ref.kind === "collection"
                    ? `${ref.productCount} products`
                    : `$${ref.price} · ${ref.inventory} in stock`}
                </span>
              </span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 text-brand-600" />
              ) : null}
            </button>
          );
        })}
        {results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-400">
            No matches for “{query}”.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
