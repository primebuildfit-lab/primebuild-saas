import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { App } from "../src/App";
import { UpdatePanel } from "../src/UpdatePanel";
import { describe as describeState, formatBytes, type UpdateState } from "../src/updater";

/**
 * The updater surface is a pure view over the Rust state machine. These tests
 * fake the Tauri IPC boundary (the only thing the web layer touches) and assert
 * that each phase is reported honestly to the user.
 */

type Listener = (event: { payload: UpdateState }) => void;

let invoked: string[] = [];
let listeners: Listener[] = [];
let nextState: UpdateState;

/** Install a fake Tauri IPC surface, as the desktop shell would provide. */
function fakeTauri() {
  (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};
  vi.doMock("@tauri-apps/api/core", () => ({
    invoke: async (cmd: string) => {
      invoked.push(cmd);
      return nextState;
    },
  }));
  vi.doMock("@tauri-apps/api/event", () => ({
    listen: async (_name: string, cb: Listener) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
  }));
}

/** Push a state transition the way the Rust side emits it. */
function emit(state: UpdateState) {
  for (const l of listeners) l({ payload: state });
}

beforeEach(() => {
  invoked = [];
  listeners = [];
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.doUnmock("@tauri-apps/api/core");
  vi.doUnmock("@tauri-apps/api/event");
  delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
});

describe("updater copy", () => {
  it("states plainly when the app is already up to date", () => {
    const msg = describeState({ phase: "upToDate", current: "0.1.0" });
    expect(msg).toContain("al día");
    expect(msg).toContain("0.1.0");
  });

  it("names the new version when one is available", () => {
    const msg = describeState({
      phase: "available",
      current: "0.1.0",
      version: "0.2.0",
      notes: null,
      date: null,
    });
    expect(msg).toContain("0.2.0");
    expect(msg).toMatch(/nueva/i);
  });

  it("reports download progress with a percentage", () => {
    const msg = describeState({
      phase: "downloading",
      current: "0.1.0",
      version: "0.2.0",
      downloaded: 5_242_880,
      total: 10_485_760,
      percent: 50,
    });
    expect(msg).toContain("50%");
    expect(msg).toContain("5.0 MB");
  });

  it("falls back to a size-only line when the server sends no content length", () => {
    const msg = describeState({
      phase: "downloading",
      current: "0.1.0",
      version: "0.2.0",
      downloaded: 1024,
      total: null,
      percent: null,
    });
    expect(msg).not.toContain("%");
    expect(msg).toContain("1 KB");
  });

  it("surfaces the underlying error instead of a generic message", () => {
    const msg = describeState({
      phase: "failed",
      current: "0.1.0",
      message: "check failed: network unreachable",
    });
    expect(msg).toContain("network unreachable");
  });

  it("formats byte sizes", () => {
    expect(formatBytes(0)).toBe("0 MB");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("UpdatePanel outside the desktop shell", () => {
  it("renders nothing in the browser/PWA build", () => {
    const { container } = render(<UpdatePanel />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("UpdatePanel in the desktop shell", () => {
  it("reads state on mount and shows the up-to-date message", async () => {
    fakeTauri();
    nextState = { phase: "upToDate", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    render(<Panel />);

    await waitFor(() => expect(screen.getByText(/Estás al día/)).toBeInTheDocument());
    expect(invoked).toContain("updater_state");
    expect(screen.getByText("Al día")).toBeInTheDocument();
    expect(screen.getByText(/Versión 0\.1\.0/)).toBeInTheDocument();
    // No install action when there is nothing to install.
    expect(screen.queryByRole("button", { name: /instalar/i })).toBeNull();
  });

  it("hides itself when the build has no update channel configured", async () => {
    fakeTauri();
    nextState = { phase: "notConfigured", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    const { container } = render(<Panel />);
    await waitFor(() => expect(invoked).toContain("updater_state"));
    expect(container).toBeEmptyDOMElement();
  });

  it("offers a manual check and calls the native command", async () => {
    fakeTauri();
    nextState = { phase: "upToDate", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    render(<Panel />);
    await waitFor(() => expect(screen.getByText(/Estás al día/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /buscar actualizaciones/i }));
    await waitFor(() => expect(invoked).toContain("updater_check"));
  });

  it("announces a new version, its notes, and offers to install it", async () => {
    fakeTauri();
    nextState = { phase: "idle", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    render(<Panel />);
    await waitFor(() => expect(invoked).toContain("updater_state"));

    emit({
      phase: "available",
      current: "0.1.0",
      version: "0.2.0",
      notes: "Correcciones de estabilidad.",
      date: null,
    });

    await waitFor(() =>
      expect(screen.getByText(/versión nueva disponible: 0\.2\.0/i)).toBeInTheDocument(),
    );
    expect(screen.getByText("Correcciones de estabilidad.")).toBeInTheDocument();
    expect(screen.getByText("Nueva")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /descargar e instalar/i }));
    await waitFor(() => expect(invoked).toContain("updater_install"));
  });

  it("shows a determinate progress bar while downloading", async () => {
    fakeTauri();
    nextState = { phase: "idle", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    render(<Panel />);
    await waitFor(() => expect(invoked).toContain("updater_state"));

    emit({
      phase: "downloading",
      current: "0.1.0",
      version: "0.2.0",
      downloaded: 3_145_728,
      total: 4_194_304,
      percent: 75,
    });

    await waitFor(() => {
      const bar = screen.getByRole("progressbar", { name: /progreso de descarga/i });
      expect(bar).toHaveAttribute("aria-valuenow", "75");
    });
    // Actions are disabled while work is in flight.
    expect(screen.getByRole("button", { name: /buscar actualizaciones/i })).toBeDisabled();
  });

  it("reports a failed check without hiding the retry action", async () => {
    fakeTauri();
    nextState = { phase: "idle", current: "0.1.0" };
    const { UpdatePanel: Panel } = await import("../src/UpdatePanel");

    render(<Panel />);
    await waitFor(() => expect(invoked).toContain("updater_state"));

    emit({ phase: "failed", current: "0.1.0", message: "check failed: offline" });

    await waitFor(() => expect(screen.getByText(/offline/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /buscar actualizaciones/i })).toBeEnabled();
  });
});

describe("update badge on the tab bar", () => {
  it("is absent on web and present when an update is available", async () => {
    // Web build: no badge, tab keeps its plain label.
    render(<App />);
    expect(screen.getByRole("button", { name: "Cuenta" })).toBeInTheDocument();
    cleanup();

    fakeTauri();
    nextState = { phase: "idle", current: "0.1.0" };
    const { App: DesktopApp } = await import("../src/App");
    render(<DesktopApp />);
    await waitFor(() => expect(invoked).toContain("updater_state"));

    emit({
      phase: "available",
      current: "0.1.0",
      version: "0.2.0",
      notes: null,
      date: null,
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Cuenta — actualización disponible/i }),
      ).toBeInTheDocument(),
    );
  });
});
