import { describe, it, expect } from "vitest";
import {
  EVENTRA_APP_LINKS,
  EVENTRA_TAURI_APPS,
  ALLOWED_APP_IDENTIFIERS,
  ALLOWED_APP_SCHEMES,
  isAllowedAppIdentifier,
  isAllowedAppScheme,
  tauriAppByIdentifier,
  isValidDeepLinkRoute,
  buildDeepLink,
  deepLinkFor,
  validateWebTarget,
  resolveBusinessClientUrl,
} from "../src/index";

describe("@eventra/config — cross-product app links (source of truth)", () => {
  it("declares the three official Tauri identifiers exactly", () => {
    expect([...ALLOWED_APP_IDENTIFIERS].sort()).toEqual([
      "com.eventra.business.admin",
      "com.eventra.internal",
      "com.eventra.mobile",
    ]);
  });

  it("declares one scheme per Tauri app", () => {
    expect([...ALLOWED_APP_SCHEMES].sort()).toEqual([
      "eventra-business-admin",
      "eventra-internal",
      "eventra-mobile",
    ]);
    expect(EVENTRA_TAURI_APPS).toHaveLength(3);
  });

  it("business client is a web app with a real https fallback, not a Tauri app", () => {
    expect(EVENTRA_APP_LINKS.businessClient.kind).toBe("web");
    expect(EVENTRA_APP_LINKS.businessClient.fallbackUrl).toMatch(/^https:\/\//);
  });
});

describe("identifier allowlist (Fase 10 · prueba 8)", () => {
  it("accepts only the three permitted identifiers", () => {
    expect(isAllowedAppIdentifier("com.eventra.internal")).toBe(true);
    expect(isAllowedAppIdentifier("com.eventra.business.admin")).toBe(true);
    expect(isAllowedAppIdentifier("com.eventra.mobile")).toBe(true);
  });
  it("rejects unauthorized identifiers", () => {
    expect(isAllowedAppIdentifier("com.partnera.creator")).toBe(false);
    expect(isAllowedAppIdentifier("com.primebuild.core")).toBe(false);
    expect(isAllowedAppIdentifier("")).toBe(false);
    expect(isAllowedAppIdentifier("com.eventra.internal.evil")).toBe(false);
  });
  it("maps identifier → app", () => {
    expect(tauriAppByIdentifier("com.eventra.mobile")?.scheme).toBe("eventra-mobile");
    expect(tauriAppByIdentifier("nope")).toBeNull();
  });
});

describe("deep-link route validation (Fase 10 · pruebas 12/13)", () => {
  it("accepts valid internal routes", () => {
    expect(isValidDeepLinkRoute("")).toBe(true);
    expect(isValidDeepLinkRoute("dashboard")).toBe(true);
    expect(isValidDeepLinkRoute("marketing/campaigns")).toBe(true);
    expect(isValidDeepLinkRoute("orders/live")).toBe(true);
  });
  it("rejects file paths, commands, traversal, schemes, queries and js", () => {
    expect(isValidDeepLinkRoute("../secret")).toBe(false);
    expect(isValidDeepLinkRoute("C:\\Windows")).toBe(false);
    expect(isValidDeepLinkRoute("/etc/passwd")).toBe(false);
    expect(isValidDeepLinkRoute("dashboard?x=1")).toBe(false);
    expect(isValidDeepLinkRoute("javascript:alert(1)")).toBe(false);
    expect(isValidDeepLinkRoute("http://evil.com")).toBe(false);
    expect(isValidDeepLinkRoute("a b")).toBe(false);
    expect(isValidDeepLinkRoute("UPPER")).toBe(false);
  });
});

describe("buildDeepLink / deepLinkFor", () => {
  it("builds validated deep links for allowed schemes+routes", () => {
    expect(buildDeepLink("eventra-business-admin", "dashboard")).toBe("eventra-business-admin://dashboard");
    expect(buildDeepLink("eventra-mobile", "")).toBe("eventra-mobile://");
    expect(deepLinkFor("businessAdmin", "companies")).toBe("eventra-business-admin://companies");
    expect(deepLinkFor("internalOs", "apps")).toBe("eventra-internal://apps");
  });
  it("returns null for disallowed scheme or invalid route", () => {
    expect(buildDeepLink("file", "x")).toBeNull();
    expect(buildDeepLink("eventra-mobile", "../x")).toBeNull();
    expect(isAllowedAppScheme("file")).toBe(false);
  });
});

describe("web target validation (Fase 10 · pruebas 9/10)", () => {
  it("accepts allow-listed https hosts", () => {
    expect(validateWebTarget("https://eventrabusiness-production.up.railway.app/")).toBeTruthy();
    expect(validateWebTarget("https://eventra.app/pricing")).toBeTruthy();
    expect(validateWebTarget("https://help.eventra.app")).toBeTruthy();
  });
  it("rejects http (prueba 9)", () => {
    expect(validateWebTarget("http://eventra.app")).toBeNull();
    expect(validateWebTarget("http://eventrabusiness-production.up.railway.app")).toBeNull();
  });
  it("rejects unknown domains (prueba 10)", () => {
    expect(validateWebTarget("https://evil.com")).toBeNull();
    expect(validateWebTarget("https://eventra.app.evil.com")).toBeNull();
    expect(validateWebTarget("https://notrailway.up.railway.app")).toBeNull();
  });
  it("rejects credentials and non-web schemes", () => {
    expect(validateWebTarget("https://user:pass@eventra.app")).toBeNull();
    expect(validateWebTarget("javascript:alert(1)")).toBeNull();
    expect(validateWebTarget("file:///etc/passwd")).toBeNull();
    expect(validateWebTarget("not a url")).toBeNull();
  });
});

describe("resolveBusinessClientUrl (env-driven, validated)", () => {
  it("uses the real fallback when no env is set", () => {
    expect(resolveBusinessClientUrl(() => undefined)).toBe(
      "https://eventrabusiness-production.up.railway.app/",
    );
  });
  it("honors a valid env override", () => {
    const url = resolveBusinessClientUrl((k) =>
      k === "VITE_BUSINESS_URL" ? "https://eventra.app/business" : undefined,
    );
    expect(url).toBe("https://eventra.app/business");
  });
  it("blocks (null) a configured-but-untrusted or http override — never opens it", () => {
    expect(resolveBusinessClientUrl((k) => (k === "VITE_BUSINESS_URL" ? "http://evil.com" : undefined))).toBeNull();
    expect(resolveBusinessClientUrl((k) => (k === "VITE_BUSINESS_URL" ? "https://evil.com" : undefined))).toBeNull();
  });
});
