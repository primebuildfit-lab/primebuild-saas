import { useState } from "react";
import { PRODUCTS, defaultCountry } from "@eventra/config";
import { HomeScreen } from "./screens/Home";
import { OffersScreen } from "./screens/Offers";
import { AlertsScreen } from "./screens/Alerts";
import { ProfileScreen } from "./screens/Profile";
import { IconButton } from "./ui";
import { useUpdateState } from "./UpdatePanel";
import { isUpdateAvailable } from "./updater";
import {
  IconHome,
  IconTag,
  IconBell,
  IconUser,
  IconSearch,
  type IconProps,
} from "./ui/icons";

/**
 * Eventra Mobile — app frame.
 *
 * Same navigation architecture as before (a top bar, a screen, a 4-item bottom
 * tab bar) — deep links, tab ids and structure are unchanged. What changed is the
 * look: a premium dark command-center system shared with the Internal OS, and the
 * first tab is now a full "Inicio" home (the calendar lives inside it) instead of
 * a bare calendar. Screens are honest — preview content is always labeled.
 */

interface Tab {
  id: "home" | "offers" | "alerts" | "profile";
  label: string;
  icon: (p: IconProps) => JSX.Element;
  render: () => JSX.Element;
}

const TABS: Tab[] = [
  { id: "home", label: "Inicio", icon: IconHome, render: () => <HomeScreen /> },
  { id: "offers", label: "Ofertas", icon: IconTag, render: () => <OffersScreen /> },
  { id: "alerts", label: "Alertas", icon: IconBell, render: () => <AlertsScreen /> },
  { id: "profile", label: "Cuenta", icon: IconUser, render: () => <ProfileScreen /> },
];

export function App() {
  const [tab, setTab] = useState<Tab["id"]>("home");
  const active = TABS.find((t) => t.id === tab)!;
  // Market + display language come from the shared platform catalog (ORDER §6),
  // never hardcoded here — the same source of truth Business and the Internal OS use.
  const market = defaultCountry();
  // A newer signed version being available is surfaced on the "Cuenta" tab, so
  // the user notices it without having to go looking. Always false on web/PWA.
  const update = useUpdateState();
  const updateReady = update !== null && isUpdateAvailable(update);

  return (
    <div className="em-app">
      <div className="em-frame">
        {/* Top bar */}
        <header className="em-topbar">
          <span className="em-brand-mark" aria-hidden>e</span>
          <span className="em-brand-name">{PRODUCTS.consumer.name}</span>
          <span className="em-topbar-spacer" />
          <IconButton label="Buscar" plain><IconSearch size={20} /></IconButton>
          <span className="em-market" title={`Idioma: ${market.primaryLocale.label}`}>
            {market.flag} {market.nameEs}
          </span>
        </header>

        {/* Screen */}
        <main className="em-main">{active.render()}</main>

        {/* Bottom tab bar */}
        <nav className="em-bottomnav" aria-label="Navegación" style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}>
          {TABS.map((t) => {
            const on = t.id === tab;
            const Icon = t.icon;
            const badge = updateReady && t.id === "profile";
            return (
              <button
                key={t.id}
                type="button"
                className={on ? "em-tab active" : "em-tab"}
                onClick={() => setTab(t.id)}
                aria-current={on ? "page" : undefined}
                aria-label={badge ? `${t.label} — actualización disponible` : undefined}
              >
                <span className="em-tab-icon" style={badge ? { position: "relative" } : undefined}>
                  <Icon size={22} />
                  {badge ? <span className="em-dot" aria-hidden /> : null}
                </span>
                <span className="em-tab-label">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
