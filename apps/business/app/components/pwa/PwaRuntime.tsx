import { useEffect, useState } from "react";

/**
 * Client-only PWA runtime (Bloque 10/11). Three honest, non-intrusive jobs:
 *
 *  1. Register the service worker — ONLY in a top-level window. Inside the Shopify
 *     Admin iframe (`window.self !== window.top`) we skip registration entirely so
 *     the embedded app is never affected.
 *  2. Show a small "offline" banner driven by real connectivity events. It does not
 *     fake success — it just tells the user actions may be unavailable.
 *  3. Offer an install affordance when the browser reports the app is installable
 *     (Android/desktop `beforeinstallprompt`), with a manual iOS instruction, and
 *     stay silent once already installed (standalone display mode).
 *
 * Renders nothing during SSR; all logic runs in effects so hydration is stable.
 */

const IOS_TIP_DISMISSED = "eventra.pwa.iosTipDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin frame access throws → treat as embedded
  }
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaRuntime() {
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);

  // 1. Service-worker registration (top-level window only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isEmbedded()) return; // never register inside the Shopify iframe
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; app works without it */
      });
    };
    window.addEventListener("load", onLoad);
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

  // 3. Install availability.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isEmbedded() || isStandalone()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // iOS never fires beforeinstallprompt — offer a manual tip once.
    if (isIos() && localStorage.getItem(IOS_TIP_DISMISSED) !== "1") {
      setShowIosTip(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const dismissIosTip = () => {
    setShowIosTip(false);
    try {
      localStorage.setItem(IOS_TIP_DISMISSED, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {!online ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
        >
          <span aria-hidden>⚠️</span>
          You&apos;re offline — changes can&apos;t be saved until you reconnect.
        </div>
      ) : null}

      {installEvent ? (
        <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg sm:left-auto sm:right-4">
          <span className="text-ink">Install Eventra for quick access on your device.</span>
          <span className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setInstallEvent(null)}
              aria-label="Dismiss"
              className="rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-2"
            >
              ✕
            </button>
          </span>
        </div>
      ) : null}

      {showIosTip ? (
        <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg">
          <span className="text-ink">
            To install: tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.
          </span>
          <button
            type="button"
            onClick={dismissIosTip}
            aria-label="Dismiss"
            className="rounded-lg px-2 py-1.5 text-ink-muted hover:bg-surface-2"
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
