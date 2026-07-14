/**
 * Eventra Business · App preview simulator — shown in the Plantillas branch,
 * next to the Shopify storefront preview. Renders, inside a device-framed
 * sandboxed <iframe>, a faithful mock of the Business app using its REAL design
 * (the shared dark command-center system: deep blue-black canvas, violet brand,
 * fixed sidebar + topbar, information-dense cards).
 *
 * It is a SIMULATION with clearly-labeled demo content — no real store data. The
 * mock is a self-contained HTML document (no external assets), so it is offline
 * and CSP-safe, exactly like the Shopify preview.
 */
import { useMemo, useState } from "react";
import { Card, CardHead, FilterDropdown, Pill } from "./ui";

type Screen = "dashboard" | "calendar" | "campaigns";

const SCREENS: { value: Screen; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "calendar", label: "Calendar" },
  { value: "campaigns", label: "Campaigns" },
];

/* Business design tokens (mirror apps/business/app/app.css). */
const T = {
  canvas: "#07111f",
  surface: "#0e1a29",
  surface2: "#111f30",
  elevated: "#142538",
  line: "rgba(148,163,184,.14)",
  line2: "rgba(148,163,184,.26)",
  brand: "#7c4dff",
  brandText: "#a78bff",
  brandSoft: "#191a33",
  ink: "#f8fafc",
  muted: "#94a3b8",
  faint: "#64748b",
  ok: "#84cc16",
  warn: "#f59e0b",
  err: "#f87171",
  info: "#38bdf8",
};

/* Minimal inline icon set (stroke=currentColor) — no external icon font. */
const ICON: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  news: '<path d="M4 5h13v14H4z"/><path d="M17 8h3v9a2 2 0 0 1-2 2M7 8h6M7 12h6M7 16h4"/>',
  spark: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11 12 16l-1.8-5L5.5 9.5l4.7-1.8z"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 8.5a4 4 0 0 1 0 7"/>',
  kanban: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="10" rx="1.5"/>',
  wand: '<path d="M5 19l9-9M14 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>',
  tag: '<path d="M3 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0z"/><circle cx="7.5" cy="8" r="1.2"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11"/>',
  content: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 16h4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 3 3V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 4 3 3 0 0 1-3 3V4z"/>',
  chart: '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12.5" y="8" width="3" height="9"/><rect x="18" y="14" width="3" height="3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  rss: '<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1.5"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6.1"/>',
  plug: '<path d="M9 3v6M15 3v6"/><path d="M7 9h10v3a5 5 0 0 1-10 0zM12 17v4"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9.5h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
};

