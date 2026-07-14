import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Megaphone, Ticket, Wand2, Check, Monitor, Tablet, Smartphone, Code2, CalendarClock,
  Rocket, ListChecks, TrendingUp, Users, MousePointerClick, Package,
} from "lucide-react";
import { PageHeader, Card, CardContent, Button, Field, TextInput, Textarea, Select, Toggle } from "~/components/ui";
import { useData } from "~/context/DataContext";
import { useAdvertising } from "~/context/AdvertisingContext";
import { humanizeCategory } from "~/lib/format";
import { cn } from "~/lib/cn";
import { BASE_AD_TEMPLATE } from "~/data/adTemplates";
import type { OfferType } from "~/types/advertising";

/**
 * Promoción — the 4-phase advertisement editor (VIP model).
 *   Fase 1 · Detalles   — name, visible title, description, discount, button, products
 *   Fase 2 · Diseño      — Liquid code for the background / full text (final piece)
 *   Fase 3 · Programar   — events, date range, repetition, which products it applies to
 *   Fase 4 · Publicar    — publish; stays for the membership period (repeat next year)
 * A live preview (Escritorio / Tablet / Móvil) reflects exactly what you enter.
 * No fabricated metrics — the "Información adicional" tiles stay honest until real
 * data is connected. Publishing creates a real Offer + Advertisement (with Liquid).
 */

const DISCOUNTS: { value: OfferType; label: string; needsValue: boolean; unit?: string }[] = [
  { value: "percentage", label: "Descuento (%)", needsValue: true, unit: "%" },
  { value: "amount_off", label: "Monto de descuento", needsValue: true, unit: "$" },
  { value: "fixed_price", label: "Precio fijo", needsValue: true, unit: "$" },
  { value: "free_shipping", label: "Envío gratis", needsValue: false },
  { value: "free_gift", label: "Regalo gratis", needsValue: false },
];

function discountHeadline(type: OfferType, value: string): string {
  const v = value.trim();
  switch (type) {
    case "percentage": return v ? `${v}% OFF` : "% OFF";
    case "amount_off": return v ? `$${v} OFF` : "$ OFF";
    case "fixed_price": return v ? `$${v}` : "Precio especial";
    case "free_shipping": return "ENVÍO GRATIS";
    case "free_gift": return "REGALO GRATIS";
    default: return "OFERTA";
  }
}

const PHASES = [
  { id: 0, label: "Detalles", icon: Ticket },
  { id: 1, label: "Diseño", icon: Code2 },
  { id: 2, label: "Programar", icon: CalendarClock },
  { id: 3, label: "Publicar", icon: Rocket },
];

type Device = "desktop" | "tablet" | "mobile";

