/**
 * Updater tests. The IPC boundary is not stubbed: these run in jsdom, where
 * `isTauri()` is false, so they assert the honest out-of-desktop degradation and
 * the pure presentation logic that decides what the operator reads.
 */
import { describe, it, expect } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { PlatformRole } from "@eventra/identity";
import { App } from "../src/App";
import type { OperatorSession } from "../src/os/session";
import {
  checkForUpdates,
  describeOutcome,
  formatBytes,
  formatProgress,
  installUpdate,
  isTauri,
  readUpdaterState,
  type CheckOutcome,
} from "../src/os/updates";

function sessionFor(role: PlatformRole = "platform_owner"): OperatorSession {
  return {
    connected: false,
    operator: { userId: "op1", displayName: "Operador Prueba", email: "op@eventra.app", role },
  };
}

describe("update outcome messaging", () => {
  it("says clearly that the app is up to date", () => {
    const v = describeOutcome({ kind: "up_to_date", currentVersion: "0.1.0" });
    expect(v.tone).toBe("success");
    expect(v.label).toBe("Actualizada");
    expect(v.detail).toContain("está actualizada");
    expect(v.detail).toContain("0.1.0");
    expect(v.canInstall).toBe(false);
  });

  it("says clearly that a new version exists, naming both versions", () => {
    const v = describeOutcome({
      kind: "available",
      currentVersion: "0.1.0",
      version: "0.1.1",
      notes: null,
      date: null,
    });
    expect(v.label).toBe("Actualización 0.1.1");
    expect(v.detail).toContain("0.1.1");
    expect(v.detail).toContain("0.1.0");
    // only this state may offer the install action
    expect(v.canInstall).toBe(true);
  });

  it("surfaces the reason when no channel is configured, and offers no install", () => {
    const v = describeOutcome({ kind: "not_configured", reason: "Sin canal." });
    expect(v.tone).toBe("warning");
    expect(v.detail).toBe("Sin canal.");
    expect(v.canInstall).toBe(false);
  });

  it("surfaces the error message on a failed check, and offers no install", () => {
    const v = describeOutcome({ kind: "failed", message: "Sin conexión." });
    expect(v.tone).toBe("danger");
    expect(v.detail).toBe("Sin conexión.");
    expect(v.canInstall).toBe(false);
  });

  it("shows a checking state while no outcome is known yet", () => {
    expect(describeOutcome(null).label).toBe("Comprobando");
  });
});

describe("download progress formatting", () => {
  it("uses the percentage when the server reported a size", () => {
    expect(
      formatProgress({ downloaded: 5 * 1024 * 1024, total: 10 * 1024 * 1024, percent: 50 }),
    ).toBe("50% · 5.0 MB de 10.0 MB");
  });

  it("falls back to the downloaded amount when the size is unknown", () => {
    expect(formatProgress({ downloaded: 2 * 1024 * 1024, total: null, percent: null })).toBe(
      "2.0 MB descargados",
    );
  });

  it("formats small and empty sizes sensibly", () => {
    expect(formatBytes(0)).toBe("0 MB");
    expect(formatBytes(-1)).toBe("0 MB");
    expect(formatBytes(2048)).toBe("2 KB");
  });
});

describe("degradation outside the desktop app", () => {
  it("does not claim to be running under Tauri in a plain browser", () => {
    expect(isTauri()).toBe(false);
  });

  it("reports 'not configured' instead of falsely reporting up to date", async () => {
    const state = await readUpdaterState();
    expect(state.supported).toBe(false);
    expect(state.lastCheck?.kind).toBe("not_configured");
  });

  it("a manual check never throws and never claims the app is up to date", async () => {
    const outcome: CheckOutcome = await checkForUpdates();
    expect(outcome.kind).toBe("not_configured");
  });

  it("installing is refused with an explanation rather than throwing", async () => {
    const res = await installUpdate();
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/escritorio/i);
  });
});

/**
 * The updater provider resolves its state asynchronously on mount; flushing the
 * microtask queue inside `act` keeps those updates inside React's test scope.
 */
async function renderApp(path: string) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App session={sessionFor()} />
    </MemoryRouter>,
  );
  await act(async () => {});
  return utils;
}

describe("Configuración → Actualizaciones", () => {
  it("renders the updates panel with a manual check control", async () => {
    await renderApp("/settings");
    expect(await screen.findByRole("heading", { name: "Configuración" })).toBeInTheDocument();
    expect(screen.getByText("Actualizaciones automáticas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buscar actualizaciones" })).toBeInTheDocument();
  });

  it("offers no install button when there is no update available", async () => {
    await renderApp("/settings");
    await screen.findByText("Actualizaciones automáticas");
    const content = document.querySelector(".content") as HTMLElement;
    expect(within(content).queryByRole("button", { name: /Instalar/i })).toBeNull();
  });

  it("shows no update badge in the topbar when there is nothing to install", async () => {
    await renderApp("/");
    await screen.findByRole("heading", { name: "Resumen" });
    expect(document.querySelector(".topbar__update")).toBeNull();
  });
});
