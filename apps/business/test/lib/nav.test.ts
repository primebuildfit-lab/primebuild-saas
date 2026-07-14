import { describe, it, expect } from "vitest";
import { navGroups, platformNav, allNavItems } from "~/lib/nav";

describe("navigation architecture (Business commercial redesign)", () => {
  it("exposes the commercial groups in order", () => {
    expect(navGroups.map((g) => g.label)).toEqual([
      "Dashboard",
      "Planning",
      "Content",
      "Knowledge",
      "Company",
    ]);
  });

  it("puts Opportunities and the Promotion Builder in the Planning group", () => {
    const planning = navGroups.find((g) => g.label === "Planning");
    expect(planning?.items.some((i) => i.to === "/app/opportunities")).toBe(true);
    expect(planning?.items.some((i) => i.to === "/app/promotion-builder")).toBe(true);
  });

  it("routes every nav item under /app", () => {
    for (const item of allNavItems) {
      expect(item.to.startsWith("/app")).toBe(true);
    }
  });

  it("has unique destinations", () => {
    const tos = allNavItems.map((i) => i.to);
    expect(new Set(tos).size).toBe(tos.length);
  });

  it("includes the core commercial modules", () => {
    const tos = allNavItems.map((i) => i.to);
    for (const to of [
      "/app/opportunities",
      "/app/campaigns",
      "/app/promotion-builder",
      "/app/campaign-library",
      "/app/content",
      "/app/templates",
      "/app/media",
      "/app/audiences",
      "/app/analytics",
      "/app/countries",
      "/app/sources",
      "/app/team",
      "/app/billing",
      "/app/settings",
    ]) {
      expect(tos).toContain(to);
    }
  });

  it("keeps internal/admin surfaces out of the primary Business nav", () => {
    const businessTos = navGroups.flatMap((g) => g.items).map((i) => i.to);
    // Internal OS / operational surfaces are reachable by deep link, not primary nav.
    for (const to of ["/app/admin", "/app/ai", "/app/automations", "/app/jobs"]) {
      expect(businessTos).not.toContain(to);
    }
    expect(platformNav.some((i) => i.to === "/app/admin")).toBe(true);
  });
});
