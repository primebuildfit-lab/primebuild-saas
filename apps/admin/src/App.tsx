import { Route, Routes } from "react-router";
import { isAdminPrincipal, PLATFORM_ROLES } from "@eventra/identity";
import type { Principal } from "@eventra/types";
import { Shell } from "./os/Shell";
import {
  HomePage, GlobalCalendarPage, OffersPage, SourcesPage, CompaniesPage, UsersPage,
  CommissionsPage, JobsPage, AnalyticsPage, AiPage, ModulePlaceholder, MOCK_PLATFORM_ROLE,
} from "./os/pages";

/**
 * Eventra Internal OS (Phase 7, Nivel A). Platform-admin console — SEPARATE from
 * the Business app (Nivel B) and the Personal app (Nivel C). Access requires an
 * admin principal with a platform role; here that boundary is mocked (no live
 * privileged access, no real mutations). Brian = platform_owner.
 */
const MOCK_PLATFORM_PRINCIPAL: Principal = {
  userId: "brian_platform_owner",
  type: "admin",
  permissions: ["platform:*"],
};

export function App() {
  // Deny-by-default gate: the Internal OS renders only for an admin principal with
  // a recognized platform role. (Mock — a real gate resolves this server-side.)
  const authorized =
    isAdminPrincipal(MOCK_PLATFORM_PRINCIPAL) && PLATFORM_ROLES.includes(MOCK_PLATFORM_ROLE);

  if (!authorized) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>403 — Internal OS</h1>
        <p>This console requires an Eventra platform administrator.</p>
      </div>
    );
  }

  const scaffold = (title: string, note: string) => <ModulePlaceholder title={title} note={note} />;

  return (
    <Shell principalLabel="Brian · Platform Owner (mock)">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<GlobalCalendarPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/cancellations" element={scaffold("Cancellations", "Change/cancellation review queue backed by the detection engine (engine + tests exist; UI queue pending).")} />
        <Route path="/campaigns" element={scaffold("Campaigns", "Per-company private campaigns (Nivel B owns creation; this is the platform read view).")} />
        <Route path="/content" element={scaffold("Content", "Client-facing offer presentation builder + versions.")} />
        <Route path="/templates" element={scaffold("Templates", "Reusable structures for campaigns/offers/content with consent controls.")} />
        <Route path="/media" element={scaffold("Media", "Locations/context + media assets (metadata; large files off Postgres).")} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/audiences" element={scaffold("Audiences", "Business vs personal audience comparison — kept strictly separate.")} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/plans" element={scaffold("Plans & Membership", "Plan/entitlement configuration — canonical source is @eventra/config.")} />
        <Route path="/commissions" element={<CommissionsPage />} />
        <Route path="/integrations" element={scaffold("Integrations", "External connections (Shopify/Google/Meta/…). Adapters + PLANNED states, no live keys.")} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/countries" element={scaffold("Countries & Regions", "Platform catalog of countries/regions.")} />
        <Route path="/health" element={scaffold("System Health", "Services/queues/incidents. Business /healthz + /readyz already exist.")} />
        <Route path="/logs" element={scaffold("Logs", "Structured platform logs (request-id correlated).")} />
        <Route path="/audit" element={scaffold("Audit", "Every admin write, logged with actor/before/after.")} />
        <Route path="/settings" element={scaffold("Settings", "Platform/offers/AI/commissions/plans/security/data/system settings.")} />
        <Route path="*" element={scaffold("Not found", "Unknown route.")} />
      </Routes>
    </Shell>
  );
}
