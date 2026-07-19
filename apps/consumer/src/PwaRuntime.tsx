import { useEffect, useState } from "react";
import { IconButton } from "./ui";
import { IconWifiOff, IconDownload, IconShare } from "./ui/icons";

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
        <div className="em-banner em-banner-warn" role="status">
          <span className="em-banner-icon" style={{ color: "var(--em-warn)" }}><IconWifiOff size={18} /></span>
          <span className="em-banner-text">Estás sin conexión — mostrando lo último cargado.</span>
        </div>
      ) : installEvent ? (
        <div className="em-banner">
          <span className="em-banner-icon" style={{ color: "var(--em-brand-strong)" }}><IconDownload size={18} /></span>
          <span className="em-banner-text">Instala Eventra en tu teléfono.</span>
          <button type="button" className="em-btn em-btn-primary em-btn-sm" onClick={doInstall}>Instalar</button>
        </div>
      ) : showIosTip ? (
        <div className="em-banner">
          <span className="em-banner-icon" style={{ color: "var(--em-brand-strong)" }}><IconShare size={18} /></span>
          <span className="em-banner-text">
            Para instalar: toca <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.
          </span>
          <IconButton label="Entendido" plain onClick={dismissIosTip}>
            <span style={{ fontSize: 12.5, fontWeight: 700, padding: "0 4px" }}>OK</span>
          </IconButton>
        </div>
      ) : null}
    </>
  );
}
