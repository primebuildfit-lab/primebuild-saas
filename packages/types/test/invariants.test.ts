import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  PrincipalType,
  MembershipRole,
  DateRule,
  ConsumerProductId,
  ConsumerAddOnId,
  BusinessPlanId,
  Workspace,
} from "../src/index";

describe("@eventra/types invariants", () => {
  it("PrincipalType covers the five platform principals (exhaustive)", () => {
    const all: Record<PrincipalType, true> = {
      consumer: true,
      org_member: true,
      advertiser: true,
      admin: true,
      service: true,
    };
    expect(Object.keys(all).sort()).toEqual(
      ["admin", "advertiser", "consumer", "org_member", "service"],
    );
  });

  it("MembershipRole is the four org roles", () => {
    const roles: MembershipRole[] = ["owner", "admin", "editor", "viewer"];
    expect(roles).toHaveLength(4);
  });

  it("consumer products and add-on are distinct identifiers (independence)", () => {
    expectTypeOf<ConsumerProductId>().toEqualTypeOf<
      "consumer.core" | "consumer.deal_intelligence"
    >();
    // Ad-Free is NOT a ConsumerProductId — it is a separate add-on axis.
    expectTypeOf<ConsumerAddOnId>().toEqualTypeOf<"addon.ad_free">();
  });

  it("business plans include a Free tier", () => {
    expectTypeOf<BusinessPlanId>().toEqualTypeOf<
      "business.free" | "business.starter" | "business.growth" | "business.pro"
    >();
  });

  it("DateRule supports offsetDays (relative holidays)", () => {
    const bf: DateRule = {
      kind: "nth_weekday",
      month: 11,
      weekday: 4,
      nth: 4,
      offsetDays: 1,
    };
    expect(bf.offsetDays).toBe(1);
  });

  it("Workspace is a planning environment, distinct from a commerce store", () => {
    expectTypeOf<Workspace["status"]>().toEqualTypeOf<
      "active" | "read_only" | "archived"
    >();
  });
});
