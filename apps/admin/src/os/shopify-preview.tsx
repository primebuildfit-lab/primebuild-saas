/**
 * Shopify · Store preview simulator — shown in the Plantillas branch.
 * Renders, inside a device-framed sandboxed <iframe>, a mock storefront the way a
 * customer would see a theme installed from Shopify — including ad placements.
 * It is a SIMULATION with clearly-labeled demo content (no real store/theme data).
 *
 * Templates are config-driven (STORE_TEMPLATES): pass a new theme by adding one
 * entry — its colors/typography drive the preview. The storefront itself is a
 * self-contained HTML document (no external assets), so it is offline/CSP-safe.
 */
import { useMemo, useState } from "react";
import { Card, CardHead, FilterDropdown, Pill } from "./ui";

interface StoreTemplate {
  id: string;
  name: string;
  desc: string;
  primary: string;   // brand / buttons
  ink: string;       // main text
  bg: string;        // page background
  surface: string;   // cards
  font: string;
  radius: number;
}

/** Demo themes so the simulator is usable now. Replace / extend with real ones. */
export const STORE_TEMPLATES: StoreTemplate[] = [
  { id: "aurora", name: "Aurora", desc: "Moderna, limpia, acento violeta.", primary: "#7c4dff", ink: "#111827", bg: "#ffffff", surface: "#f7f7fb", font: "Inter, system-ui, sans-serif", radius: 14 },
  { id: "carbon", name: "Carbon", desc: "Minimalista blanco y negro.", primary: "#111111", ink: "#111111", bg: "#ffffff", surface: "#f4f4f4", font: "'Helvetica Neue', Arial, sans-serif", radius: 4 },
  { id: "sunset", name: "Sunset", desc: "Vibrante, cálida, botones redondeados.", primary: "#f97316", ink: "#1f2937", bg: "#fff8f3", surface: "#ffffff", font: "'Poppins', system-ui, sans-serif", radius: 22 },
  { id: "forest", name: "Forest", desc: "Natural, tonos verdes, sobria.", primary: "#16a34a", ink: "#14261b", bg: "#f6faf6", surface: "#ffffff", font: "Georgia, 'Times New Roman', serif", radius: 10 },
];

