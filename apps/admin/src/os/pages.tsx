/**
 * Internal OS pages (Phase 7). Real, information-dense screens driven by the
 * clearly-marked DEV SEED + the pure engines. Modules not yet built render an
 * honest scaffold (never a fake "done"). Bulk/write actions are gated by the
 * platform permission matrix and labeled as mock — no live mutations.
 */
import { useMemo, useState } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP, type PlatformRole } from "@eventra/identity";
import {
  Panel, PageTitle, StatCard, Pill, Money, Percent, ScoreBar, DataTable, Toolbar, Select, Btn, DevBadge,
  type Column,
} from "./ui";
import {
  devOffers, devSources, devCompanies, devUsers, devJobs, devCommissions, devPlatformMetrics,
  type DevCompany, type DevUser, type DevJob,
} from "../data/seed";
import { expandOccurrences } from "../engine/occurrences";
import { byScoreDesc } from "../engine/scoring";
import { DeterministicFakeAI } from "../engine/ai/fake";
import type { Offer, OfferSource } from "../engine/types";

/** The signed-in platform principal (mock). Brian = platform_owner. */
export const MOCK_PLATFORM_ROLE: PlatformRole = "platform_owner";

const STATUS_TONE: Record<string, "good" | "warn" | "bad" | "neutral" | "info"> = {
  active: "good", verified: "good", healthy: "good", succeeded: "good",
  trial: "info", running: "info", pending_review: "warn", discovered: "warn",
  modified: "warn", degraded: "warn", estimated: "warn", pending: "warn", idle: "neutral",
  suspended: "bad", cancelled: "bad", down: "bad", failed: "bad", rejected: "bad", expired: "neutral", archived: "neutral",
};
const tone = (s: string) => STATUS_TONE[s] ?? "neutral";

