import { useEffect, useState } from "react";

/**
 * Eventra Calendar (Consumer) — client-only PWA runtime.
 *
 * Three honest, non-intrusive jobs:
 *  1. Register the service worker (top-level window only) for offline shell + fast loads.
 *  2. Show a small "offline" banner driven by real connectivity events.
 *  3. Offer an install affordance when the browser reports the app is installable
 *     (Android/desktop `beforeinstallprompt`), plus a manual iOS tip, and stay silent
 *     once already installed (standalone display mode).
 *
 * Renders nothing during SSR; all logic runs in effects so hydration is stable.
 */

const IOS_TIP_DISMISSED = "eventra.consumer.iosTipDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

const bar: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
  fontSize: 13,
  boxShadow: "0 -1px 2px rgba(16,24,40,.08)",
};

export function PwaRuntime() {
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);

  // 1. Service-worker registration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* best-effort; app works without it */
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // 2. Connectivity.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  // 3. Install affordance.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS gives no beforeinstallprompt — show a one-time manual tip.
    if (isIos() && localStorage.getItem(IOS_TIP_DISMISSED) !== "1") {
      setShowIosTip(true);
    }

    const onInstalled = () => {
      setInstallEvent(null);
      setShowIosTip(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function doInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  function dismissIosTip() {
    localStorage.setItem(IOS_TIP_DISMISSED, "1");
    setShowIosTip(false);
  }

  return (
    <>
      {!online ? (
        <div style={{ ...bar, background: "#fef3c7", color: "#92400e" }} role="status">
          <span aria-hidden>⚠️</span>
          <span>You're offline — showing your last loaded calendar.</span>
        </div>
      ) : installEvent ? (
        <div style={{ ...bar, background: "var(--eventra-surface)", borderTop: "1px solid var(--eventra-border)" }}>
          <span style={{ flex: 1 }}>Install Eventra Calendar on your phone.</span>
          <button
            type="button"
            onClick={doInstall}
            style={{ height: 34, padding: "0 14px", borderRadius: 8, border: "none", background: "var(--eventra-brand-600)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Install
          </button>
        </div>
      ) : showIosTip ? (
        <div style={{ ...bar, background: "var(--eventra-surface)", borderTop: "1px solid var(--eventra-border)" }}>
          <span style={{ flex: 1 }}>
            To install: tap <b>Share</b> then <b>Add to Home Screen</b>.
          </span>
          <button
            type="button"
            onClick={dismissIosTip}
            style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid var(--eventra-border)", background: "transparent", color: "var(--eventra-text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Got it
          </button>
        </div>
      ) : null}
    </>
  );
}
