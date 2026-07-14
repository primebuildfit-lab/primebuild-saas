import { useState } from "react";
import { Package, Layers, Check } from "lucide-react";
import { Modal, SearchInput, Button, Badge } from "~/components/ui";
import { catalogRefs, getCatalogRef, type CatalogRef } from "~/data";
import { cn } from "~/lib/cn";

/** Read-only chips showing attached products/collections. */
export function AttachedRefs({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return <p className="text-sm text-ink-faint">No products or collections attached.</p>;
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
      <SearchInput
        className="mb-3"
        value={query}
        onValueChange={setQuery}
        placeholder="Search catalog…"
        aria-label="Search catalog"
      />

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
                  : "border-transparent hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  ref.kind === "collection"
                    ? "bg-sky-100 text-sky-600"
                    : "bg-surface-2 text-ink-muted",
                )}
              >
                {ref.kind === "collection" ? (
                  <Layers className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {ref.title}
                </span>
                <span className="block text-xs text-ink-faint">
                  {ref.kind === "collection"
                    ? `${ref.productCount} products`
                    : `$${ref.price} · ${ref.inventory} in stock`}
                </span>
              </span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 text-brand-700" />
              ) : null}
            </button>
          );
        })}
        {results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-faint">
            No matches for “{query}”.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