export default function PromotionEditorRoute() {
  const navigate = useNavigate();
  const { globalEvents, enabledCountryCodes } = useData();
  const { createOffer, createAdvertisement } = useAdvertising();

  const [phase, setPhase] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const [published, setPublished] = useState(false);

  // Fase 1 — details (starts from the base template shipped in the codebase;
  // the client modifies it — they don't start from a blank promotion).
  const [internalName, setInternalName] = useState("");
  const [title, setTitle] = useState(BASE_AD_TEMPLATE.title);
  const [description, setDescription] = useState(BASE_AD_TEMPLATE.description);
  const [type, setType] = useState<OfferType>(BASE_AD_TEMPLATE.discountType);
  const [value, setValue] = useState(BASE_AD_TEMPLATE.discountValue);
  const [buttonText, setButtonText] = useState(BASE_AD_TEMPLATE.buttonText);
  const [buttonLink, setButtonLink] = useState(BASE_AD_TEMPLATE.buttonLink);
  const [products, setProducts] = useState("all");
  const [active, setActive] = useState(true);

  // Fase 2 — design (base Liquid from the template)
  const [liquid, setLiquid] = useState(BASE_AD_TEMPLATE.liquid);

  // Fase 3 — schedule
  const [eventId, setEventId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeat, setRepeat] = useState<"none" | "yearly">("none");
  const meta = DISCOUNTS.find((d) => d.value === type)!;

  const events = useMemo(
    () => globalEvents.filter((e) => e.countryCodes.some((c) => enabledCountryCodes.includes(c))),
    [globalEvents, enabledCountryCodes],
  );

  const canPublish = internalName.trim().length > 0 && title.trim().length > 0;

  const publish = () => {
    const offer = createOffer({
      name: internalName.trim() || "Descuento",
      type,
      value: meta.needsValue ? Number(value) || 0 : undefined,
      productRefs: [],
      status: "active",
    });
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    createAdvertisement({
      name: internalName.trim(),
      title: title.trim(),
      subtitle: undefined,
      description: description.trim() || undefined,
      cta: buttonText.trim() || "Shop Now",
      liquid,
      eventId: eventId || undefined,
      offerId: offer.id,
      placement: "banner",
      productRefs: [],
      startDate: startDate || today,
      endDate: endDate || in30,
      status: active ? "active" : "draft",
      notes: repeat === "yearly" ? "Repetir cada año" : undefined,
    });
    setPublished(true);
    setTimeout(() => navigate("/app/advertisements"), 700);
  };

  const headline = discountHeadline(type, value);

  return (
    <div>
      <PageHeader
        title="Promoción"
        description="Crea el anuncio, edítalo con Liquid, prográmalo en tus eventos y publícalo."
        actions={
          <Button onClick={publish} disabled={!canPublish || published}>
            {published ? <><Check className="h-4 w-4" /> Publicado</> : <><Rocket className="h-4 w-4" /> Publicar</>}
          </Button>
        }
      />

      {/* Phase stepper */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const activeP = p.id === phase;
          const done = p.id < phase;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhase(p.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                activeP ? "border-brand-500 bg-brand-50 text-brand-700"
                  : done ? "border-line bg-surface text-ink" : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                activeP || done ? "bg-brand-600 text-white" : "bg-surface-2 text-ink-faint")}>
                {done ? <Check className="h-3 w-3" /> : p.id + 1}
              </span>
              <Icon className="h-4 w-4" /> {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        {/* ── Left: phase form ── */}
        <div className="flex flex-col gap-4">
          {phase === 0 ? (
            <Card><CardContent className="flex flex-col gap-4">
              <SectionTitle>Detalles de la promoción</SectionTitle>
              <Field label="Nombre interno" required><TextInput value={internalName} onChange={(e) => setInternalName(e.target.value)} placeholder="10% OFF - Descuento general" /></Field>
              <Field label="Título visible" required><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Save 10% Today" /></Field>
              <Field label="Descripción"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enjoy 10% off selected products for a limited time." /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo de promoción"><Select value={type} onChange={(e) => setType(e.target.value as OfferType)}>{DISCOUNTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></Field>
                <Field label={meta.needsValue ? `Valor (${meta.unit})` : "Valor"}><TextInput inputMode="numeric" disabled={!meta.needsValue} value={meta.needsValue ? value : "—"} onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))} /></Field>
              </div>
              <Field label="Texto del botón"><TextInput value={buttonText} onChange={(e) => setButtonText(e.target.value)} /></Field>
              <Field label="Enlace del botón"><TextInput value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} /></Field>
              <Field label="Productos"><Select value={products} onChange={(e) => setProducts(e.target.value)}><option value="all">Todos los productos</option><option value="selected">Seleccionados</option><option value="collection">Por colección</option></Select></Field>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Estado</span>
                <span className="flex items-center gap-2"><span className="text-sm text-ink-muted">{active ? "Activa" : "Pausada"}</span><Toggle checked={active} onCheckedChange={setActive} label="Estado de la promoción" /></span>
              </div>
            </CardContent></Card>
          ) : null}

          {phase === 1 ? (
            <Card><CardContent className="flex flex-col gap-3">
              <SectionTitle>Diseño · Código Liquid</SectionTitle>
              <p className="text-xs text-ink-muted">Edita el fondo y el texto completo del anuncio con Liquid. Variables disponibles: <code className="rounded bg-surface-2 px-1">promo.title</code>, <code className="rounded bg-surface-2 px-1">promo.description</code>, <code className="rounded bg-surface-2 px-1">promo.button_text</code>, <code className="rounded bg-surface-2 px-1">promo.button_link</code>.</p>
              <Field label="Liquid">
                <Textarea value={liquid} onChange={(e) => setLiquid(e.target.value)} rows={14} className="font-mono text-xs" />
              </Field>
              <p className="text-xs text-ink-faint">La vista previa usa los campos estructurados; el render de Liquid en vivo se activa al conectar el motor de temas. El código se guarda con el anuncio.</p>
            </CardContent></Card>
          ) : null}

          {phase === 2 ? (
            <Card><CardContent className="flex flex-col gap-4">
              <SectionTitle>Programar</SectionTitle>
              <Field label="Evento" hint="En qué evento se muestra la promoción.">
                <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">Sin evento</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} · {humanizeCategory(ev.category)}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha de inicio"><TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
                <Field label="Fecha de fin"><TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
              </div>
              <Field label="Repetición" hint="Vuelve a mostrarse el próximo año automáticamente.">
                <Select value={repeat} onChange={(e) => setRepeat(e.target.value as "none" | "yearly")}>
                  <option value="none">No repetir</option>
                  <option value="yearly">Cada año</option>
                </Select>
              </Field>
              <Field label="Aplica a"><Select value={products} onChange={(e) => setProducts(e.target.value)}><option value="all">Todos los productos</option><option value="selected">Productos seleccionados</option><option value="collection">Colección específica</option></Select></Field>
            </CardContent></Card>
          ) : null}

          {phase === 3 ? (
            <Card><CardContent className="flex flex-col gap-4">
              <SectionTitle>Publicar</SectionTitle>
              <ul className="flex flex-col gap-2 text-sm">
                <SummaryRow k="Nombre" v={internalName || "—"} />
                <SummaryRow k="Descuento" v={headline} />
                <SummaryRow k="Evento" v={events.find((e) => e.id === eventId)?.name ?? "Sin evento"} />
                <SummaryRow k="Vigencia" v={startDate && endDate ? `${startDate} → ${endDate}` : "Por defecto (30 días)"} />
                <SummaryRow k="Repetición" v={repeat === "yearly" ? "Cada año" : "No repetir"} />
                <SummaryRow k="Estado" v={active ? "Activa" : "Pausada"} />
              </ul>
              <div className="rounded-lg border border-line bg-surface-2 p-3 text-xs text-ink-muted">
                <ListChecks className="mr-1 inline h-3.5 w-3.5" /> Al publicar, la promoción queda activa mientras dure tu membresía. Si el evento se repite más de un año, prográmala de nuevo el próximo año.
              </div>
              <Button onClick={publish} disabled={!canPublish || published} className="w-full justify-center">
                {published ? <><Check className="h-4 w-4" /> Publicado</> : <><Rocket className="h-4 w-4" /> Publicar promoción</>}
              </Button>
              {!canPublish ? <p className="text-xs text-ink-faint">Completa el nombre interno y el título visible (Fase 1) para publicar.</p> : null}
            </CardContent></Card>
          ) : null}
        </div>

        {/* ── Right: live preview ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Vista previa {device === "desktop" ? "· Escritorio" : device === "tablet" ? "· Tablet" : "· Móvil"}</p>
            <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
              <DeviceBtn icon={Monitor} active={device === "desktop"} onClick={() => setDevice("desktop")} />
              <DeviceBtn icon={Tablet} active={device === "tablet"} onClick={() => setDevice("tablet")} />
              <DeviceBtn icon={Smartphone} active={device === "mobile"} onClick={() => setDevice("mobile")} />
            </div>
          </div>

          <div className="flex justify-center rounded-xl border border-line bg-surface-2 p-5">
            <div style={{ width: device === "desktop" ? "100%" : device === "tablet" ? 480 : 300 }}>
              <PromoBanner title={title} description={description} headline={headline} cta={buttonText} size={device} background={BASE_AD_TEMPLATE.background} />
            </div>
          </div>

          {/* Información adicional — honest (no fabricated metrics) */}
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Información adicional</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile icon={TrendingUp} label="Rendimiento estimado" />
              <InfoTile icon={Users} label="Alcance potencial" />
              <InfoTile icon={MousePointerClick} label="Clics estimados" />
              <InfoTile icon={Package} label="Productos" value={products === "all" ? "Todos" : products === "selected" ? "Seleccionados" : "Colección"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-semibold text-ink">{children}</h2>;
}
function SummaryRow({ k, v }: { k: string; v: ReactNode }) {
  return <li className="flex items-center justify-between gap-3"><span className="text-ink-muted">{k}</span><span className="font-medium text-ink">{v}</span></li>;
}
function DeviceBtn({ icon: Icon, active, onClick }: { icon: typeof Monitor; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-md p-1.5", active ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink")}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
function InfoTile({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-2 text-ink-faint"><Icon className="h-4 w-4" /><span className="text-[11px] font-medium">{label}</span></div>
      <div className={cn("mt-1.5 font-semibold", value ? "text-lg text-ink" : "text-sm text-ink-muted")}>{value ?? "No disponible"}</div>
      {!value ? <div className="text-[10px] text-ink-faint">Se calcula al conectar datos reales</div> : <div className="text-[10px] text-ink-faint">Según selección</div>}
    </div>
  );
}

