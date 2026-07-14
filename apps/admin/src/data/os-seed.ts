/**
 * Internal OS DEV fixtures (extends data/seed.ts). Clearly-marked, generic,
 * development-only entity fixtures so the 18 branches render as real tables/lists.
 * Every record carries `isDev: true`. RULES honored:
 *   - Entities may be seeded as DEV fixtures (badged "DATOS DEV", env "development",
 *     guarded by isProdLike) — this is a development tool, never shown as production.
 *   - MEASURED OUTCOMES are NOT invented: conversions, revenue, channel performance,
 *     "rendimiento general", growth %, and usage counts stay null → empty states.
 *   - Activity is DERIVED from real fixture state, not a fabricated list.
 */
import { devOffers, devSources, devCompanies, devJobs, type DevCompany } from "./seed";

/* -------------------------------------------------------------- date helpers */
const DAY = 86_400_000;
/** ISO date (YYYY-MM-DD) offset from a reference `now` — for week/agenda fixtures. */
export function dayFromNow(n: number, now = new Date()): string {
  return new Date(now.getTime() + n * DAY).toISOString().slice(0, 10);
}
function companyName(id: string): string {
  return devCompanies.find((c) => c.id === id)?.name ?? id;
}

/* -------------------------------------------------------------- Campaigns */
export type CampaignKind = "internal" | "company" | "automatic";
export interface DevCampaign {
  id: string; name: string; kind: CampaignKind; companyId?: string; country: string;
  owner: string; startDate: string; endDate: string;
  status: "active" | "scheduled" | "overdue" | "completed" | "cancelled" | "draft";
  ads: number; isDev: true;
}
export const devCampaigns: DevCampaign[] = [
  { id: "cmp_launch", name: "Lanzamiento marca Eventra", kind: "internal", country: "US", owner: "Brian Almeida", startDate: dayFromNow(-3), endDate: dayFromNow(11), status: "active", ads: 4, isDev: true },
  { id: "cmp_nw_bf", name: "Northwind — Black Friday", kind: "company", companyId: "co_northwind", country: "US", owner: "Alex Owner", startDate: dayFromNow(2), endDate: dayFromNow(9), status: "scheduled", ads: 3, isDev: true },
  { id: "cmp_acme_auto", name: "Acme — Recurrente mensual", kind: "automatic", companyId: "co_acme", country: "US", owner: "Automatización", startDate: dayFromNow(-1), endDate: dayFromNow(6), status: "active", ads: 2, isDev: true },
  { id: "cmp_globex_trial", name: "Globex — Bienvenida trial", kind: "company", companyId: "co_globex", country: "CA", owner: "Riya Viewer", startDate: dayFromNow(-10), endDate: dayFromNow(-2), status: "completed", ads: 1, isDev: true },
  { id: "cmp_holiday", name: "Calendario navideño (interno)", kind: "internal", country: "US", owner: "Brian Almeida", startDate: dayFromNow(-8), endDate: dayFromNow(-4), status: "overdue", ads: 0, isDev: true },
  { id: "cmp_expo", name: "Regional Expo (cancelada)", kind: "company", companyId: "co_initech", country: "US", owner: "—", startDate: dayFromNow(20), endDate: dayFromNow(21), status: "cancelled", ads: 0, isDev: true },
];
/** Elapsed-time progress derived from real fixture dates (0–100). Not a fabricated number. */
export function campaignProgress(c: DevCampaign, now = new Date()): number {
  if (c.status === "completed") return 100;
  if (c.status === "cancelled" || c.status === "draft" || c.status === "scheduled") return 0;
  const s = new Date(c.startDate).getTime(), e = new Date(c.endDate).getTime();
  if (now.getTime() <= s) return 0;
  if (now.getTime() >= e) return 100;
  return Math.round(((now.getTime() - s) / (e - s)) * 100);
}
export function companyForCampaign(c: DevCampaign): string {
  return c.kind === "internal" ? "Eventra (interno)" : c.companyId ? companyName(c.companyId) : "—";
}

