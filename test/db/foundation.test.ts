// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { jwtVerify } from "jose";
import { uuidv5, ownerUserId } from "~/db/ids.server";
import { signUserJwt } from "~/db/supabase.server";
import { persistenceEnabled } from "~/db/env.server";

describe("uuidv5 (deterministic tenant ids)", () => {
  it("matches the RFC 4122 reference vector", () => {
    // www.example.com in the standard DNS namespace.
    expect(
      uuidv5("www.example.com", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
    ).toBe("2ed6657d-e927-568b-95e1-2665a8aea6a2");
  });

  it("is deterministic and case-insensitive for shop owners", () => {
    expect(ownerUserId("demo.myshopify.com")).toBe(ownerUserId("DEMO.myshopify.com"));
    expect(ownerUserId("a.myshopify.com")).not.toBe(ownerUserId("b.myshopify.com"));
    // valid v5 shape
    expect(ownerUserId("a.myshopify.com")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe("signUserJwt (RLS bridge)", () => {
  it("signs a verifiable token whose sub=userId and role=authenticated", async () => {
    const secret = "test-jwt-secret-that-is-long-enough-32bytes";
    const userId = ownerUserId("shop.myshopify.com");
    const token = await signUserJwt(userId, secret);

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    expect(payload.sub).toBe(userId);
    expect(payload.role).toBe("authenticated");
    expect(payload.exp).toBeGreaterThan(payload.iat as number);
  });
});

describe("persistenceEnabled gate", () => {
  const keys = [
    "EVENTRA_PERSISTENCE",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
  ];
  beforeEach(() => keys.forEach((k) => delete process.env[k]));

  it("is false unless explicitly enabled with all secrets present", () => {
    expect(persistenceEnabled()).toBe(false);
    process.env.EVENTRA_PERSISTENCE = "true";
    expect(persistenceEnabled()).toBe(false); // secrets missing
    process.env.SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
    process.env.SUPABASE_JWT_SECRET = "jwt";
    expect(persistenceEnabled()).toBe(true);
    process.env.EVENTRA_PERSISTENCE = "false";
    expect(persistenceEnabled()).toBe(false);
  });
});
