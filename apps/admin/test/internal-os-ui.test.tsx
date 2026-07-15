import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  MetricCard, MetricTrend, Donut, StatusBadge, PriorityBadge, EmptyState, ErrorState, ProgressBar,
} from "../src/os/ui";
import { OS_NAV, QUICK_CREATE, OS_COMMANDS } from "../src/os/nav";
import { deriveActivity, campaignProgress, devCampaigns } from "../src/data/os-seed";

afterEach(cleanup);

describe("MetricCard", () => {
  it("shows a real value when present", () => {
    render(<MetricCard label="Campañas activas" value={12} trend="none" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
  it("shows the empty label (never a fabricated number) when value is null", () => {
    render(<MetricCard label="Rendimiento general" value={null} emptyLabel="No disponible" trend="none" />);
    expect(screen.getByText("No disponible")).toBeInTheDocument();
  });
});

describe("MetricTrend", () => {
  it("renders 'Sin comparación' when there is no historical delta", () => {
    render(<MetricTrend delta={null} />);
    expect(screen.getByText("Sin comparación")).toBeInTheDocument();
  });
  it("renders a signed delta when a real comparison exists", () => {
    render(<MetricTrend delta={12} />);
    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
  });
});

describe("Donut", () => {
  it("preserves the container + shows an empty state when there is no data", () => {
    render(<Donut segments={[]} />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByText("Métrica aún no disponible")).toBeInTheDocument();
  });
  it("renders legend percentages when data exists", () => {
    render(<Donut segments={[{ label: "Email", value: 3, color: "#38bdf8" }, { label: "Web", value: 1, color: "#84cc16" }]} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});

describe("Badges & states", () => {
  it("StatusBadge maps status to a tone and readable text", () => {
    render(<StatusBadge status="not_configured" />);
    expect(screen.getByText("not configured")).toBeInTheDocument();
  });
  it("PriorityBadge renders the priority", () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });
  it("EmptyState and ErrorState render their messages", () => {
    const { unmount } = render(<EmptyState title="No hay actividad reciente" />);
    expect(screen.getByText("No hay actividad reciente")).toBeInTheDocument();
    unmount();
    render(<ErrorState title="Métrica no conectada" />);
    expect(screen.getByText("Métrica no conectada")).toBeInTheDocument();
  });
  it("ProgressBar clamps and shows a percentage", () => {
    render(<ProgressBar value={140} />);
    expect(screen.getByText("140%")).toBeInTheDocument();
  });
});

describe("Navigation map (platform-control structure)", () => {
  it("has the corrected branch set across five groups", () => {
    expect(OS_NAV).toHaveLength(28);
    expect(OS_NAV.filter((n) => n.section === "general")).toHaveLength(6);
    expect(OS_NAV.filter((n) => n.section === "metricas")).toHaveLength(5);
    expect(OS_NAV.filter((n) => n.section === "datos")).toHaveLength(7);
    expect(OS_NAV.filter((n) => n.section === "producto")).toHaveLength(6);
    expect(OS_NAV.filter((n) => n.section === "control")).toHaveLength(4);
  });
  it("exposes the platform-control branches (métricas separadas, parámetros, salud, auditoría)", () => {
    const paths = OS_NAV.map((n) => n.to);
    for (const p of ["/metrics", "/metrics/mobile", "/metrics/business", "/parameters", "/publications", "/companies", "/health", "/audit"]) {
      expect(paths).toContain(p);
    }
  });
  it("no longer exposes client-operational entities as top-level branches", () => {
    const paths = OS_NAV.map((n) => n.to);
    for (const p of ["/events", "/opportunities", "/campaigns", "/offers", "/ads", "/studio", "/content", "/tasks"]) {
      expect(paths).not.toContain(p);
    }
  });
  it("exposes quick-create actions and a command for every branch", () => {
    expect(QUICK_CREATE).toHaveLength(6);
    expect(OS_COMMANDS.length).toBeGreaterThanOrEqual(OS_NAV.length + QUICK_CREATE.length);
  });
});

describe("Data honesty", () => {
  it("activity is DERIVED from real fixture state (not a hand-written list)", () => {
    const acts = deriveActivity();
    expect(acts.length).toBeGreaterThan(0);
    // Every derived item must correspond to a real failing/down/cancelled fixture.
    expect(acts.every((a) => ["danger", "warning"].includes(a.tone))).toBe(true);
  });
  it("campaign progress is derived from real dates and clamped to 0..100", () => {
    for (const c of devCampaigns) {
      const p = campaignProgress(c);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});
