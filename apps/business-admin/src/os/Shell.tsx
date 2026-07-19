/**
 * Business Admin shell — sidebar + topbar. Deliberately has NO global commercial
 * "create" affordances (no + Anuncio / + Oferta / Promotion Builder): this is a
 * monitoring console, not the client app. Nav items are filtered by the operator's
 * effective business.* permissions.
 */
import { type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { businessAdminCan } from "@eventra/identity";
import { NAV } from "./nav";
import { useSession } from "./session";
import { EcosystemMenu } from "./ecosystem";
import { UpdateIndicator } from "./updatesUi";

function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { operator, connected } = useSession();
  const can = (perm: string) => businessAdminCan(operator.role, perm);

  const currentLeafLabel = (() => {
    for (const item of NAV) {
      if (item.children) {
        const c = item.children.find((ch) => isActive(location.pathname, ch.to));
        if (c) return `${item.label} · ${c.label}`;
      }
      if (isActive(location.pathname, item.to)) return item.label;
    }
    return "Resumen";
  })();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">E</div>
          <div>
            Business Admin
            <small>Consola interna · Eventra</small>
          </div>
        </div>
        <nav className="nav-section">
          {NAV.filter((item) => can(item.perm)).map((item) => {
            const Icon = item.icon;
            const active = isActive(location.pathname, item.to);
            return (
              <div key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-item${active ? " nav-item--active" : ""}`}
                  title={item.purpose}
                >
                  {Icon && <Icon size={18} />}
                  {item.label}
                </Link>
                {item.children && active && item.children.map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    className={`nav-item nav-item--child${isActive(location.pathname, c.to) ? " nav-item--active" : ""}`}
                    title={c.purpose}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__title">{currentLeafLabel}</div>
          <div className="topbar__spacer" />
          <UpdateIndicator />
          <EcosystemMenu />
          <span className="topbar__env" title="Sin backend de plataforma conectado">
            {connected ? "Conectado" : "Sin conexión de plataforma"}
          </span>
          <div className="topbar__user">
            <span>{operator.displayName}</span>
            <div className="topbar__avatar">{operator.displayName.slice(0, 1)}</div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
