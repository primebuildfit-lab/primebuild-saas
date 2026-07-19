import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  getCountry,
  activeCountries,
  countriesByStatus,
  primaryLocale,
  localesOf,
  defaultCountry,
  businessMarkets,
} from "../src/index";

describe("@eventra/config — country & locale catalog (single source of truth)", () => {
  it("has unique, valid ISO 3166-1 alpha-2 codes", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length); // no duplicates
    for (const c of codes) expect(c).toMatch(/^[A-Z]{2}$/);
  });

  it("every country carries the required real fields", () => {
    for (const c of COUNTRIES) {
      expect(c.name).toBeTruthy();
      expect(c.nameEs).toBeTruthy();
      expect(c.flag).toBeTruthy();
      expect(c.region).toBeTruthy();
      expect(c.currency).toMatch(/^[A-Z]{3}$/); // ISO 4217
      expect(c.timezone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/); // IANA tz
      expect(c.primaryLocale.code).toMatch(/^[a-z]{2}-[A-Z]{2}$/); // BCP-47
      expect(c.primaryLocale.label).toBeTruthy(); // readable, never a bare code
      expect(["active", "beta", "planned"]).toContain(c.status);
      expect(["complete", "partial", "basic"]).toContain(c.coverage);
    }
  });

  it("primary locales match the approved standard set (ORDER §5)", () => {
    expect(primaryLocale("US")).toBe("en-US");
    expect(primaryLocale("CA")).toBe("en-CA");
    expect(primaryLocale("ES")).toBe("es-ES");
    expect(primaryLocale("MX")).toBe("es-MX");
    expect(primaryLocale("GB")).toBe("en-GB");
  });

  it("resolves secondary languages with readable labels (US→Español, CA→Français)", () => {
    expect(localesOf("US").map((l) => l.code)).toContain("es-US");
    expect(localesOf("CA").map((l) => l.label)).toContain("Français");
  });

  it("getCountry is case-insensitive and primaryLocale falls back safely", () => {
    expect(getCountry("us")?.code).toBe("US");
    expect(getCountry("zz")).toBeUndefined();
    expect(primaryLocale("zz")).toBe("en-US"); // never undefined
  });

  it("active markets are US + CA; beta/planned are excluded", () => {
    expect(activeCountries().map((c) => c.code).sort()).toEqual(["CA", "US"]);
    expect(countriesByStatus("beta").map((c) => c.code)).toEqual(["GB"]);
    expect(countriesByStatus("planned").map((c) => c.code).sort()).toEqual(["ES", "MX"]);
  });

  it("Business market projection derives ONLY from active countries (no duplicate list)", () => {
    const markets = businessMarkets();
    expect(markets.map((m) => m.code).sort()).toEqual(["CA", "US"]);
    // projection stays faithful to the catalog
    for (const m of markets) {
      const src = getCountry(m.code)!;
      expect(m.name).toBe(src.name);
      expect(m.flag).toBe(src.flag);
    }
  });

  it("Mobile default country resolves from the catalog (first active = US)", () => {
    expect(defaultCountry().code).toBe("US");
    expect(defaultCountry().nameEs).toBe("Estados Unidos");
  });

  it("changing a primary locale in the catalog propagates through the resolver", () => {
    // Guards ORDER §6: modules read primaryLocale(), so a catalog change is global.
    const us = getCountry("US")!;
    expect(primaryLocale("US")).toBe(us.primaryLocale.code);
  });
});
