/**
 * Surfaces — the Eventra apps this Admin console hosts, rendered as BIG boxes
 * ("recuadros grandes") at the top of the Plantillas branch. Config-driven: the
 * entries live in surfaces.config.ts — to change an app you edit ONLY that file.
 * Each box is a REAL link that opens its host in a NEW WINDOW when clicked.
 */
import type { ReactNode } from "react";
import { Card, Pill } from "./ui";
import { IconCard, IconCalendar, IconLayout, IconMegaphone, IconNodes, IconExternal } from "./icons";
import { SURFACES, type SurfaceAccent, type SurfaceIcon, type SurfaceEntry } from "./surfaces.config";

const ACCENT: Record<SurfaceAccent, { color: string; soft: string }> = {
  brand: { color: "var(--brand-primary)", soft: "var(--brand-soft)" },
  info: { color: "var(--info)", soft: "var(--info-soft)" },
  magenta: { color: "var(--magenta)", soft: "var(--magenta-soft)" },
  success: { color: "var(--success)", soft: "var(--success-soft)" },
};

const ICONS: Record<SurfaceIcon, (p: { size?: number }) => ReactNode> = {
  business: (p) => <IconCard {...p} />,
  mobile: (p) => <IconCalendar {...p} />,
  templates: (p) => <IconLayout {...p} />,
  ads: (p) => <IconMegaphone {...p} />,
  layout: (p) => <IconLayout {...p} />,
  link: (p) => <IconNodes {...p} />,
};

function SurfaceBox({ s }: { s: SurfaceEntry }) {
  const a = ACCENT[s.accent];
  const Icon = ICONS[s.icon] ?? ICONS.link;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir ${s.name} en una ventana nueva`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", minHeight: 230 }} className="eos-surface-box">
        {/* Big accent header */}
        <div style={{ background: `linear-gradient(135deg, ${a.soft}, transparent 70%)`, borderBottom: "1px solid var(--border)", padding: "22px 24px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 60, height: 60, borderRadius: 16, background: a.soft, color: a.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{Icon({ size: 28 })}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{s.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.kind}</div>
          </div>
          <span style={{ marginLeft: "auto", alignSelf: "flex-start" }}><Pill tone={s.statusTone} dot>{s.status}</Pill></span>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: a.color, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 11 }}>
              Abrir aplicación <IconExternal size={16} />
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "ui-monospace, Menlo, Consolas, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{s.url}</span>
          </div>
        </div>
      </Card>
    </a>
  );
}

export function SurfacesSection() {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: ".04em" }}>
        Aplicaciones y superficies
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 18 }}>
        {SURFACES.map((s) => <SurfaceBox key={s.id} s={s} />)}
      </div>
    </div>
  );
}
