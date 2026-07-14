import { Route, Routes } from "react-router";
import { isAdminPrincipal, PLATFORM_ROLES } from "@eventra/identity";
import type { Principal } from "@eventra/types";
import { Shell } from "./os/Shell";
import { HomePage } from "./os/home";
import {
  CalendarPage, CampaignsPage, OffersPage, ContentPage, TasksPage, AnalyticsPage, AudiencesPage,
  TemplatesPage, MediaPage, IntegrationsPage, GeneralPage, MembershipsPage, TeamsPage, ChannelsPage,
  LabelsPage, AutomationsPage, BillingPage, ModulePlaceholder, MOCK_PLATFORM_ROLE,
} from "./os/pages";
import { StudioPage } from "./os/studio";

/**
 * Eventra Internal OS (Nivel A). Private platform-admin console — SEPARATE from
 * the Business app (Nivel B) and Personal app (Nivel C). Access requires an admin
 * principal with a platform role; here the boundary is mocked (no live privileged
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
    <Shell principalName="Brian Almeida" principalRole="Owner" workspace="Eventra Inc.">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/audiences" element={<AudiencesPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/general" element={<GeneralPage />} />
        <Route path="/memberships" element={<MembershipsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/labels" element={<LabelsPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="*" element={<ModulePlaceholder title="No encontrado" note="Ruta desconocida." />} />
      </Routes>
    </Shell>
  );
}
