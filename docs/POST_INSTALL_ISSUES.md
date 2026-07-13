# Eventra — Post-Install Issues (`POST_INSTALL_ISSUES.md`)

> Running log of problems found **during live certification** (after deploy + install). Empty until real
> validation runs. Add one row per issue; fix critical ones before declaring `EVENTRA V1 CERTIFIED`.

## Status: no live certification has run yet — no issues recorded.

| # | Area | Severity | Description | Repro | Fix / status |
|---|------|----------|-------------|-------|--------------|
| — | — | — | (none yet) | — | — |

## Severity guide
- **critical** — blocks install/use, data leakage, security, or charges → must fix before certification.
- **major** — significant but not blocking.
- **minor** — cosmetic / polish.

## Known pre-existing gaps (from local phases, not live issues)
- Playwright E2E harness not built (live flows depend on Shopify).
- Formal a11y/performance audits pending.
- Internal-OS live admin auth provider + real source connectors/scheduler not built.
- Real AI provider + Shopify Billing/real commissions off until authorized.
- Merchant-facing Business plan price/name flip (D71) — Brian decision.
