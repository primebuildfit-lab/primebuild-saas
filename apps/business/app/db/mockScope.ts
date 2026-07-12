import type { TenantScope } from "~/types/domain";
import { DEMO_STORE_ID, DEMO_USER_ID } from "~/data";

/**
 * The fixed tenant scope used by `mock`/`file` persistence modes and by tests.
 * Its `workspaceId` equals the demo façade `storeId` so seeded demo data lines up
 * with the existing mock (`demoStore.id`). Pure — no server/secret imports.
 */
export const DEMO_ORG_ID = "org_demo";

export const DEMO_TENANT_SCOPE: TenantScope = {
  userId: DEMO_USER_ID,
  organizationId: DEMO_ORG_ID,
  organizationName: "Demo Store",
  workspaceId: DEMO_STORE_ID,
  role: "owner",
};
