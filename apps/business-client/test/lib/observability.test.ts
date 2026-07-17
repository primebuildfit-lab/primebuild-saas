// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { requestId, logEvent } from "~/lib/observability.server";
import { buildInfo } from "~/lib/version.server";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.LOG_LEVEL;
  delete process.env.BUILD_VERSION;
});

describe("requestId", () => {
  it("reuses an inbound x-request-id header", () => {
    const req = new Request("https://x.test", { headers: { "x-request-id": "abc-123" } });
    expect(requestId(req)).toBe("abc-123");
  });
  it("generates a fresh id when none is provided", () => {
    const a = requestId();
    const b = requestId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/[0-9a-f-]{36}/);
  });
  it("ignores an absurdly long forged header", () => {
    const req = new Request("https://x.test", { headers: { "x-request-id": "z".repeat(500) } });
    expect(requestId(req)).toMatch(/[0-9a-f-]{36}/);
  });
});

describe("logEvent honors LOG_LEVEL", () => {
  it("suppresses debug when level is info (default)", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logEvent("debug", "should.not.log");
    expect(spy).not.toHaveBeenCalled();
  });
  it("emits structured JSON at or above threshold", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logEvent("info", "tenant.provisioned", { org: "org_1" });
    expect(spy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(spy.mock.calls[0][0] as string);
    expect(payload).toMatchObject({ level: "info", event: "tenant.provisioned", org: "org_1" });
    expect(payload.ts).toBeTruthy();
  });
  it("routes errors to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logEvent("error", "boom");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("buildInfo", () => {
  it("falls back safely and reflects BUILD_VERSION when set", () => {
    expect(buildInfo().version).toBeTruthy();
    process.env.BUILD_VERSION = "9.9.9";
    expect(buildInfo().version).toBe("9.9.9");
  });
});