function svg(name: string, size = 16): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICON[name] ?? ICON.dashboard}</svg>`;
}

interface NavItem { label: string; icon: string; key?: Screen }
interface NavGroup { title?: string; items: NavItem[] }

const NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", icon: "dashboard", key: "dashboard" }] },
  { title: "Planning", items: [
    { label: "Calendar", icon: "calendar", key: "calendar" },
    { label: "Events & news", icon: "news" },
    { label: "Opportunities", icon: "spark" },
    { label: "Advertisements", icon: "megaphone" },
    { label: "Campaigns", icon: "kanban", key: "campaigns" },
  ] },
  { title: "Create", items: [
    { label: "Promotion Builder", icon: "wand" },
    { label: "Offers", icon: "tag" },
    { label: "Templates", icon: "layout" },
    { label: "Content", icon: "content" },
    { label: "Media", icon: "image" },
  ] },
  { title: "Knowledge", items: [
    { label: "Marketing Memory", icon: "brain" },
    { label: "Analytics", icon: "chart" },
    { label: "Countries", icon: "globe" },
    { label: "Sources", icon: "rss" },
    { label: "Audiences", icon: "users" },
  ] },
  { title: "Company", items: [
    { label: "Team", icon: "users" },
    { label: "Integrations", icon: "plug" },
    { label: "Plan & billing", icon: "card" },
    { label: "Settings", icon: "gear" },
  ] },
];

function navHtml(active: Screen): string {
  return NAV.map((g) => {
    const items = g.items.map((it) => {
      const on = it.key === active;
      return `<a class="nav${on ? " on" : ""}">${svg(it.icon)}<span>${it.label}</span></a>`;
    }).join("");
    const title = g.title ? `<div class="navgroup">${g.title}</div>` : "";
    return title + items;
  }).join("");
}

/* ---------------------------------------------------------------- screens */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CAL_EVENTS: Record<number, { t: string; c: string }[]> = {
  0: [{ t: "New Year sale", c: T.info }],
  1: [{ t: "Valentine's", c: T.err }],
  2: [{ t: "Spring launch", c: T.ok }],
  4: [{ t: "Mother's Day", c: T.err }],
  6: [{ t: "Summer promo", c: T.warn }],
  10: [{ t: "Black Friday", c: T.brandText }, { t: "Cyber Monday", c: T.info }],
  11: [{ t: "Holiday season", c: T.ok }],
};

function kpi(label: string, value: string, foot: string, tone: string): string {
  return `<div class="kpi"><div class="kpi-l">${label}</div><div class="kpi-v">${value}</div><div class="kpi-f" style="color:${tone}">${foot}</div></div>`;
}

function dashboardScreen(): string {
  const kpis = [
    kpi("Upcoming events", "12", "next 30 days", T.info),
    kpi("Active campaigns", "5", "2 launching soon", T.ok),
    kpi("Offers ready", "8", "3 need review", T.warn),
    kpi("Prep tasks", "7", "due this week", T.brandText),
  ].join("");

  const opps = [
    ["Black Friday", "High commercial value", "92", T.brandText],
    ["Cyber Monday", "Repeat performer", "84", T.info],
    ["Holiday season", "Long prep window", "78", T.ok],
    ["Summer promo", "Emerging", "61", T.warn],
  ].map(([t, d, s, c]) =>
    `<div class="row"><span class="dot" style="background:${c}"></span><div class="rl"><div class="rt">${t}</div><div class="rd">${d}</div></div><span class="score" style="color:${c}">${s}</span></div>`
  ).join("");

  return `
  <div class="phead"><div><h1>What to do today</h1><p>Plan around the dates that matter — prepare early, reuse what works.</p></div><span class="badge">PrimeBuild Fit</span></div>
  <div class="kpis">${kpis}</div>
  <div class="cols">
    <div class="panel">
      <div class="ph"><h2>Top opportunities</h2><a>View all</a></div>
      ${opps}
    </div>
    <div class="panel">
      <div class="ph"><h2>This week</h2><a>Calendar</a></div>
      <div class="week">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) =>
    `<div class="day${i === 1 ? " today" : ""}"><span class="dn">${d}</span>${i === 1 ? '<span class="ev" style="background:' + T.brandSoft + ';color:' + T.brandText + '">Prep BF</span>' : i === 3 ? '<span class="ev" style="background:' + T.brandSoft + ';color:' + T.info + '">Email</span>' : ""}</div>`
  ).join("")}</div>
      <div class="note">Simulación — contenido de demostración.</div>
    </div>
  </div>`;
}

function calendarScreen(): string {
  const cells = MONTHS.map((m, i) => {
    const evs = (CAL_EVENTS[i] ?? []).map((e) => `<span class="cev" style="border-left:3px solid ${e.c}">${e.t}</span>`).join("");
    return `<div class="mcard"><div class="mh">${m} 2026</div>${evs || '<div class="mempty">—</div>'}</div>`;
  }).join("");
  return `
  <div class="phead"><div><h1>Marketing calendar</h1><p>Your annual commercial calendar. Future dates project by recurrence.</p></div><span class="badge">2026</span></div>
  <div class="mgrid">${cells}</div>`;
}

function campaignsScreen(): string {
  const rows = [
    ["Black Friday blitz", "Multi-channel", "Active", T.ok],
    ["Holiday gift guide", "Content + email", "Scheduled", T.warn],
    ["Summer clearance", "Ads", "Draft", T.faint],
    ["Loyalty relaunch", "Email", "Active", T.ok],
    ["Back to school", "Social", "Completed", T.info],
  ].map(([n, ch, st, c]) =>
    `<tr><td class="cn">${n}</td><td>${ch}</td><td><span class="st" style="background:${c}22;color:${c}">${st}</span></td><td class="prog"><span class="bar"><i style="width:${st === "Active" ? 70 : st === "Scheduled" ? 30 : st === "Completed" ? 100 : 10}%;background:${c}"></i></span></td></tr>`
  ).join("");
  return `
  <div class="phead"><div><h1>Campaigns</h1><p>Group your advertisements into campaigns and track their progress.</p></div><span class="badge">5 total</span></div>
  <div class="panel nopad">
    <table class="tbl"><thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Progress</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
}

