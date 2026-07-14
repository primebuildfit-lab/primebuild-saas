import { useState } from "react";
import { ChevronDown, Copy, Check, ExternalLink, Code2 } from "lucide-react";
import { Badge, Button } from "~/components/ui";
import { PROMO_TEMPLATES, promoPreviewDoc, type PromoTemplate } from "@eventra/promotions";
import { cn } from "~/lib/cn";

/**
 * Promotion blocks — ready-to-use Liquid promo blocks from the shared
 * @eventra/promotions catalog. Each row is a collapsible ("desplegable") entry:
 * expand it to preview how it looks in the storefront, copy the Liquid, or (once
 * the Shopify app is connected) publish it to the store.
 *
 * The preview iframe is sandboxed with NO script permission, so the promo's own
 * markup renders but nothing executes here.
 */

function PromoRow({ t }: { t: PromoTemplate }) {
  const [open, setOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(t.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
      >
        <ChevronDown className={cn("h-4 w-4 flex-none text-ink-muted transition-transform", open ? "" : "-rotate-90")} />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{t.name}</span>
        <Badge tone="brand">{t.tag}</Badge>
      </button>

      {open ? (
        <div className="grid gap-4 px-4 pb-4 pl-11 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0">
            <p className="mb-3 text-sm text-ink-muted">{t.description}</p>
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <iframe
                title={`Vista previa de ${t.name}`}
                srcDoc={promoPreviewDoc(t.code)}
                sandbox="allow-same-origin"
                className="block w-full"
                style={{ height: 200, border: 0 }}
              />
            </div>
            {showCode ? (
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-line bg-surface-2 p-3 text-xs leading-relaxed text-ink">
                {t.code}
              </pre>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? <><Check className="h-4 w-4" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar código</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCode((s) => !s)}>
              <Code2 className="h-4 w-4" /> {showCode ? "Ocultar código" : "Ver código"}
            </Button>
            <Button variant="primary" size="sm" disabled title="Conecta la app de Shopify para publicar">
              <ExternalLink className="h-4 w-4" /> Publicar en Shopify
            </Button>
            <p className="text-xs text-ink-faint">Se mostrará en tu tienda Shopify al conectar la app.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PromotionTemplates() {
  return (
    <section className="mt-10">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-ink">Promotion blocks</h2>
        <p className="text-sm text-ink-muted">
          Bloques Liquid listos para tu tienda. Despliega uno para previsualizarlo, copiar el código o publicarlo en Shopify.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {PROMO_TEMPLATES.map((t) => (
          <PromoRow key={t.id} t={t} />
        ))}
      </div>
    </section>
  );
}
