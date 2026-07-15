import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// The app-surface boxes probe each host's reachability with a `no-cors` fetch.
// Stub fetch so tests are deterministic and never touch the network: a resolved
// value means "host reachable" → surfaces report "En línea".
vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({ ok: true }) as Response),
);