function screenHtml(s: Screen): string {
  return s === "calendar" ? calendarScreen() : s === "campaigns" ? campaignsScreen() : dashboardScreen();
}

function businessAppHtml(screen: Screen, mobile: boolean): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--brand:${T.brand}}
  body{font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:${T.canvas};color:${T.ink};font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none;cursor:pointer}
  .app{display:flex;min-height:100%}
  /* Sidebar */
  .sb{width:240px;flex:none;background:${T.surface};border-right:1px solid ${T.line};display:flex;flex-direction:column;height:100vh;position:sticky;top:0}
  .brand{height:56px;display:flex;align-items:center;gap:9px;padding:0 18px;border-bottom:1px solid ${T.line};font-weight:700;font-size:15px}
  .brand .m{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,${T.brand},${T.brandText});flex:none}
  .brand .bdg{margin-left:auto;font-size:10px;font-weight:700;color:${T.brandText};background:${T.brandSoft};padding:2px 7px;border-radius:6px}
  .nvwrap{flex:1;overflow-y:auto;padding:10px}
  .navgroup{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:${T.faint};padding:12px 10px 5px;font-weight:700}
  .nav{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;color:${T.muted};font-size:13px;font-weight:500;margin-bottom:1px}
  .nav svg{flex:none;opacity:.9}
  .nav.on{background:${T.brandSoft};color:${T.ink}}
  .nav.on svg{color:${T.brandText}}
  .nav:hover{background:${T.elevated};color:${T.ink}}
  .sfoot{border-top:1px solid ${T.line};padding:12px}
  .storecard{background:${T.surface2};border:1px solid ${T.line};border-radius:9px;padding:9px 11px}
  .storecard .sn{font-weight:600;font-size:13px}
  .storecard .sp{font-size:11px;color:${T.faint}}
  /* Main */
  .main{flex:1;min-width:0;display:flex;flex-direction:column}
  .tb{position:sticky;top:0;height:56px;display:flex;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid ${T.line};background:${T.surface};z-index:5}
  .srch{flex:1;max-width:360px;height:36px;border:1px solid ${T.line};background:${T.surface2};border-radius:9px;display:flex;align-items:center;gap:8px;padding:0 12px;color:${T.faint};font-size:13px}
  .create{margin-left:auto;background:${T.brand};color:#fff;font-weight:600;font-size:13px;padding:8px 14px;border-radius:9px;display:flex;align-items:center;gap:6px}
  .tbi{width:34px;height:34px;border-radius:8px;border:1px solid ${T.line};display:flex;align-items:center;justify-content:center;color:${T.muted}}
  .avatar{width:32px;height:32px;border-radius:50%;background:${T.brandSoft};color:${T.brandText};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
  .content{padding:22px;max-width:1000px;width:100%;margin:0 auto}
  /* Page head */
  .phead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px}
  .phead h1{font-size:22px;font-weight:700;letter-spacing:-.02em}
  .phead p{color:${T.muted};font-size:13px;margin-top:4px;max-width:440px}
  .badge{font-size:11px;font-weight:600;color:${T.brandText};background:${T.brandSoft};padding:5px 11px;border-radius:999px;flex:none}
  /* KPIs */
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
  .kpi{background:${T.surface};border:1px solid ${T.line};border-radius:12px;padding:14px 16px}
  .kpi-l{font-size:12px;color:${T.muted}}
  .kpi-v{font-size:26px;font-weight:700;margin:4px 0 2px}
  .kpi-f{font-size:11.5px;font-weight:600}
  /* Columns */
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .panel{background:${T.surface};border:1px solid ${T.line};border-radius:12px;padding:16px}
  .panel.nopad{padding:0;overflow:hidden}
  .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .ph h2{font-size:15px;font-weight:700}
  .ph a{font-size:12px;color:${T.brandText};font-weight:600}
  .row{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid ${T.line}}
  .row:last-child{border-bottom:0}
  .dot{width:9px;height:9px;border-radius:3px;flex:none}
  .rl{flex:1;min-width:0}
  .rt{font-weight:600}
  .rd{font-size:12px;color:${T.faint}}
  .score{font-weight:700;font-variant-numeric:tabular-nums}
  .week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:4px}
  .day{background:${T.surface2};border:1px solid ${T.line};border-radius:8px;min-height:66px;padding:6px}
  .day.today{border-color:${T.brand}}
  .dn{font-size:11px;color:${T.faint}}
  .ev{display:block;margin-top:6px;font-size:10px;font-weight:600;padding:2px 5px;border-radius:5px}
  .note{margin-top:12px;font-size:11px;color:${T.faint}}
  /* Calendar grid */
  .mgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .mcard{background:${T.surface};border:1px solid ${T.line};border-radius:11px;padding:12px;min-height:90px}
  .mh{font-size:12px;font-weight:600;color:${T.muted};margin-bottom:8px}
  .cev{display:block;font-size:11px;padding:3px 8px;margin-bottom:5px;border-radius:5px;background:${T.surface2}}
  .mempty{color:${T.faint}}
  /* Table */
  .tbl{width:100%;border-collapse:collapse;font-size:13px}
  .tbl th{text-align:left;padding:11px 16px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:${T.faint};border-bottom:1px solid ${T.line}}
  .tbl td{padding:12px 16px;border-bottom:1px solid ${T.line}}
  .tbl tr:last-child td{border-bottom:0}
  .cn{font-weight:600}
  .st{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px}
  .prog .bar{display:block;width:120px;height:6px;border-radius:4px;background:${T.surface2};overflow:hidden}
  .prog .bar i{display:block;height:100%}
  @media(max-width:760px){.kpis{grid-template-columns:repeat(2,1fr)}.cols{grid-template-columns:1fr}.mgrid{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<div class="app">
  ${mobile ? "" : `<aside class="sb">
    <div class="brand"><span class="m"></span>Eventra<span class="bdg">Business</span></div>
    <div class="nvwrap">${navHtml(screen)}</div>
    <div class="sfoot"><div class="storecard"><div class="sn">PrimeBuild Fit</div><div class="sp">Business Pro plan · primebuildfit.myshopify.com</div></div></div>
  </aside>`}
  <div class="main">
    <header class="tb">
      ${mobile ? `<span class="tbi">${svg("dashboard", 18)}</span>` : ""}
      <span class="srch">${svg("dashboard", 15)} Search opportunities, campaigns, content…</span>
      <span class="create">${svg("wand", 15)} Create</span>
      <span class="tbi">${svg("news", 18)}</span>
      <span class="avatar">BA</span>
    </header>
    <div class="content">${screenHtml(screen)}</div>
  </div>
</div>
</body></html>`;
}

function Segmented<V extends string>({ value, options, onChange }: { value: V; options: { value: V; label: string }[]; onChange: (v: V) => void }) {
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

export function BusinessPreviewSection() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const html = useMemo(() => businessAppHtml(screen, device === "mobile"), [screen, device]);

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 700 }}>Eventra Business · Vista previa de la app</h2>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "3px 0 0" }}>
          Simula la app Business con su diseño real (command-center oscuro, marca violeta). Contenido de demostración.
        </p>
      </div>

      <Card>
        <CardHead
          title={<>App Business <Pill tone="warning">Simulación</Pill></>}
          action={
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <FilterDropdown label="Pantalla" value={screen} icon={false}
                options={SCREENS} onChange={(v) => setScreen(v as Screen)} />
              <Segmented value={device} onChange={setDevice} options={[{ value: "desktop", label: "Escritorio" }, { value: "mobile", label: "Móvil" }]} />
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
                <span style={{ marginLeft: 10, fontSize: 11, color: "var(--text-muted)" }}>app.eventra.com/app</span>
              </div>
              <iframe title="Vista previa de la app Business" srcDoc={html} style={{ width: "100%", height: 640, border: 0, display: "block", background: T.canvas }} />
            </div>
          ) : (
            <div style={{ width: 400, padding: 12, background: "#0b0b0f", borderRadius: 40, boxShadow: "0 12px 40px rgba(0,0,0,.5)", border: "1px solid var(--border-strong)" }}>
              <div style={{ borderRadius: 30, overflow: "hidden", background: T.canvas }}>
                <iframe title="Vista previa móvil de la app Business" srcDoc={html} style={{ width: 376, height: 680, border: 0, display: "block", background: T.canvas }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
