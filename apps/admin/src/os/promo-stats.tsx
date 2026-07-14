/**
 * Plantillas · rendimiento — the Admin view of the promo templates. It does NOT
 * host the templates themselves (those live in the Business app); here we show,
 * per template, its NAME and an expandable panel with a preview image plus slots
 * for performance stats: money generated and visits.
 *
 * HONEST DATA POLICY: there is no analytics source connected yet, so we NEVER
 * fabricate revenue or visit numbers. Every measured stat renders an explicit
 * "Sin datos" empty state until a real analytics source is wired in.
 */
import { useState } from "react";
import { Card, Pill, MetricCard } from "./ui";
import { IconChevronDown, IconBarChart } from "./icons";
import { PROMO_TEMPLATES, promoPreviewDoc, type PromoTemplate } from "@eventra/promotions";

function EmptyStat({ label }: { label: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)" }}>Sin datos</div>
    </div>
  );
}

function Row({ t }: { t: PromoTemplate }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "transparent", border: 0, padding: "12px 14px", cursor: "pointer", color: "var(--text-primary)" }}>
        <span style={{ color: "var(--text-muted)", transform: open ? "none" : "rotate(-90deg)", transition: "transform .15s", display: "inline-flex" }}><IconChevronDown size={16} /></span>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1, minWidth: 0 }}>{t.name}</span>
        <Pill tone="brand">{t.tag}</Pill>
        <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 90, textAlign: "right" }}>Sin datos</span>
      </button>

      {open ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 300px) 1fr", gap: 16, padding: "4px 14px 18px 42px", alignItems: "start" }} className="eos-promostat-grid">
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "#fff" }}>
            <iframe title={`Vista previa de ${t.name}`} srcDoc={promoPreviewDoc(t.code)} sandbox="allow-same-origin"
              style={{ width: "100%", height: 190, border: 0, display: "block", background: "#fff" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <EmptyStat label="Dinero generado" />
              <EmptyStat label="Visitas" />
              <EmptyStat label="Conversión" />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              El rendimiento aparecerá aquí cuando se conecte la analítica real. No se muestran cifras estimadas.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PromoStatsSection() {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 700 }}>Plantillas de promoción · Rendimiento</h2>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "3px 0 0" }}>
          Nombre de cada plantilla con estadísticas expandibles: dinero generado y visitas. Las plantillas viven en Eventra Business.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 14 }}>
        <MetricCard label="Plantillas" value={PROMO_TEMPLATES.length} tone="brand" trend="none" icon={<IconBarChart size={16} />} />
        <MetricCard label="Dinero generado" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" />
        <MetricCard label="Visitas" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" />
      </div>

      <Card style={{ overflow: "hidden" }}>
        {PROMO_TEMPLATES.map((t) => <Row key={t.id} t={t} />)}
      </Card>
    </div>
  );
}