/** Shopper-facing promo banner rendered from the structured fields (like the mockup). */
function PromoBanner({ title, description, headline, cta, size, background }: { title: string; description: string; headline: string; cta: string; size: Device; background: string }) {
  const big = size === "desktop";
  const mid = size === "tablet";
  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white shadow-lg"
      style={{ background, minHeight: big ? 300 : mid ? 200 : 260 }}
    >
      <div className={cn("relative z-10 flex h-full", big ? "items-center" : "flex-col")}>
        <div className={cn("flex-1", big ? "p-10" : mid ? "p-6" : "p-5")}>
          <span className={cn("inline-block rounded-full bg-white/15 px-3 py-1 font-bold tracking-wider backdrop-blur", big ? "text-xs" : "text-[10px]")}>LIMITED TIME</span>
          <h2 className={cn("mt-3 font-black leading-tight tracking-tight", big ? "text-5xl" : mid ? "text-3xl" : "text-3xl")}>{title.trim() || "Save 10% Today"}</h2>
          <p className={cn("mt-3 text-white/85", big ? "max-w-md text-lg" : "text-sm")}>{description.trim() || "Enjoy 10% off selected products for a limited time."}</p>
          <span className={cn("mt-5 inline-flex items-center rounded-lg bg-white font-bold text-gray-900", big ? "px-7 py-3 text-base" : "px-4 py-2 text-sm")}>{cta.trim() || "SHOP NOW"}</span>
        </div>
        {big ? (
          <div className="relative flex w-2/5 items-center justify-center p-6">
            <div className="absolute h-56 w-56 rounded-full border-2 border-fuchsia-400/70 shadow-[0_0_60px_rgba(217,70,239,.6)]" />
            <span className="relative text-6xl font-black text-fuchsia-200 drop-shadow-[0_0_20px_rgba(217,70,239,.8)]">{headline}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center pb-5">
            <span className="text-3xl font-black text-fuchsia-200 drop-shadow-[0_0_16px_rgba(217,70,239,.8)]">{headline}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