const DEMO_PRODUCTS = [
  { name: "Proteína Whey 1kg", price: "$39.90", hue: 262 },
  { name: "Pre-Workout Boost", price: "$27.50", hue: 22 },
  { name: "Shaker Pro 700ml", price: "$12.00", hue: 190 },
  { name: "Barras energéticas x12", price: "$18.90", hue: 142 },
  { name: "Creatina 300g", price: "$24.00", hue: 320 },
  { name: "Camiseta Dry-Fit", price: "$21.00", hue: 210 },
];

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function storefrontHtml(t: StoreTemplate, showAds: boolean): string {
  const adStrip = showAds
    ? `<div class="ad ad-strip"><span class="adlbl">Anuncio</span> Rebajas de temporada — hasta 40% en marcas seleccionadas <a class="adcta">Ver ofertas</a></div>`
    : "";
  const adCard = showAds
    ? `<a class="card ad-card"><span class="adlbl">Patrocinado</span><div class="thumb" style="background:linear-gradient(135deg,${t.primary},#0000)"></div><div class="pinfo"><div class="pname">Oferta destacada del día</div><div class="price">Descubre →</div></div></a>`
    : "";
  const adFooter = showAds
    ? `<div class="ad ad-foot"><span class="adlbl">Anuncio</span> Espacio publicitario — banner 970×90</div>`
    : "";

  const products = DEMO_PRODUCTS.map((p) =>
    `<a class="card"><div class="thumb" style="background:linear-gradient(135deg, hsl(${p.hue} 70% 62%), hsl(${p.hue} 70% 42%))"></div><div class="pinfo"><div class="pname">${esc(p.name)}</div><div class="price">${esc(p.price)}</div></div></a>`
  ).join("");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${t.font};color:${t.ink};background:${t.bg};font-size:14px;line-height:1.5}
  a{color:inherit;text-decoration:none;cursor:pointer}
  .ann{background:${t.primary};color:#fff;text-align:center;padding:7px 12px;font-size:12px;font-weight:600}
  header{display:flex;align-items:center;gap:16px;padding:14px 20px;border-bottom:1px solid #0000000f;background:${t.bg};position:sticky;top:0;z-index:5}
  .logo{font-weight:800;font-size:18px;letter-spacing:-.02em}
  nav{display:flex;gap:16px;font-size:13px;color:#00000099}
  .spacer{margin-left:auto}
  .cart{border:1px solid #0000001f;border-radius:${t.radius}px;padding:7px 12px;font-size:13px;font-weight:600}
  .hero{padding:44px 20px;text-align:center;background:linear-gradient(160deg, ${t.surface}, ${t.bg})}
  .hero h1{font-size:30px;letter-spacing:-.02em;margin-bottom:10px}
  .hero p{color:#00000099;max-width:520px;margin:0 auto 18px}
  .btn{display:inline-block;background:${t.primary};color:#fff;font-weight:700;padding:12px 24px;border-radius:${t.radius}px;font-size:14px}
  .ad{position:relative;border:1px dashed ${t.primary}66;background:${t.primary}0f;color:${t.ink};border-radius:${t.radius}px;padding:14px 16px;font-size:13px;display:flex;align-items:center;gap:10px;justify-content:center;text-align:center}
  .ad-strip{margin:16px 20px}
  .ad-foot{margin:8px 20px 20px;color:#00000088}
  .adlbl{font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;background:${t.ink};color:${t.bg};padding:2px 6px;border-radius:5px}
  .adcta{margin-left:6px;font-weight:700;color:${t.primary}}
  .sec{padding:8px 20px 4px;display:flex;align-items:center;justify-content:space-between}
  .sec h2{font-size:17px}
  .sec a{font-size:12px;color:${t.primary};font-weight:600}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;padding:14px 20px 24px}
  .card{background:${t.surface};border:1px solid #00000010;border-radius:${t.radius}px;overflow:hidden;display:block}
  .thumb{aspect-ratio:1/1;width:100%}
  .pinfo{padding:10px 12px}
  .pname{font-size:13px;font-weight:600;margin-bottom:3px}
  .price{font-size:13px;color:#00000099;font-weight:700}
  .ad-card{position:relative}
  .ad-card .adlbl{position:absolute;top:8px;left:8px;z-index:2}
  footer{border-top:1px solid #0000000f;padding:22px 20px;color:#00000077;font-size:12px;display:flex;gap:20px;flex-wrap:wrap}
</style></head><body>
  <div class="ann">Envío gratis en pedidos superiores a $50 · Devoluciones en 30 días</div>
  <header>
    <span class="logo">${esc(t.name)} Store</span>
    <nav><a>Inicio</a><a>Tienda</a><a>Colecciones</a><a>Contacto</a></nav>
    <span class="spacer"></span>
    <a class="cart">Carrito · 0</a>
  </header>
  <section class="hero">
    <h1>Rinde al máximo</h1>
    <p>La colección que tus clientes verán al instalar este tema desde Shopify. Todo es demostración.</p>
    <a class="btn">Comprar ahora</a>
  </section>
  ${adStrip}
  <div class="sec"><h2>Más vendidos</h2><a>Ver todo</a></div>
  <div class="grid">
    ${products}
    ${adCard}
  </div>
  ${adFooter}
  <footer><span>© ${esc(t.name)} Store — demo</span><span>Ayuda</span><span>Envíos</span><span>Privacidad</span></footer>
</body></html>`;
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 9, padding: 2 }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          style={{ border: 0, cursor: "pointer", padding: "6px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, background: value === o.value ? "var(--brand-primary)" : "transparent", color: value === o.value ? "#fff" : "var(--text-secondary)" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ShopifyPreviewSection() {
  const [tplId, setTplId] = useState(STORE_TEMPLATES[0].id);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [ads, setAds] = useState(true);
  const t = STORE_TEMPLATES.find((x) => x.id === tplId) ?? STORE_TEMPLATES[0];
  const html = useMemo(() => storefrontHtml(t, ads), [t, ads]);

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 700 }}>Shopify · Vista previa de la tienda</h2>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "3px 0 0" }}>
          Simula cómo vería la tienda un cliente que instala este tema desde Shopify, con los anuncios. Contenido de demostración.
        </p>
      </div>

      <Card>
        <CardHead
          title={<>Storefront <Pill tone="warning">Simulación</Pill></>}
          action={
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <FilterDropdown label="Plantilla" value={tplId} icon={false}
                options={STORE_TEMPLATES.map((s) => ({ value: s.id, label: s.name }))} onChange={setTplId} />
              <Segmented value={device} onChange={setDevice} options={[{ value: "desktop", label: "Escritorio" }, { value: "mobile", label: "Móvil" }]} />
              <Segmented value={ads ? "on" : "off"} onChange={(v) => setAds(v === "on")} options={[{ value: "on", label: "Con anuncios" }, { value: "off", label: "Sin anuncios" }]} />
            </div>
          }
        />
        <div className="eos-card-pad" style={{ display: "flex", justifyContent: "center", background: "var(--background-alt)" }}>
          {device === "desktop" ? (
            <div style={{ width: "100%", maxWidth: 1100, border: "1px solid var(--border-strong)", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.4)" }}>
              <div style={{ height: 30, background: "var(--surface-elevated)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ef4444" }} />
                <span style={{ width: 10, height: 10, borderRadius: 5, background: "#f59e0b" }} />
                <span style={{ width: 10, height: 10, borderRadius: 5, background: "#22c55e" }} />
                <span style={{ marginLeft: 10, fontSize: 11, color: "var(--text-muted)" }}>{t.name.toLowerCase()}-store.myshopify.com</span>
              </div>
              <iframe title="Vista previa de la tienda" srcDoc={html} style={{ width: "100%", height: 620, border: 0, display: "block", background: "#fff" }} />
            </div>
          ) : (
            <div style={{ width: 400, padding: 12, background: "#0b0b0f", borderRadius: 40, boxShadow: "0 12px 40px rgba(0,0,0,.5)", border: "1px solid var(--border-strong)" }}>
              <div style={{ borderRadius: 30, overflow: "hidden", background: "#fff" }}>
                <iframe title="Vista previa móvil de la tienda" srcDoc={html} style={{ width: 376, height: 680, border: 0, display: "block", background: "#fff" }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
