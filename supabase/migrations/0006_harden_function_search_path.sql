-- Eventra — security hardening (Phase 8 activation). Pins the trigger function's
-- search_path (Supabase advisor 0011 function_search_path_mutable). Applied live to
-- the eventra project on 2026-07-13.
alter function public.set_updated_at() set search_path = public;

-- Note: the SECURITY DEFINER RLS-helper functions (is_org_member, is_workspace_member,
-- is_platform_admin, has_platform_role) remain EXECUTE-able by the authenticated role
-- ON PURPOSE — RLS policies invoke them during query evaluation in the caller's role,
-- so revoking EXECUTE would break RLS. They only return booleans about the CALLER's own
-- membership (auth.uid()); they leak no other tenant's data. Supabase advisors 0028/0029
-- flag them as informational; accepted + documented (docs/FINAL_CERTIFICATION_REPORT.md).