/* -------------------------------------------------------------- Tasks */
export interface DevTask {
  id: string; title: string; project: string; campaignId?: string; assignee: string;
  due: string; priority: "critical" | "high" | "medium" | "low"; status: "pending" | "in_progress" | "completed" | "blocked" | "overdue";
  tags: string[]; isDev: true;
}
export const devTasks: DevTask[] = [
  { id: "tk_creatives", title: "Revisar y aprobar creativos", project: "Lanzamiento", campaignId: "cmp_launch", assignee: "María González", due: dayFromNow(0), priority: "high", status: "pending", tags: ["diseño"], isDev: true },
  { id: "tk_schedule", title: "Programar publicaciones IG", project: "Northwind BF", campaignId: "cmp_nw_bf", assignee: "Brian Almeida", due: dayFromNow(1), priority: "medium", status: "in_progress", tags: ["social"], isDev: true },
  { id: "tk_analysis", title: "Análisis de resultados semana", project: "Interno", assignee: "Carlos Ruiz", due: dayFromNow(4), priority: "low", status: "pending", tags: ["reporte"], isDev: true },
  { id: "tk_sources", title: "Reparar fuente Partner Submissions", project: "Plataforma", assignee: "Brian Almeida", due: dayFromNow(-1), priority: "critical", status: "overdue", tags: ["fuentes"], isDev: true },
  { id: "tk_content", title: "Redactar contenido navideño", project: "Interno", campaignId: "cmp_holiday", assignee: "María González", due: dayFromNow(3), priority: "medium", status: "blocked", tags: ["contenido"], isDev: true },
  { id: "tk_qa", title: "QA plantillas de email", project: "Plantillas", assignee: "Carlos Ruiz", due: dayFromNow(6), priority: "low", status: "completed", tags: ["qa"], isDev: true },
];

/* -------------------------------------------------------------- Channels */
export interface DevChannel {
  id: string; name: string; status: "connected" | "pending" | "error" | "not_configured";
  companies: number; campaigns: number; content: number; lastActivity: string | null; isDev: true;
}
export const devChannels: DevChannel[] = [
  { id: "ch_shopify", name: "Shopify", status: "connected", companies: 3, campaigns: 4, content: 6, lastActivity: dayFromNow(-1), isDev: true },
  { id: "ch_email", name: "Email", status: "connected", companies: 4, campaigns: 5, content: 9, lastActivity: dayFromNow(0), isDev: true },
  { id: "ch_meta", name: "Meta (Facebook)", status: "pending", companies: 2, campaigns: 2, content: 3, lastActivity: dayFromNow(-3), isDev: true },
  { id: "ch_ig", name: "Instagram", status: "pending", companies: 2, campaigns: 2, content: 4, lastActivity: dayFromNow(-2), isDev: true },
  { id: "ch_pinterest", name: "Pinterest", status: "not_configured", companies: 0, campaigns: 0, content: 0, lastActivity: null, isDev: true },
  { id: "ch_tiktok", name: "TikTok", status: "not_configured", companies: 0, campaigns: 0, content: 0, lastActivity: null, isDev: true },
  { id: "ch_youtube", name: "YouTube", status: "error", companies: 1, campaigns: 1, content: 1, lastActivity: dayFromNow(-6), isDev: true },
  { id: "ch_blog", name: "Blog", status: "connected", companies: 1, campaigns: 1, content: 5, lastActivity: dayFromNow(-4), isDev: true },
];

