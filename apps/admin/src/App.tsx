import { Route, Routes } from "react-router";
import { isAdminPrincipal, PLATFORM_ROLES } from "@eventra/identity";
import type { Principal } from "@eventra/types";
import { Shell } from "./os/Shell";
import { HomePage } from "./os/home";
import { CalendarPage } from "./os/calendar";
import {
  MembershipsPage, TemplatesPage, AudiencesPage, ChannelsPage, IntegrationsPage,
  AutomationsPage, TeamsPage, GeneralPage, ModulePlaceholder, MOCK_PLATFORM_ROLE,
} from "./os/pages";
import { SourcesPage, CountriesPage } from "./os/branches";
import { MetricsOverviewPage, MobileMetricsPage, BusinessMetricsPage, ComparePage, RoiPage } from "./os/metrics";
import {
  PublicationsPage, CompaniesPage, UsersPage, AlertsPage, ParametersPage,
  BusinessOpsPage, MobileOpsPage, AiModelsPage, ReleasesPage, AuditPage, HealthPage,
} from "./os/control";

/**
 * Eventra Internal OS (Nivel A) — platform control centre. SEPARATE from the
 * Business app (Nivel B) and Personal app (Nivel C). Access requires an admin
 * principal with a platform role; the boundary is mocked here (no live privileged
 * access, no real mutations). Brian = platform_owner.
 */
const MOCK_PLATFORM_PRINCIPAL: Principal = {
  userId: "brian_platform_owner",
  type: "admin",
  permissions: ["platform:*"],
};

export function App() {
  const authorized =
    isAdminPrincipal(MOCK_PLATFORM_PRINCIPAL) && PLATFORM_ROLES.includes(MOCK_PLATFORM_ROLE);

  if (!authorized) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>403 — Internal OS</h1>
        <p>Esta consola requiere un administrador de plataforma de Eventra.</p>
      </div>
    );
  }

  return (
    <Shell principalName="Brian Almeida" principalRole="Owner" workspace="Eventra Platform">
      <Routes>
        {/* ── General ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        {/* ── Métricas ── */}
        <Route path="/metrics" element={<MetricsOverviewPage />} />
        <Route path="/metrics/mobile" element={<MobileMetricsPage />} />
        <Route path="/metrics/business" element={<BusinessMetricsPage />} />
        <Route path="/metrics/compare" element={<ComparePage />} />
        <Route path="/metrics/roi" element={<RoiPage />} />
        {/* ── Datos y configuración ── */}
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/parameters" element={<ParametersPage />} />
        <Route path="/plans" element={<MembershipsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/audiences" element={<AudiencesPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        {/* ── Operaciones de producto ── */}
        <Route path="/business" element={<BusinessOpsPage />} />
        <Route path="/mobile" element={<MobileOpsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/ai" element={<AiModelsPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
        {/* ── Control ── */}
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/settings" element={<GeneralPage />} />
        <Route path="*" element={<ModulePlaceholder title="No encontrado" note="Ruta desconocida." />} />
      </Routes>
    </Shell>
  );
}
