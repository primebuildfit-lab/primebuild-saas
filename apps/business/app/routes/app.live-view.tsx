import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Monitor, Smartphone, Radio, Megaphone, Ticket } from "lucide-react";
import { PageHeader, Button, EmptyState } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { useAdvertising } from "~/context/AdvertisingContext";
import { BASE_AD_TEMPLATE } from "~/data/adTemplates";
import { cn } from "~/lib/cn";
import type { Advertisement, Offer, OfferType } from "~/types/advertising";

/**
 * Vista en vivo — the storefront exactly as the merchant's customers see it.
 * It renders the store's ACTIVE promotions (from the advertising store) on top of
 * a sample storefront. "Live" = it reflects the current advertisements in real
 * time. The product catalog is clearly a sample until Shopify products are
 * connected — no fabricated inventory presented as real.
 */

function discountHeadline(type: OfferType, value?: number): string {
  switch (type) {
    case "percentage": return value ? `${value}% OFF` : "% OFF";
    case "amount_off": return value ? `$${value} OFF` : "$ OFF";
    case "fixed_price": return value ? `$${value}` : "Precio especial";
    case "free_shipping": return "ENVÍO GRATIS";
    case "free_gift": return "REGALO GRATIS";
    default: return "OFERTA";
  }
}

type Device = "desktop" | "mobile";

export default function LiveViewRoute() {
  const { store } = useData();
  const { advertisements, offers } = useAdvertising();
  const [device, setDevice] = useState<Device>("desktop");

  const liveAds = useMemo(
    () => advertisements.filter((a) => a.status === "active" || a.status === "scheduled"),
    [advertisements],
  );
  const offerFor = (ad: Advertisement): Offer | undefined =>
    ad.offerId ? offers.find((o) => o.id === ad.offerId) : undefined;

  const isMobile = device === "mobile";

  return (
    <div>
      <PageHeader
        title="Vista en vivo"
        description="Tu tienda tal como la ven tus clientes, con tus promociones activas."
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-ok">
              <Radio className="h-3.5 w-3.5" /> En vivo
            </span>
            <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
              <button type="button" onClick={() => setDevice("desktop")} className={cn("rounded-md p-1.5", !isMobile ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink")} aria-label="Escritorio"><Monitor className="h-4 w-4" /></button>
              <button type="button" onClick={() => setDevice("mobile")} className={cn("rounded-md p-1.5", isMobile ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink")} aria-label="Móvil"><Smartphone className="h-4 w-4" /></button>
            </div>
          </div>
        }
      />

      <div className="flex justify-center rounded-xl border border-line bg-surface-2 p-5">
        <div
          className={cn("overflow-hidden bg-white text-gray-900 shadow-2xl", isMobile ? "rounded-[2rem] ring-8 ring-black/80" : "w-full max-w-5xl rounded-xl border border-black/10")}
          style={{ width: isMobile ? 380 : undefined }}
        >
          {/* Storefront */}
          <div className="bg-brand-600 px-4 py-1.5 text-center text-[11px] font-semibold text-white">
            Envío gratis en pedidos superiores a $50 · Devoluciones en 30 días
          </div>
          <header className="flex items-center gap-4 border-b border-black/10 px-5 py-3">
            <span className="text-lg font-extrabold tracking-tight">{store.name}</span>
            {!isMobile ? (
              <nav className="flex gap-4 text-[13px] text-gray-500">
                <span>Inicio</span><span>Tienda</span><span>Colecciones</span><span>Contacto</span>
              </nav>
            ) : null}
            <span className="ml-auto rounded-lg border border-black/10 px-3 py-1.5 text-[13px] font-semibold">Carrito · 0</span>
          </header>

          {/* Active promotions — the LIVE part */}
          {liveAds.length === 0 ? (
            <div className="border-b border-black/5 bg-gray-50 px-5 py-8">
              <EmptyState
                icon={Megaphone}
                title="Sin promociones activas"
                description="Cuando publiques o programes un anuncio, aparecerá aquí como lo verán tus clientes."
                className="border-0 bg-transparent"
                action={<Link to="/app/create-ad"><Button variant="secondary" size="sm">Crear anuncio</Button></Link>}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {liveAds.map((ad) => {
                const offer = offerFor(ad);
                const headline = offer ? discountHeadline(offer.type, offer.value) : "OFERTA";
                return (
                  <div key={ad.id} className="relative overflow-hidden rounded-2xl p-6 text-white" style={{ background: BASE_AD_TEMPLATE.background }}>
                    <div className={cn("relative z-10 flex", isMobile ? "flex-col" : "items-center")}>
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-wider">LIMITED TIME</span>
                        <h2 className={cn("mt-2 font-black leading-tight", isMobile ? "text-2xl" : "text-4xl")}>{ad.title || ad.name || "Promoción"}</h2>
                        {ad.description ? <p className="mt-2 text-sm text-white/85">{ad.description}</p> : null}
                        {offer?.code ? (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-white/60 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                            <Ticket className="h-4 w-4" /> Código: <span className="font-mono tracking-widest">{offer.code}</span>
                          </div>
                        ) : null}
                        <div className="mt-4">
                          <span className="inline-flex rounded-lg bg-white px-5 py-2 text-sm font-bold text-gray-900">{ad.cta || "Shop Now"}</span>
                        </div>
                      </div>
                      <div className={cn("flex items-center justify-center", isMobile ? "mt-4" : "w-2/5")}>
                        <span className={cn("font-black text-fuchsia-200 drop-shadow-[0_0_16px_rgba(217,70,239,.8)]", isMobile ? "text-4xl" : "text-5xl")}>{headline}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Product area — placeholders only (never fabricated inventory). Real
              products come from the merchant's own Shopify catalog once connected. */}
          <div className="flex items-center justify-between px-5 pt-3">
            <h3 className="text-base font-bold">Tus productos</h3>
            <span className="text-[11px] text-gray-400">Se muestran al conectar Shopify</span>
          </div>
          <div className={cn("grid gap-3 p-5", isMobile ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-4")}>
            {Array.from({ length: isMobile ? 4 : 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-dashed border-black/15 bg-gray-50">
                <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-[11px] text-gray-400">Producto</div>
                <div className="p-2.5">
                  <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                  <div className="mt-1.5 h-2.5 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          <footer className="flex flex-wrap gap-5 border-t border-black/10 px-5 py-4 text-[12px] text-gray-400">
            <span>© {store.name} — demo</span><span>Ayuda</span><span>Envíos</span><span>Privacidad</span>
          </footer>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Vista en vivo: refleja tus anuncios activos y programados en tiempo real. El catálogo es de ejemplo hasta conectar tus productos reales de Shopify.
      </p>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
