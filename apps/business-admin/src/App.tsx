/**
 * Eventra Business Admin — internal monitoring console (Tauri-packaged SPA).
 *
 * Access requires an internal OPERATOR (platform role); the console never lets an
 * operator act as a client company. Every route is gated by a `business.*`
 * permission via `businessAdminCan` (deny-by-default). No commercial creation flows.
 */
import { Navigate, Route, Routes } from "react-router";
import { businessAdminCan, BUSINESS_ADMIN_PERMISSIONS as BA } from "@eventra/identity";
import { SessionProvider, useSession, type OperatorSession } from "./os/session";
import { Shell } from "./os/Shell";
import {
  OverviewPage, CompaniesPage, StoresPage, MembersPage, OrdersPage, SalesPage,
  MarketingPage, MarketingResultsPage, SubscriptionsPage, IntegrationsPage,
  AlertsPage, SupportPage, HealthPage, AuditPage, SettingsPage,
} from "./os/pages";
import { EmptyState } from "./os/ui";
import { UpdaterProvider } from "./os/updatesUi";

export function App({ session }: { session?: OperatorSession }) {
  return (
    <SessionProvider value={session}>
      <Guarded />
    </SessionProvider>
  );
}

/** Top-level access guard: an operator must at least hold `business.view`. */
function Guarded() {
  const { operator } = useSession();
  if (!businessAdminCan(operator.role, BA.view)) {
    return (
      <div className="center-screen">
        <div className="center-card">
          <EmptyState
            title="Acceso restringido"
            hint="Esta consola es solo para operadores internos de Eventra con permisos de plataforma. Tu rol no tiene acceso al panel administrativo de Business."
          />
        </div>
      </div>
    );
  }
  // One updater lifecycle for the whole window: the topbar indicator (inside
  // Shell) and the Configuración panel (a route) read the same state.
  return (
    <UpdaterProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Require perm={BA.view}><OverviewPage /></Require>} />

          <Route path="/companies" element={<Require perm={BA.companiesView}><CompaniesPage /></Require>} />
          <Route path="/stores" element={<Require perm={BA.storesView}><StoresPage /></Require>} />
          <Route path="/members" element={<Require perm={BA.companiesView}><MembersPage /></Require>} />

          <Route path="/orders" element={<Navigate to="/orders/live" replace />} />
          <Route path="/orders/live" element={<Require perm={BA.ordersView}><OrdersPage state="LIVE" /></Require>} />
          <Route path="/orders/completed" element={<Require perm={BA.ordersView}><OrdersPage state="COMPLETED" /></Require>} />
          <Route path="/orders/cancelled" element={<Require perm={BA.ordersView}><OrdersPage state="CANCELLED" /></Require>} />
          <Route path="/orders/refunds" element={<Require perm={BA.ordersView}><OrdersPage state="REFUNDED" /></Require>} />

          <Route path="/sales" element={<Require perm={BA.ordersView}><SalesPage /></Require>} />

          <Route path="/marketing" element={<Navigate to="/marketing/ads" replace />} />
          <Route path="/marketing/ads" element={<Require perm={BA.marketingView}><MarketingPage kind="advertisement" /></Require>} />
          <Route path="/marketing/campaigns" element={<Require perm={BA.marketingView}><MarketingPage kind="campaign" /></Require>} />
          <Route path="/marketing/offers" element={<Require perm={BA.marketingView}><MarketingPage kind="offer" /></Require>} />
          <Route path="/marketing/content" element={<Require perm={BA.marketingView}><MarketingPage kind="content" /></Require>} />
          <Route path="/marketing/results" element={<Require perm={BA.marketingView}><MarketingResultsPage /></Require>} />

          <Route path="/subscriptions" element={<Require perm={BA.subscriptionsView}><SubscriptionsPage /></Require>} />
          <Route path="/integrations" element={<Require perm={BA.integrationsView}><IntegrationsPage /></Require>} />
          <Route path="/alerts" element={<Require perm={BA.alertsView}><AlertsPage /></Require>} />
          <Route path="/support" element={<Require perm={BA.view}><SupportPage /></Require>} />
          <Route path="/health" element={<Require perm={BA.view}><HealthPage /></Require>} />
          <Route path="/audit" element={<Require perm={BA.auditView}><AuditPage /></Require>} />
          <Route path="/settings" element={<Require perm={BA.view}><SettingsPage /></Require>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </UpdaterProvider>
  );
}

/** Per-route permission gate. Deny-by-default: no permission ⇒ honest access notice. */
function Require({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { operator } = useSession();
  if (!businessAdminCan(operator.role, perm)) {
    return <EmptyState title="Sin permiso" hint="Tu rol de operador no incluye el permiso necesario para ver esta sección." />;
  }
  return <>{children}</>;
}
