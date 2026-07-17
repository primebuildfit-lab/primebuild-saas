import { describe, it, expect } from "vitest";
import {
  rowToCampaign,
  campaignToRow,
  rowToGlobalEvent,
  rowToStorePreference,
  rowToSubscription,
  rowToWorkspaceNote,
} from "~/db/mappers";

describe("campaign mappers (round-trip)", () => {
  const row = {
    id: "c1",
    workspace_id: "w1",
    name: "Summer Sale",
    global_event_id: "ge_us_independence",
    country: "US",
    objective: "Clear inventory",
    description: "desc",
    prep_start: "2026-06-15",
    start_date: "2026-07-01",
    end_date: "2026-07-07",
    offer: "20% off",
    product_refs: ["prod_tee_classic"],
    notes: "n",
    status: "draft",
    actions: [{ id: "a1", label: "Enable discount", done: false }],
    created_from_id: null,
    version: 1,
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-07-08T00:00:00Z",
  };

  it("maps a DB row (workspace_id) to a domain Campaign", () => {
    const c = rowToCampaign(row);
    expect(c.storeId).toBe("w1"); // façade storeId === workspace_id
    expect(c.globalEventId).toBe("ge_us_independence");
    expect(c.startDate).toBe("2026-07-01");
    expect(c.productRefs).toEqual(["prod_tee_classic"]);
    expect(c.createdFromId).toBeUndefined(); // null -> undefined
    expect(c.version).toBe(1);
    expect(c.actions).toHaveLength(1);
  });

  it("maps a domain Campaign back to an insertable row (workspace_id)", () => {
    const c = rowToCampaign(row);
    const back = campaignToRow(c);
    expect(back.workspace_id).toBe("w1");
    expect(back.global_event_id).toBe("ge_us_independence");
    expect(back.start_date).toBe("2026-07-01");
    expect(back.product_refs).toEqual(["prod_tee_classic"]);
    expect(back.status).toBe("draft");
  });

  it("nulls optional fields that are absent", () => {
    const row2 = campaignToRow({ storeId: "w1", name: "X", startDate: "2026-01-01", endDate: "2026-01-02", status: "draft" });
    expect(row2.global_event_id).toBeNull();
    expect(row2.offer).toBeNull();
  });
});

describe("catalog + tenant mappers", () => {
  it("maps a global event row incl. jsonb start_rule with offsetDays", () => {
    const e = rowToGlobalEvent({
      id: "ge_us_blackfriday", name: "Black Friday", country_codes: ["US", "CA"],
      start_rule: { kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays: 1 },
      end_rule: null, category: "major_sales", importance: "high",
      description: "d", recommended_lead_days: 45, recurring: true,
    });
    expect(e.countryCodes).toEqual(["US", "CA"]);
    expect(e.startRule.offsetDays).toBe(1);
    expect(e.endRule).toBeUndefined();
  });

  it("maps workspace preferences with appearance defaults", () => {
    const p = rowToStorePreference({
      workspace_id: "w1", week_starts_on: 1, calendar_format: "month",
      reminder_defaults: [30, 7], accent: "emerald", density: "compact",
    });
    expect(p.storeId).toBe("w1");
    expect(p.weekStartsOn).toBe(1);
    expect(p.accent).toBe("emerald");
    expect(p.density).toBe("compact");
  });

  it("maps an org-scoped subscription row to the façade plan id + workspace store id", () => {
    const s = rowToSubscription(
      { organization_id: "o1", plan_id: "business.pro", status: "active" },
      "w1",
    );
    expect(s.storeId).toBe("w1");
    expect(s.planId).toBe("vip"); // locked business.pro -> façade vip (legacy alias)
    expect(s.status).toBe("active");
  });

  it("maps a workspace note row", () => {
    const n = rowToWorkspaceNote({
      id: "n1", workspace_id: "w1", body: "prep checklist",
      created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-02T00:00:00Z",
    });
    expect(n.storeId).toBe("w1");
    expect(n.body).toBe("prep checklist");
  });
});
