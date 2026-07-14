import { describe, it, expect } from "vitest";
import { navGroups, platformNav, allNavItems } from "~/lib/nav";

describe("navigation architecture (VIP)", () => {
  it("exposes the VIP groups in order", () => {
    expect(navGroups.map((g) => g.label)).toEqual([
      "Dashboard",
      "Planning",
      "Create",
      "Knowledge",
      "Company",
    ]);
  });

  it("puts Opportunities & Advertisements in Planning, Promotion Builder & Offers in Create", () => {
    const planning = navGroups.find((g) => g.label === "Planning");
    const create = navGroups.find((g) => g.label === "Create");
    expect(planning?.items.some((i) => i.to === "/app/opportunities")).toBe(true);
    expect(planning?.items.some((i) => i.to === "/app/advertisements")).toBe(true);
    expect(create?.items.some((i) => i.to === "/app/promotion-builder")).toBe(true);
    expect(create?.items.some((i) => i.to === "/app/offers")).toBe(true);
  });

  it("routes every nav item under /app and has unique destinations", () => {
    const tos = allNavItems.map((i) => i.to);
    for (const item of allNavItems) expect(item.to.startsWith("/app")).toBe(true);
    expect(new Set(tos).size).toBe(tos.length);
  });

  it("includes the VIP modules", () => {
    const tos = allNavItems.map((i) => i.to);
    for (const to of [
      "/app/calendar",
      "/app/events",
      "/app/opportunities",
      "/app/advertisements",
      "/app/campaigns",
      "/app/promotion-builder",
      "/app/offers",
      "/app/templates",
      "/app/content",
      "/app/media",
      "/app/memory",
      "/app/analytics",
      "/app/countries",
      "/app/sources",
      "/app/audiences",
      "/app/team",
      "/app/integrations",
      "/app/billing",
      "/app/settings",
    ]) {
      expect(tos).toContain(to);
    }
  });

  it("keeps internal/admin surfaces out of the primary Business nav", () => {
    const businessTos = navGroups.flatMap((g) => g.items).map((i) => i.to);
    for (const to of ["/app/admin", "/app/ai", "/app/automations", "/app/jobs"]) {
      expect(businessTos).not.toContain(to);
    }
    expect(platformNav.some((i) => i.to === "/app/admin")).toBe(true);
  });
});
