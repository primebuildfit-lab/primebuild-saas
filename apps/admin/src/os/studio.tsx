/**
 * Estudio — App Studio branch.
 *
 * Two areas the operator uses to shape the published apps WITHOUT a deploy:
 *   1. Anuncios  — compose announcements targeted at Business / Consumer / all.
 *   2. Código    — custom JavaScript + Liquid blocks that customize the app.
 *
 * Foundation posture (consistent with the rest of the console): everything lives
 * in local state and is clearly badged DEV. Nothing is published to a live surface
 * and NO admin-authored code is executed here — the Liquid preview is pure string
 * substitution and JavaScript is shown, never run. Publishing + execution are wired
 * to the real apps in a later phase and are gated behind platform permissions.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP } from "@eventra/identity";
import {
  Card, CardHead, PageHeader, MetricCard, DataTable, Toolbar, FilterDropdown, Select,
  StatusBadge, Pill, EmptyState, Btn, DevBadge, type Column,
} from "./ui";
import { IconMegaphone, IconCode, IconCheck, IconAlert } from "./icons";
import { MOCK_PLATFORM_ROLE } from "./pages";
import {
  devAnnouncements, devCodeBlocks, AUDIENCE_LABEL, TONE_LABEL, LANG_LABEL, SURFACE_LABEL,
  PLACEMENT_LABEL, PLACEMENTS_FOR,
  type Announcement, type AnnouncementAudience, type AnnouncementTone,
  type CodeBlock, type CodeLang, type CodeSurface, type CodePlacement,
} from "../data/studio-seed";
import { renderLiquidPreview, hasLiquidTags, LIQUID_SAMPLE_CONTEXT } from "../engine/liquidPreview";

const today = () => new Date().toISOString().slice(0, 10);
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const TONE_PILL: Record<AnnouncementTone, "info" | "success" | "warning" | "danger"> = {
  info: "info", success: "success", warning: "warning", critical: "danger",
};

/* ------------------------------------------------------------- local inputs */
const fieldLabel: CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 };
const inputStyle: CSSProperties = {
  width: "100%", height: 36, padding: "0 12px", borderRadius: 9, background: "var(--surface)",
  border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box",
};

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={fieldLabel}>{label}</span>
      {children}
      {hint ? <span style={{ display: "block", marginTop: 5, fontSize: 11.5, color: "var(--text-muted)" }}>{hint}</span> : null}
    </label>
  );
}
function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />;
}
function TextArea({ value, onChange, placeholder, rows = 4, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; mono?: boolean }) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)}
      spellCheck={!mono}
      style={{ ...inputStyle, height: "auto", padding: "10px 12px", lineHeight: 1.5, resize: "vertical",
        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" : "inherit",
        fontSize: mono ? 12.5 : 13 }} />
  );
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "transparent", border: 0, cursor: "pointer", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}>
      <span style={{ width: 38, height: 22, borderRadius: 999, background: checked ? "var(--brand-primary)" : "var(--surface-elevated)", border: "1px solid var(--border)", position: "relative", transition: "background .15s", flex: "none" }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 17 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
      </span>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------- segmented tabs */
type TabId = "announcements" | "code";
function SegTabs({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: "announcements", label: "Anuncios", icon: <IconMegaphone size={15} /> },
    { id: "code", label: "Código", icon: <IconCode size={15} /> },
  ];
  return (
    <div role="tablist" aria-label="Áreas del estudio" style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, marginBottom: 18 }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button key={t.id} type="button" role="tab" aria-selected={active} onClick={() => onTab(t.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 14px", borderRadius: 8, border: 0, cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: active ? "var(--brand-primary)" : "transparent", color: active ? "#fff" : "var(--text-secondary)" }}>
            {t.icon}{t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ Announcements */
interface Draft {
  title: string; body: string; audience: AnnouncementAudience; tone: AnnouncementTone;
  schedule: "now" | "scheduled"; publishAt: string;
}
const emptyDraft: Draft = { title: "", body: "", audience: "all", tone: "info", schedule: "now", publishAt: today() };

function Announcements({ canPublish }: { canPublish: boolean }) {
  const [items, setItems] = useState<Announcement[]>(devAnnouncements);
  const [filter, setFilter] = useState("all");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const visible = filter === "all" ? items : items.filter((a) => a.status === filter);
  const metric = (s: Announcement["status"]) => items.filter((a) => a.status === s).length;

  function add(status: "draft" | "published" | "scheduled") {
    if (!draft.title.trim()) return;
    const scheduled = status === "scheduled" || (status === "published" && draft.schedule === "scheduled");
    const next: Announcement = {
      id: rid("anc"), title: draft.title.trim(), body: draft.body.trim(),
      audience: draft.audience, tone: draft.tone,
      status: scheduled ? "scheduled" : status,
      publishAt: scheduled ? draft.publishAt : undefined,
      updatedAt: today(), isDev: true,
    };
    setItems((xs) => [next, ...xs]);
    setDraft(emptyDraft); setComposing(false);
  }
  const setStatus = (id: string, status: Announcement["status"]) =>
    setItems((xs) => xs.map((a) => (a.id === id ? { ...a, status, updatedAt: today() } : a)));

  const columns: Column<Announcement>[] = [
    { key: "title", header: "Anuncio", render: (a) => (
      <div><div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.body || "—"}</div></div>
    ) },
    { key: "audience", header: "Audiencia", render: (a) => <Pill tone="brand">{AUDIENCE_LABEL[a.audience]}</Pill> },
    { key: "tone", header: "Tipo", render: (a) => <Pill tone={TONE_PILL[a.tone]}>{TONE_LABEL[a.tone]}</Pill> },
    { key: "status", header: "Estado", render: (a) => <StatusBadge status={a.status === "scheduled" && a.publishAt ? "scheduled" : a.status} /> },
    { key: "when", header: "Actualizado", render: (a) => <span style={{ color: "var(--text-secondary)" }}>{a.status === "scheduled" && a.publishAt ? `→ ${a.publishAt}` : a.updatedAt}</span> },
    { key: "actions", header: "", width: 190, render: (a) => (
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        {a.status !== "published" ? <Btn tone="primary" onClick={() => setStatus(a.id, "published")} disabled={!canPublish} title={canPublish ? undefined : "Requiere permiso platform:settings:manage"}>Publicar</Btn> : null}
        {a.status !== "archived" ? <Btn tone="ghost" onClick={() => setStatus(a.id, "archived")}>Archivar</Btn> : null}
      </div>
    ) },
  ];

  return (
    <div>
      <div className="eos-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        <MetricCard label="Anuncios" value={items.length} icon={<IconMegaphone size={16} />} tone="brand" trend="none" />
        <MetricCard label="Publicados" value={metric("published")} tone="success" trend="none" />
        <MetricCard label="Programados" value={metric("scheduled")} tone="warning" trend="none" />
        <MetricCard label="Borradores" value={metric("draft")} tone="neutral" trend="none" />
      </div>

      <Toolbar>
        <FilterDropdown label="Estado" value={filter} icon={false}
          options={[["all", "Todos"], ["draft", "Borradores"], ["scheduled", "Programados"], ["published", "Publicados"], ["archived", "Archivados"]].map(([v, l]) => ({ value: v, label: l }))}
          onChange={setFilter} />
        <span style={{ flex: 1 }} />
        <Btn tone="primary" onClick={() => setComposing((c) => !c)}>{composing ? "Cerrar" : "Nuevo anuncio"}</Btn>
      </Toolbar>

      {composing ? (
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Nuevo anuncio" sub="Se guarda localmente en esta fase — aún no se envía a la app en vivo." />
          <div className="eos-card-pad" style={{ display: "grid", gap: 14 }}>
            <Field label="Título"><TextInput value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Ej. Prepara Black Friday" /></Field>
            <Field label="Mensaje"><TextArea value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} placeholder="Texto que verá el usuario…" rows={3} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <Field label="Audiencia"><Select value={draft.audience} onChange={(v) => setDraft({ ...draft, audience: v as AnnouncementAudience })} options={(Object.keys(AUDIENCE_LABEL) as AnnouncementAudience[]).map((a) => ({ value: a, label: AUDIENCE_LABEL[a] }))} /></Field>
              <Field label="Tipo"><Select value={draft.tone} onChange={(v) => setDraft({ ...draft, tone: v as AnnouncementTone })} options={(Object.keys(TONE_LABEL) as AnnouncementTone[]).map((t) => ({ value: t, label: TONE_LABEL[t] }))} /></Field>
              <Field label="Programación"><Select value={draft.schedule} onChange={(v) => setDraft({ ...draft, schedule: v as Draft["schedule"] })} options={[{ value: "now", label: "Publicar ahora" }, { value: "scheduled", label: "Programar" }]} /></Field>
              {draft.schedule === "scheduled" ? (
                <Field label="Fecha"><input type="date" value={draft.publishAt} onChange={(e) => setDraft({ ...draft, publishAt: e.target.value })} style={inputStyle} /></Field>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn tone="primary" onClick={() => add(draft.schedule === "scheduled" ? "scheduled" : "published")} disabled={!canPublish || !draft.title.trim()} title={canPublish ? undefined : "Requiere permiso platform:settings:manage"}>
                <IconCheck size={15} /> {draft.schedule === "scheduled" ? "Programar" : "Publicar"}
              </Btn>
              <Btn onClick={() => add("draft")} disabled={!draft.title.trim()}>Guardar borrador</Btn>
            </div>
          </div>
        </Card>
      ) : null}

      <DataTable columns={columns} rows={visible} empty="Sin anuncios" emptyHint="Crea tu primer anuncio con «Nuevo anuncio»." />
    </div>
  );
}

/* ================================================================== Código */
function CodeStudio({ canManage }: { canManage: boolean }) {
  const [blocks, setBlocks] = useState<CodeBlock[]>(devCodeBlocks);
  const [selId, setSelId] = useState<string>(devCodeBlocks[0]?.id ?? "");
  const selected = blocks.find((b) => b.id === selId) ?? null;

  const patch = (id: string, p: Partial<CodeBlock>) =>
    setBlocks((xs) => xs.map((b) => (b.id === id ? { ...b, ...p, updatedAt: today() } : b)));

  function newBlock() {
    const b: CodeBlock = { id: rid("code"), name: "Bloque sin título", lang: "liquid", surface: "global", placement: "banner", enabled: false, code: "", updatedAt: today(), isDev: true };
    setBlocks((xs) => [b, ...xs]); setSelId(b.id);
  }
  function remove(id: string) {
    setBlocks((xs) => xs.filter((b) => b.id !== id));
    if (selId === id) setSelId(blocks.find((b) => b.id !== id)?.id ?? "");
  }
  function setLang(lang: CodeLang) {
    if (!selected) return;
    const placements = PLACEMENTS_FOR[lang];
    patch(selected.id, { lang, placement: placements.includes(selected.placement) ? selected.placement : placements[0] });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--warning-soft)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 14px", marginBottom: 16 }}>
        <span style={{ color: "var(--warning)", flex: "none", marginTop: 1 }}><IconAlert size={18} /></span>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          El código personalizado se ejecuta en la <b style={{ color: "var(--text-primary)" }}>app publicada</b>, no en esta consola. La vista previa de Liquid es solo sustitución de variables (sin ejecución) y el JavaScript nunca se ejecuta aquí. Publicar requiere el permiso <code style={{ color: "var(--brand-strong)" }}>platform:owner</code>.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 300px) 1fr", gap: 16, alignItems: "start" }} className="eos-studio-grid">
        {/* Block list */}
        <Card>
          <CardHead title="Bloques" action={<Btn onClick={newBlock}>Nuevo</Btn>} />
          <div style={{ padding: 6 }}>
            {blocks.length === 0 ? <EmptyState title="Sin bloques" hint="Crea un bloque de Liquid o JavaScript." /> : blocks.map((b) => {
              const active = b.id === selId;
              return (
                <button key={b.id} type="button" onClick={() => setSelId(b.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, border: 0, cursor: "pointer", marginBottom: 2,
                    background: active ? "var(--surface-hover)" : "transparent", color: "var(--text-primary)" }}>
                  <span style={{ color: b.lang === "liquid" ? "var(--info)" : "var(--warning)", flex: "none" }}><IconCode size={15} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{LANG_LABEL[b.lang]} · {SURFACE_LABEL[b.surface]}</span>
                  </span>
                  <Pill tone={b.enabled ? "success" : "neutral"}>{b.enabled ? "on" : "off"}</Pill>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Editor + preview */}
        {selected ? (
          <div style={{ display: "grid", gap: 16 }}>
            <Card>
              <CardHead title="Editor" action={<DevBadge />} />
              <div className="eos-card-pad" style={{ display: "grid", gap: 14 }}>
                <Field label="Nombre"><TextInput value={selected.name} onChange={(v) => patch(selected.id, { name: v })} placeholder="Nombre del bloque" /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
                  <Field label="Lenguaje"><Select value={selected.lang} onChange={(v) => setLang(v as CodeLang)} options={(Object.keys(LANG_LABEL) as CodeLang[]).map((l) => ({ value: l, label: LANG_LABEL[l] }))} /></Field>
                  <Field label="Superficie"><Select value={selected.surface} onChange={(v) => patch(selected.id, { surface: v as CodeSurface })} options={(Object.keys(SURFACE_LABEL) as CodeSurface[]).map((s) => ({ value: s, label: SURFACE_LABEL[s] }))} /></Field>
                  <Field label="Ubicación"><Select value={selected.placement} onChange={(v) => patch(selected.id, { placement: v as CodePlacement })} options={PLACEMENTS_FOR[selected.lang].map((pl) => ({ value: pl, label: PLACEMENT_LABEL[pl] }))} /></Field>
                </div>
                <Field label="Código" hint={selected.lang === "liquid" ? "Usa {{ variable }} para datos dinámicos; las etiquetas {% %} se procesan en el servidor." : "JavaScript inyectado en la app publicada. No se ejecuta en la consola."}>
                  <TextArea value={selected.code} onChange={(v) => patch(selected.id, { code: v })} rows={8} mono placeholder={selected.lang === "liquid" ? "<div>Hola {{ user.first_name }}</div>" : "console.log('hola');"} />
                </Field>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Toggle checked={selected.enabled} onChange={(v) => patch(selected.id, { enabled: v })} label="Activo" />
                  <span style={{ flex: 1 }} />
                  <Btn tone="ghost" onClick={() => remove(selected.id)}>Eliminar</Btn>
                  <Btn tone="primary" disabled={!canManage} title={canManage ? undefined : "Requiere permiso platform:owner"}><IconCheck size={15} /> Publicar cambios</Btn>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Vista previa" sub={selected.lang === "liquid" ? "Sustitución de variables con datos de ejemplo" : "El JavaScript no se ejecuta — solo se muestra"} />
              <div className="eos-card-pad">
                {selected.code.trim() === "" ? (
                  <EmptyState title="Nada que previsualizar" hint="Escribe código en el editor." />
                ) : selected.lang === "liquid" ? (
                  <>
                    <pre style={preStyle}>{renderLiquidPreview(selected.code, LIQUID_SAMPLE_CONTEXT)}</pre>
                    {hasLiquidTags(selected.code) ? (
                      <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>Las etiquetas {"{% … %}"} se muestran sin procesar; se evalúan en el servidor.</div>
                    ) : null}
                    <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-muted)" }}>
                      Contexto de ejemplo: {Object.keys(LIQUID_SAMPLE_CONTEXT).join(", ")}.
                    </div>
                  </>
                ) : (
                  <>
                    <pre style={preStyle}>{selected.code}</pre>
                    <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--warning)" }}>Vista de solo lectura — este JavaScript se ejecutará únicamente en la app publicada.</div>
                  </>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card style={{ padding: 8 }}><EmptyState title="Selecciona un bloque" hint="Elige un bloque de la lista o crea uno nuevo." /></Card>
        )}
      </div>
    </div>
  );
}

const preStyle: CSSProperties = {
  margin: 0, padding: "12px 14px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--border)",
  color: "var(--text-primary)", fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", overflowX: "auto",
};

/* ============================================================== StudioPage */
export function StudioPage() {
  const [tab, setTab] = useState<TabId>("announcements");
  const canPublishAnnouncements = platformCan(MOCK_PLATFORM_ROLE, PP.settingsManage);
  const canManageCode = platformCan(MOCK_PLATFORM_ROLE, PP.ownerManage);

  return (
    <div>
      <PageHeader
        title="Estudio"
        description="Anuncios y personalización de la app (JavaScript + Liquid). Fundación — nada se publica en vivo todavía."
        actions={<DevBadge />}
      />
      <SegTabs tab={tab} onTab={setTab} />
      {tab === "announcements" ? <Announcements canPublish={canPublishAnnouncements} /> : <CodeStudio canManage={canManageCode} />}
    </div>
  );
}