// ─────────────────────────── Home ───────────────────────────
export function HomePage() {
  const m = devPlatformMetrics();
  const alerts = [
    { tone: "bad" as const, text: `${m.sourcesDown} source down`, when: "Partner Submissions" },
    { tone: "bad" as const, text: `${m.jobsFailed} job failed`, when: "Detect cancellations" },
    { tone: "warn" as const, text: `${m.offersCancelled} offer cancelled`, when: "Regional Expo" },
    { tone: "warn" as const, text: "1 company suspended", when: "Initech Software" },
  ];
  const activity = [
    "Company registered — Demo Store",
    "Offer discovered — Local Trade Fair (GB)",
    "Offer cancelled — Regional Expo",
    "Job failed — Detect cancellations",
    "Source degraded — Retail Calendar API",
  ];
  return (
    <div>
      <PageTitle title="Home" description="Operational overview of the Eventra platform."
        actions={<><DevBadge /><Btn tone="primary">Create offer</Btn><Btn>Run sync</Btn></>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        <StatCard label="Companies" value={m.companies} sub={`${m.activeCompanies} active · ${m.trials} trial`} />
        <StatCard label="Users" value={m.users} />
        <StatCard label="Countries" value={m.countries} />
        <StatCard label="Active offers" value={m.offersActive} tone="good" />
        <StatCard label="New offers" value={m.offersNew} tone="warn" />
        <StatCard label="Cancelled" value={m.offersCancelled} tone="bad" />
        <StatCard label="Jobs failed" value={m.jobsFailed} tone={m.jobsFailed ? "bad" : "good"} />
        <StatCard label="Commission (modeled)" value={<Money minor={m.commissionMinor} />} sub="1–2%, not charged" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
        <Panel style={{ padding: 14 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>Alerts</h2>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--eos-border-soft)" }}>
              <span><Pill tone={a.tone}>alert</Pill> <span style={{ marginLeft: 8 }}>{a.text}</span></span>
              <span style={{ color: "var(--eos-muted)", fontSize: 12 }}>{a.when}</span>
            </div>
          ))}
        </Panel>
        <Panel style={{ padding: 14 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>Recent activity</h2>
          {activity.map((a, i) => (
            <div key={i} style={{ padding: "7px 0", borderBottom: "1px solid var(--eos-border-soft)", fontSize: 13, color: "var(--eos-text)" }}>{a}</div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────── Global Calendar (annual) ───────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function GlobalCalendarPage() {
  const [year, setYear] = useState(2026);
  const [country, setCountry] = useState("all");
  const countries = ["all", ...new Set(devOffers.map((o) => o.country).filter(Boolean) as string[])];
  const visible = devOffers.filter((o) => country === "all" || o.country === country);
  const occ = visible.flatMap((o) => expandOccurrences(o, { fromYear: year, horizonYears: 0 }));
  const byMonth = MONTHS.map((_, mi) => occ.filter((o) => Number(o.date.slice(5, 7)) === mi + 1));
  const ranked = [...visible].filter((o) => o.status !== "cancelled").sort(byScoreDesc);

  return (
    <div>
      <PageTitle title="Global Calendar" description="Annual view of marketing opportunities (4-year horizon supported)."
        actions={<DevBadge />} />
      <Toolbar>
        <Select label="Year" value={String(year)} onChange={(v) => setYear(Number(v))}
          options={[2026, 2027, 2028, 2029, 2030].map((y) => ({ value: String(y), label: String(y) }))} />
        <Select label="Country" value={country} onChange={setCountry}
          options={countries.map((c) => ({ value: c!, label: c === "all" ? "All countries" : c! }))} />
        <span style={{ fontSize: 12, color: "var(--eos-muted)" }}>
          Future years project from recurrence — shown as <Pill tone="warn">estimated</Pill>, never as confirmed.
        </span>
      </Toolbar>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
        {MONTHS.map((mo, i) => (
          <Panel key={mo} style={{ padding: 10, minHeight: 74 }}>
            <div style={{ fontSize: 12, color: "var(--eos-muted)", fontWeight: 600 }}>{mo}</div>
            {byMonth[i].length === 0 ? <div style={{ color: "var(--eos-faint)", fontSize: 12, marginTop: 8 }}>—</div> :
              byMonth[i].map((o) => {
                const offer = visible.find((x) => x.id === o.offerId)!;
                return <div key={o.offerId} style={{ marginTop: 6, fontSize: 12 }}>
                  <span style={{ display: "block", color: "var(--eos-text)" }}>{offer.title}</span>
                  <Pill tone={o.certainty === "confirmed" ? "good" : "warn"}>{o.certainty}</Pill>
                </div>;
              })}
          </Panel>
        ))}
      </div>
      <h2 style={{ fontSize: 14, margin: "18px 0 8px" }}>Top opportunities ({year})</h2>
      <DataTable<Offer> rows={ranked} columns={[
        { key: "t", header: "Offer", render: (o) => o.title },
        { key: "c", header: "Country", render: (o) => o.country ?? "—" },
        { key: "cert", header: "Certainty", render: (o) => <Pill tone={o.certainty === "confirmed" ? "good" : "warn"}>{o.certainty}</Pill> },
        { key: "s", header: "Score", render: (o) => o.score ? <ScoreBar value={o.score.value} /> : "—" },
        { key: "p", header: "Priority", render: (o) => <Pill tone={o.score?.priority === "critical" ? "bad" : o.score?.priority === "high" ? "info" : "neutral"}>{o.score?.priority ?? "—"}</Pill> },
      ]} />
    </div>
  );
}

// ─────────────────────────── Offers ───────────────────────────
export function OffersPage() {
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const canVerify = platformCan(MOCK_PLATFORM_ROLE, PP.offersVerify);

  const rows = useMemo(() => devOffers
    .filter((o) => status === "all" || o.status === status)
    .filter((o) => country === "all" || o.country === country)
    .sort(byScoreDesc), [status, country]);

  const statuses = ["all", ...new Set(devOffers.map((o) => o.status))];
  const countries = ["all", ...new Set(devOffers.map((o) => o.country).filter(Boolean) as string[])];
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const columns: Column<Offer>[] = [
    { key: "sel", header: "", width: 30, render: (o) => <input type="checkbox" aria-label={`Select ${o.title}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} /> },
    { key: "t", header: "Offer", render: (o) => <span style={{ fontWeight: 600 }}>{o.title}</span> },
    { key: "cat", header: "Category", render: (o) => o.category ?? "—" },
    { key: "c", header: "Country", render: (o) => o.country ?? "—" },
    { key: "st", header: "Status", render: (o) => <Pill tone={tone(o.status)}>{o.status}</Pill> },
    { key: "cert", header: "Certainty", render: (o) => <Pill tone={o.certainty === "confirmed" ? "good" : "warn"}>{o.certainty}</Pill> },
    { key: "rel", header: "Source rel.", render: (o) => <Percent value={o.reliability} /> },
    { key: "sc", header: "Score", render: (o) => o.score ? <ScoreBar value={o.score.value} /> : "—" },
  ];

  return (
    <div>
      <PageTitle title="Offers" description="Global marketing opportunities curated by Eventra." actions={<DevBadge />} />
      <Toolbar>
        <Select label="Status" value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} />
        <Select label="Country" value={country} onChange={setCountry} options={countries.map((c) => ({ value: c!, label: c === "all" ? "All" : c! }))} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--eos-muted)" }}>{selected.size} selected</span>
        <Btn tone="primary" title={canVerify ? "Mock — no live mutation" : "Requires operations role"}>Verify (mock)</Btn>
        <Btn title="Mock — no live mutation">Archive (mock)</Btn>
      </Toolbar>
      <DataTable rows={rows} columns={columns} empty="No offers match these filters." />
      <p style={{ fontSize: 12, color: "var(--eos-muted)", marginTop: 10 }}>
        Bulk actions are gated by the platform permission matrix (verify requires <code>operations</code>);
        here they are mock and never mutate live data. Every real action would be audited.
      </p>
    </div>
  );
}

// ─────────────────────────── Sources ───────────────────────────
export function SourcesPage() {
  return (
    <div>
      <PageTitle title="Sources" description="Where Eventra discovers offers. Legal/authorized sources only." actions={<DevBadge />} />
      <DataTable<OfferSource> rows={devSources} columns={[
        { key: "n", header: "Source", render: (s) => <span style={{ fontWeight: 600 }}>{s.name}</span> },
        { key: "m", header: "Method", render: (s) => s.method },
        { key: "c", header: "Country", render: (s) => s.country ?? "—" },
        { key: "st", header: "Status", render: (s) => <Pill tone={tone(s.status)}>{s.status}</Pill> },
        { key: "rel", header: "Reliability", render: (s) => <Percent value={s.reliability} /> },
        { key: "freq", header: "Every", render: (s) => s.frequencyHours ? `${s.frequencyHours}h` : "manual" },
        { key: "err", header: "Errors", render: (s) => s.errorCount },
        { key: "last", header: "Last sync", render: (s) => s.lastSyncAt?.slice(0, 10) ?? "—" },
      ]} />
    </div>
  );
}

// ─────────────────────────── Companies ───────────────────────────
export function CompaniesPage() {
  const [status, setStatus] = useState("all");
  const rows = devCompanies.filter((c) => status === "all" || c.status === status);
  return (
    <div>
      <PageTitle title="Companies" description="Business customers on Eventra. Data isolated per tenant." actions={<DevBadge />} />
      <Toolbar>
        <Select label="Status" value={status} onChange={setStatus}
          options={["all", "active", "trial", "suspended"].map((s) => ({ value: s, label: s }))} />
      </Toolbar>
      <DataTable<DevCompany> rows={rows} columns={[
        { key: "n", header: "Company", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
        { key: "plan", header: "Plan", render: (c) => c.plan.replace("business.", "") },
        { key: "c", header: "Country", render: (c) => c.country },
        { key: "ind", header: "Industry", render: (c) => c.industry },
        { key: "st", header: "Status", render: (c) => <Pill tone={tone(c.status)}>{c.status}</Pill> },
        { key: "spend", header: "Monthly", render: (c) => <Money minor={c.monthlySpendMinor} /> },
        { key: "risk", header: "Risk", render: (c) => <Pill tone={c.riskScore > 0.6 ? "bad" : c.riskScore > 0.3 ? "warn" : "good"}><Percent value={c.riskScore} /></Pill> },
        { key: "iss", header: "Issues", render: (c) => c.openIssues },
      ]} />
    </div>
  );
}

// ─────────────────────────── Users ───────────────────────────
export function UsersPage() {
  return (
    <div>
      <PageTitle title="Users & Teams" description="People across business customers. No cross-tenant exposure." actions={<DevBadge />} />
      <DataTable<DevUser> rows={devUsers} columns={[
        { key: "n", header: "User", render: (u) => <span style={{ fontWeight: 600 }}>{u.name}</span> },
        { key: "co", header: "Company", render: (u) => devCompanies.find((c) => c.id === u.companyId)?.name ?? u.companyId },
        { key: "r", header: "Role", render: (u) => u.role },
        { key: "st", header: "Status", render: (u) => <Pill tone={tone(u.status)}>{u.status}</Pill> },
        { key: "last", header: "Last active", render: (u) => u.lastActiveAt.slice(0, 10) },
      ]} />
    </div>
  );
}

// ─────────────────────────── Commissions ───────────────────────────
export function CommissionsPage() {
  const total = devCommissions.reduce((s, c) => s + c.amount, 0);
  return (
    <div>
      <PageTitle title="Commissions" description="Modeled 1–2% platform commission. No real charges." actions={<DevBadge />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
        <StatCard label="Modeled total" value={<Money minor={total} />} sub="not charged" />
        <StatCard label="Rate band" value="1–2%" sub="hard-clamped" />
        <StatCard label="Records" value={devCommissions.length} />
      </div>
      <DataTable rows={devCommissions} columns={[
        { key: "org", header: "Company", render: (c) => devCompanies.find((x) => x.id === c.organizationId)?.name ?? c.organizationId },
        { key: "op", header: "Operation", render: (c) => c.operation.replace(/_/g, " ") },
        { key: "base", header: "Base", render: (c) => <Money minor={c.baseAmount} currency={c.currency} /> },
        { key: "rate", header: "Rate", render: (c) => <Percent value={c.rate} /> },
        { key: "amt", header: "Amount", render: (c) => <Money minor={c.amount} currency={c.currency} /> },
        { key: "st", header: "Status", render: (c) => <Pill tone="neutral">{c.status}</Pill> },
      ]} />
    </div>
  );
}

// ─────────────────────────── Jobs ───────────────────────────
export function JobsPage() {
  return (
    <div>
      <PageTitle title="Automations & Jobs" description="Scheduled platform jobs (mock — no external services connected)." actions={<DevBadge />} />
      <DataTable<DevJob> rows={devJobs} columns={[
        { key: "n", header: "Job", render: (j) => <span style={{ fontWeight: 600 }}>{j.name}</span> },
        { key: "st", header: "Status", render: (j) => <Pill tone={tone(j.status)}>{j.status}</Pill> },
        { key: "last", header: "Last run", render: (j) => j.lastRunAt.slice(0, 16).replace("T", " ") },
        { key: "next", header: "Next run", render: (j) => j.nextRunAt.slice(0, 16).replace("T", " ") },
        { key: "err", header: "Errors", render: (j) => j.errorCount },
        { key: "act", header: "", render: () => <Btn title="Mock — no external service">Run</Btn> },
      ]} />
    </div>
  );
}

// ─────────────────────────── Analytics ───────────────────────────
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <span style={{ width: 120, fontSize: 12, color: "var(--eos-muted)" }}>{label}</span>
      <span style={{ flex: 1, height: 8, background: "var(--eos-surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${max ? (value / max) * 100 : 0}%`, background: "var(--eos-brand)" }} />
      </span>
      <span style={{ width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
export function AnalyticsPage() {
  const byPlan = Object.entries(devCompanies.reduce<Record<string, number>>((a, c) => { a[c.plan] = (a[c.plan] ?? 0) + 1; return a; }, {}));
  const byStatus = Object.entries(devOffers.reduce<Record<string, number>>((a, o) => { a[o.status] = (a[o.status] ?? 0) + 1; return a; }, {}));
  const maxPlan = Math.max(...byPlan.map(([, n]) => n), 1);
  const maxStatus = Math.max(...byStatus.map(([, n]) => n), 1);
  return (
    <div>
      <PageTitle title="Analytics" description="Platform analytics. Dev seed only — real data replaces it at connect." actions={<DevBadge />} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel style={{ padding: 14 }}>
          <h2 style={{ fontSize: 14, margin: "0 0 8px" }}>Companies by plan</h2>
          {byPlan.map(([k, n]) => <Bar key={k} label={k.replace("business.", "")} value={n} max={maxPlan} />)}
        </Panel>
        <Panel style={{ padding: 14 }}>
          <h2 style={{ fontSize: 14, margin: "0 0 8px" }}>Offers by status</h2>
          {byStatus.map(([k, n]) => <Bar key={k} label={k} value={n} max={maxStatus} />)}
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────────── AI ───────────────────────────
export function AiPage() {
  const ai = useMemo(() => new DeterministicFakeAI(), []);
  const [result, setResult] = useState<string>("");
  const run = async () => {
    const r = await ai.run({ task: "classify", input: { title: devOffers[0].title, country: devOffers[0].country } });
    setResult(JSON.stringify(r, null, 2));
  };
  return (
    <div>
      <PageTitle title="AI" description="Deterministic fake provider. No paid model, no credentials, no auto-publish." actions={<DevBadge />} />
      <Panel style={{ padding: 16 }}>
        <p style={{ marginTop: 0, color: "var(--eos-muted)", fontSize: 13 }}>
          The Internal OS calls AI only through an abstract port. Low-confidence results require human review
          and can never auto-publish. A real provider is added later, only with authorization.
        </p>
        <Btn tone="primary" onClick={run}>Classify sample offer (fake)</Btn>
        {result ? <pre style={{ marginTop: 12, background: "var(--eos-surface-2)", border: "1px solid var(--eos-border)", borderRadius: 8, padding: 12, fontSize: 12, overflowX: "auto" }}>{result}</pre> : null}
      </Panel>
    </div>
  );
}

// ─────────────────────────── Scaffold ───────────────────────────
export function ModulePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <PageTitle title={title} description="Scaffolded — the information architecture exists; this module is not built yet." />
      <Panel style={{ padding: 40, textAlign: "center", color: "var(--eos-muted)" }}>
        <div style={{ fontWeight: 600, color: "var(--eos-text)" }}>Planned module</div>
        <p style={{ maxWidth: 480, margin: "8px auto 0", fontSize: 13 }}>{note}</p>
      </Panel>
    </div>
  );
}