/* -------------------------------------------------------------- Integrations */
export interface DevIntegration {
  id: string; name: string; category: string; status: "connected" | "pending" | "error" | "not_configured" | "syncing";
  environment: "development" | "staging" | "production" | "—"; lastSyncAt: string | null; nextSyncAt: string | null; errors: number; isDev: true;
}
export const devIntegrations: DevIntegration[] = [
  { id: "in_shopify", name: "Shopify", category: "Comercio", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_supabase", name: "Supabase", category: "Datos", status: "connected", environment: "development", lastSyncAt: dayFromNow(0), nextSyncAt: dayFromNow(1), errors: 0, isDev: true },
  { id: "in_railway", name: "Railway", category: "Infraestructura", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_github", name: "GitHub", category: "Desarrollo", status: "connected", environment: "development", lastSyncAt: dayFromNow(0), nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_google", name: "Google", category: "Marketing", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_meta", name: "Meta", category: "Marketing", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_tiktok", name: "TikTok", category: "Marketing", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_pinterest", name: "Pinterest", category: "Marketing", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_storage", name: "Almacenamiento (S3)", category: "Datos", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
  { id: "in_email", name: "Email (SMTP)", category: "Mensajería", status: "not_configured", environment: "—", lastSyncAt: null, nextSyncAt: null, errors: 0, isDev: true },
];

/* -------------------------------------------------------------- Templates / Content / Media / Labels / Audiences / Operators */
export interface DevTemplate { id: string; name: string; category: string; scope: string; version: string; updatedAt: string; status: "active" | "draft" | "archived"; isDev: true; }
export const devTemplates: DevTemplate[] = [
  { id: "tpl_bf", name: "Black Friday — Email", category: "email", scope: "Eventra", version: "v3", updatedAt: dayFromNow(-5), status: "active", isDev: true },
  { id: "tpl_banner", name: "Banner promo genérico", category: "banner", scope: "Eventra", version: "v2", updatedAt: dayFromNow(-12), status: "active", isDev: true },
  { id: "tpl_liquid", name: "Bloque Liquid — descuento", category: "liquid", scope: "Eventra", version: "v1", updatedAt: dayFromNow(-20), status: "draft", isDev: true },
  { id: "tpl_popup", name: "Popup captación", category: "popup", scope: "Northwind", version: "v1", updatedAt: dayFromNow(-2), status: "active", isDev: true },
];
export interface DevContent { id: string; name: string; type: string; scope: string; campaignId?: string; channel: string; author: string; version: string; status: "approved" | "draft" | "in_review" | "ai_generated"; updatedAt: string; isDev: true; }
export const devContent: DevContent[] = [
  { id: "ct_hero", name: "Hero lanzamiento", type: "imagen", scope: "Eventra", campaignId: "cmp_launch", channel: "Web", author: "María González", version: "v2", status: "approved", updatedAt: dayFromNow(-1), isDev: true },
  { id: "ct_email1", name: "Email BF #1", type: "email", scope: "Northwind", campaignId: "cmp_nw_bf", channel: "Email", author: "Brian Almeida", version: "v1", status: "in_review", updatedAt: dayFromNow(0), isDev: true },
  { id: "ct_ai1", name: "Borrador IA — copys IG", type: "texto", scope: "Acme", channel: "Instagram", author: "IA (revisión humana)", version: "v1", status: "ai_generated", updatedAt: dayFromNow(-2), isDev: true },
  { id: "ct_blog", name: "Post blog navideño", type: "artículo", scope: "Eventra", campaignId: "cmp_holiday", channel: "Blog", author: "Carlos Ruiz", version: "v1", status: "draft", updatedAt: dayFromNow(-3), isDev: true },
];
export interface DevMedia { id: string; name: string; type: "imagen" | "video" | "documento"; sizeKb: number; owner: string; scope: string; license: string; updatedAt: string; isDev: true; }
export const devMedia: DevMedia[] = [
  { id: "md_hero", name: "hero-launch.png", type: "imagen", sizeKb: 842, owner: "María González", scope: "Eventra", license: "Interna", updatedAt: dayFromNow(-1), isDev: true },
  { id: "md_promo", name: "promo-bf.mp4", type: "video", sizeKb: 15230, owner: "Brian Almeida", scope: "Northwind", license: "Interna", updatedAt: dayFromNow(-4), isDev: true },
  { id: "md_guide", name: "guia-marca.pdf", type: "documento", sizeKb: 1204, owner: "Eventra", scope: "Eventra", license: "Interna", updatedAt: dayFromNow(-30), isDev: true },
];
export interface DevLabel { id: string; name: string; type: string; uses: number; isDev: true; }
export const devLabels: DevLabel[] = [
  { id: "lb_bf", name: "black-friday", type: "campaña", uses: 3, isDev: true },
  { id: "lb_retail", name: "retail", type: "empresa", uses: 2, isDev: true },
  { id: "lb_urgent", name: "urgente", type: "prioridad", uses: 4, isDev: true },
  { id: "lb_us", name: "país:US", type: "país", uses: 5, isDev: true },
  { id: "lb_ai", name: "ia-borrador", type: "contenido", uses: 1, isDev: true },
];
export interface DevAudience { id: string; name: string; scope: "business" | "personal"; segment: string; country: string; size: number | null; isDev: true; }
export const devAudiences: DevAudience[] = [
  { id: "au_nw", name: "Northwind — clientes retail", scope: "business", segment: "Compradores recurrentes", country: "US", size: null, isDev: true },
  { id: "au_acme", name: "Acme — ecommerce US", scope: "business", segment: "Alto valor", country: "US", size: null, isDev: true },
  { id: "au_ca", name: "Consumidores CA", scope: "personal", segment: "Cazadores de ofertas", country: "CA", size: null, isDev: true },
];
export interface DevOperator { id: string; name: string; role: string; status: "active" | "invited" | "disabled"; lastActiveAt: string; isDev: true; }
export const devOperators: DevOperator[] = [
  { id: "op_brian", name: "Brian Almeida", role: "platform_owner", status: "active", lastActiveAt: dayFromNow(0), isDev: true },
  { id: "op_maria", name: "María González", role: "operations", status: "active", lastActiveAt: dayFromNow(0), isDev: true },
  { id: "op_carlos", name: "Carlos Ruiz", role: "analyst", status: "active", lastActiveAt: dayFromNow(-1), isDev: true },
  { id: "op_support", name: "Soporte (invitado)", role: "support", status: "invited", lastActiveAt: dayFromNow(-5), isDev: true },
];

/* -------------------------------------------------------------- Derived activity (from real fixture state) */
export interface DerivedActivity { id: string; title: string; desc?: string; when: string; tone: "success" | "warning" | "danger" | "info" | "brand" | "neutral"; }
export function deriveActivity(): DerivedActivity[] {
  const out: DerivedActivity[] = [];
  for (const j of devJobs.filter((j) => j.status === "failed")) out.push({ id: `act-job-${j.id}`, title: "Job con error", desc: j.name, when: shortWhen(j.lastRunAt), tone: "danger" });
  for (const s of devSources.filter((s) => s.status === "down")) out.push({ id: `act-src-${s.id}`, title: "Fuente caída", desc: s.name, when: shortWhen(s.lastSyncAt), tone: "danger" });
  for (const s of devSources.filter((s) => s.status === "degraded")) out.push({ id: `act-srcd-${s.id}`, title: "Fuente degradada", desc: s.name, when: shortWhen(s.lastSyncAt), tone: "warning" });
  for (const o of devOffers.filter((o) => o.status === "cancelled")) out.push({ id: `act-off-${o.id}`, title: "Oferta cancelada", desc: o.title, when: shortWhen(o.updatedAt), tone: "warning" });
  for (const c of devCampaigns.filter((c) => c.status === "overdue")) out.push({ id: `act-cmp-${c.id}`, title: "Campaña atrasada", desc: c.name, when: "—", tone: "warning" });
  for (const c of devCompanies.filter((c) => c.status === "suspended")) out.push({ id: `act-co-${c.id}`, title: "Empresa suspendida", desc: c.name, when: "—", tone: "danger" });
  return out.slice(0, 6);
}
function shortWhen(iso?: string): string {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

/* -------------------------------------------------------------- Weekly agenda (from fixtures dated this week) */
export interface WeekItem { id: string; title: string; date: string; kind: "campaign" | "task" | "offer" | "content"; channel?: string; }
export function weekItems(now = new Date()): WeekItem[] {
  const start = new Date(now); start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 7 * DAY);
  const inWeek = (iso: string) => { const d = new Date(iso).getTime(); return d >= start.getTime() && d < end.getTime(); };
  const items: WeekItem[] = [];
  for (const c of devCampaigns) if (inWeek(c.startDate)) items.push({ id: `w-c-${c.id}`, title: c.name, date: c.startDate, kind: "campaign" });
  for (const t of devTasks) if (inWeek(t.due)) items.push({ id: `w-t-${t.id}`, title: t.title, date: t.due, kind: "task" });
  for (const ct of devContent) if (inWeek(ct.updatedAt)) items.push({ id: `w-ct-${ct.id}`, title: ct.name, date: ct.updatedAt, kind: "content", channel: ct.channel });
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export type { DevCompany };
