import { useState, type CSSProperties, type ReactNode, type SVGProps } from "react";
import { PRODUCTS, CONSUMER_PRODUCTS, CONSUMER_ADDONS } from "@eventra/config";
import { Calendar } from "./Calendar";

/**
 * Eventra Consumer — the phone app, built on the SAME dark command-center template
 * as Business/Internal OS (via theme.css). Phone-first: a top bar, a screen, and a
 * bottom tab bar. Structure is real; data-backed screens (deals, alerts) show
 * honest empty states until connected — nothing fabricated.
 */

/* ---- tiny inline icons (stroke=currentColor), zero deps ---- */
type IP = SVGProps<SVGSVGElement> & { size?: number };
const Svg = ({ size = 22, children, ...r }: IP & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...r}>{children}</svg>
);
const IcCalendar = (p: IP) => <Svg {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></Svg>;
const IcTag = (p: IP) => <Svg {...p}><path d="M3 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0Z" /><circle cx="7.5" cy="8" r="1.3" /></Svg>;
const IcBell = (p: IP) => <Svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Svg>;
const IcUser = (p: IP) => <Svg {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></Svg>;
const IcInbox = (p: IP) => <Svg {...p}><path d="M3 13h5l2 3h4l2-3h5" /><path d="M5 5h14l2 8v6H3v-6Z" /></Svg>;

/* ---- shared bits ---- */
function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: "var(--eventra-surface)", border: "1px solid var(--eventra-border)", borderRadius: "var(--eventra-radius)", ...style }}>{children}</div>;
}
function ScreenTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h1>
      {sub ? <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--eventra-text-muted)" }}>{sub}</p> : null}
    </div>
  );
}
function Empty({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <Card style={{ padding: 28, textAlign: "center" }}>
      <div style={{ width: 46, height: 46, margin: "0 auto 10px", borderRadius: 13, background: "var(--eventra-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--eventra-text-faint)" }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{title}</div>
      {sub ? <p style={{ margin: "6px auto 0", maxWidth: 260, fontSize: 12.5, color: "var(--eventra-text-muted)" }}>{sub}</p> : null}
    </Card>
  );
}

/* ---- screens ---- */
function CalendarScreen() {
  return (
    <div>
      <ScreenTitle title="Calendario" sub="Fechas comerciales y eventos cerca de ti." />
      <Calendar />
    </div>
  );
}
function OffersScreen() {
  return (
    <div>
      <ScreenTitle title="Ofertas verificadas" sub="Descuentos reales confirmados contra su fuente." />
      <Empty icon={<IcTag />} title="No hay ofertas verificadas todavía" sub="Cuando un comercio publique una oferta verificada para tus intereses, aparecerá aquí." />
    </div>
  );
}
function AlertsScreen() {
  return (
    <div>
      <ScreenTitle title="Alertas" sub="Te avisamos de ofertas verificadas que te importan." />
      <Empty icon={<IcInbox />} title="Sin alertas" sub="Activa Deal Intelligence para recibir avisos de ofertas verificadas antes que nadie." />
    </div>
  );
}
function ProfileScreen() {
  const di = CONSUMER_PRODUCTS["consumer.deal_intelligence"];
  const adFree = CONSUMER_ADDONS["addon.ad_free"];
  return (
    <div>
      <ScreenTitle title="Tu cuenta" sub="Plan, avisos y preferencias." />
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "var(--eventra-text-muted)" }}>Plan actual</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>Gratis</div>
        <div style={{ fontSize: 12.5, color: "var(--eventra-text-muted)", marginTop: 2 }}>Calendario + ofertas, con anuncios.</div>
      </Card>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--eventra-text-faint)", margin: "8px 2px 8px" }}>Mejoras</div>
      <UpgradeRow name={di.label} price={di.priceMonthly} desc="Alertas de ofertas verificadas, sin límites de seguimiento." />
      <UpgradeRow name={adFree.label} price={adFree.priceMonthly} desc="Quita los anuncios de la app." />
      <p style={{ fontSize: 11.5, color: "var(--eventra-text-faint)", margin: "12px 2px 0" }}>Los pagos no están conectados en esta vista — es la estructura de la app.</p>
    </div>
  );
}
function UpgradeRow({ name, price, desc }: { name: string; price: number; desc: string }) {
  return (
    <Card style={{ padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: "var(--eventra-text-muted)" }}>{desc}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 700 }}>${price}<span style={{ fontSize: 11, color: "var(--eventra-text-muted)" }}>/mes</span></div>
        <button type="button" style={{ marginTop: 4, background: "var(--eventra-brand-600)", color: "#fff", border: 0, borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Activar</button>
      </div>
    </Card>
  );
}

const TABS = [
  { id: "calendar", label: "Calendario", icon: IcCalendar, screen: <CalendarScreen /> },
  { id: "offers", label: "Ofertas", icon: IcTag, screen: <OffersScreen /> },
  { id: "alerts", label: "Alertas", icon: IcBell, screen: <AlertsScreen /> },
  { id: "profile", label: "Cuenta", icon: IcUser, screen: <ProfileScreen /> },
] as const;

export function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("calendar");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--eventra-bg)", display: "flex", justifyContent: "center", fontFamily: "var(--eventra-font)" }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100dvh", background: "var(--eventra-bg)", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Top bar */}
        <header style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 10, padding: "calc(14px + env(safe-area-inset-top)) 16px 14px", background: "var(--eventra-surface)", borderBottom: "1px solid var(--eventra-border)", backdropFilter: "blur(6px)" }}>
          <span aria-hidden style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(140deg, var(--eventra-brand-600), #6d4aff)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, boxShadow: "0 4px 14px rgba(124,77,255,.4)" }}>e</span>
          <strong style={{ fontSize: 16.5, letterSpacing: "-0.01em" }}>{PRODUCTS.consumer.name}</strong>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--eventra-text-muted)", background: "var(--eventra-surface-2)", border: "1px solid var(--eventra-border)", borderRadius: 999, padding: "5px 10px" }}>
            🇺🇸 Estados Unidos
          </span>
        </header>

        {/* Screen */}
        <main style={{ flex: 1, padding: "16px 16px 92px" }}>{active.screen}</main>

        {/* Bottom tab bar */}
        <nav style={{ position: "sticky", bottom: 0, zIndex: 10, display: "grid", gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, background: "var(--eventra-surface)", borderTop: "1px solid var(--eventra-border)", padding: "8px 8px calc(8px + env(safe-area-inset-bottom))" }} aria-label="Navegación">
          {TABS.map((t) => {
            const on = t.id === tab;
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={on ? "page" : undefined}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: 0, cursor: "pointer", padding: "6px 0", color: on ? "var(--eventra-brand-700)" : "var(--eventra-text-muted)" }}>
                <Icon size={22} />
                <span style={{ fontSize: 11, fontWeight: on ? 700 : 500 }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
