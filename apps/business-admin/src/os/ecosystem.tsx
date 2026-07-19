/**
 * Business Admin — ecosystem menu (topbar). Controlled cross-app navigation for the
 * INTERNAL operator only:
 *   • Volver a Eventra Internal OS   (desktop app, deep link)
 *   • Abrir Eventra Business Client  (web, HTTPS + allow-listed host)
 *   • Abrir Eventra Mobile           (desktop app, deep link — operator diagnosis)
 *   • Soporte                        (official help site, HTTPS)
 *
 * No platform-admin surfaces are exposed to client companies here; this menu lives in
 * the internal monitoring console. Every destination comes from @eventra/config and is
 * validated; a missing/blocked destination produces a controlled message, never a crash.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { Pill } from "./ui";
import { openExternal } from "./openExternal";
import {
  LAUNCHER_APPS, launchTauriApp, openBusinessClient, probeInstalled,
  APP_INSTALL_STATE_LABEL, type AppInstallState,
} from "./launchApp";
import type { EventraTauriApp } from "@eventra/config";

const SUPPORT_URL = "https://help.eventra.app";

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return ref;
}

function TauriRow({ app }: { app: EventraTauriApp }) {
  const [state, setState] = useState<AppInstallState>("unknown");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { void (async () => setState(await probeInstalled(app)))(); }, [app]);

  const open = async () => {
    setMsg(null);
    const r = await launchTauriApp(app, "");
    if (r.state) setState(r.state);
    if (!r.ok) setMsg(r.message ?? "No se pudo abrir.");
  };

  const tone = state === "installed" ? "success" : state === "not_installed" ? "danger" : "neutral";
  return (
    <button className="ecosystem-item" onClick={open}>
      <span>{app.productName}</span>
      <Pill tone={tone}>{APP_INSTALL_STATE_LABEL[state]}</Pill>
      {msg ? <small style={{ color: "var(--danger, #d33)", flexBasis: "100%" }}>{msg}</small> : null}
    </button>
  );
}

export function EcosystemMenu() {
  const [open, setOpen] = useState(false);
  const [clientMsg, setClientMsg] = useState<string | null>(null);
  const ref = useOutsideClose(useCallback(() => setOpen(false), []));

  const openClient = async () => {
    setClientMsg(null);
    const r = await openBusinessClient();
    if (!r.ok) setClientMsg(r.message ?? "No configurada.");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="topbar__env" style={{ cursor: "pointer" }} onClick={() => setOpen((o) => !o)}
        title="Abrir otras apps del ecosistema Eventra">
        Ecosistema ▾
      </button>
      {open ? (
        <div className="ecosystem-menu" role="menu">
          <div className="ecosystem-menu__label">Apps de escritorio</div>
          <TauriRow app={LAUNCHER_APPS.internalOs} />
          <TauriRow app={LAUNCHER_APPS.mobile} />
          <div className="ecosystem-menu__label">Web</div>
          <button className="ecosystem-item" onClick={openClient}>
            <span>{LAUNCHER_APPS.businessClient.productName}</span>
            <Pill tone="neutral">Web</Pill>
            {clientMsg ? <small style={{ color: "var(--danger, #d33)", flexBasis: "100%" }}>{clientMsg}</small> : null}
          </button>
          <button className="ecosystem-item" onClick={() => void openExternal(SUPPORT_URL)}>
            <span>Soporte</span>
            <Pill tone="neutral">Ayuda</Pill>
          </button>
        </div>
      ) : null}
    </div>
  );
}
