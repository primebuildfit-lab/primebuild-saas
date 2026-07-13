# Eventra Internal OS — Admin Security (`PLATFORM_ADMIN_SECURITY.md`)

> Phase 7, Bloque 26. How the private platform console is protected.

## Strict level separation

- **Nivel A (Internal OS)** access requires an **admin principal** + a **platform role**. A business/consumer
  tenant role can NEVER grant a platform permission — the two matrices are disjoint (proved by a test:
  `platformPermissionsForRole("owner")` is empty).
- Business users have zero access to A. The Internal OS runs on a separate app (`apps/admin`) / separate
  routes / separate auth resolution.

## Platform roles (`@eventra/identity`)

| Role | Can |
|------|-----|
| `platform_owner` (Brian) | everything, incl. ownership transfer + platform-admin management |
| `platform_admin` | everything except owner-only |
| `operations` | curate offers/sources, verify, run jobs, manage integrations + AI |
| `support` | read all + company notes + **impersonate (audited)** |
| `analyst` | read all (analytics) |
| `read_only` | read all, no writes |

Permission keys: `platform:{companies,users,offers,sources,jobs,analytics,commissions,integrations,ai,audit,
billing,settings}:{read|write|verify|run|manage}`, plus `platform:impersonate` and `platform:owner`.

## Enforcement (defense in depth)

1. **Deny-by-default** `platformCan(role, permission)` — unknown role/permission → false.
2. **Server-resolved identity** — the platform role comes from a verified session + the `platform_admins`
   table, never from a client value.
3. **RLS** (`supabase/policies/0005_internal_os_rls.sql`) — `is_platform_admin()` / `has_platform_role()`
   gate every Internal-OS table; reads require any admin, writes require `operations`+, commissions/settings
   require `platform_admin`+, `platform_admins` changes require `platform_owner`. Service role (jobs) bypasses.
4. **UI hiding is convenience only** — buttons are gated but the real gate is server + RLS.

## Sensitive actions

- **Impersonation** (support/admin): controlled, time-boxed, and **audited** (actor + target + reason).
- **Exports**: logged.
- **Reauthentication** required for high-risk actions (destructive/ownership) — designed; wired with real auth.
- **Rate limiting** on admin mutations — designed.
- **Logs** carry request-id + actor, never secrets/tokens (see `observability.server` pattern).

## Current status

Roles + matrix + separation test: **built & tested** (`@eventra/identity`, 23 tests). RLS: **written, not
provisioned**. Real admin auth provider, impersonation flow, and reauth are Brian-gated (need identity infra).
