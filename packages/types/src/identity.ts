/** Identity & tenancy — principals, organizations, workspaces, roles. */

export type UserId = string;
export type OrganizationId = string;
export type WorkspaceId = string;
export type ConsumerProfileId = string;

/** The distinct authenticated principal kinds on the platform. */
export type PrincipalType =
  | "consumer"
  | "org_member"
  | "advertiser"
  | "admin"
  | "service";

export interface User {
  id: UserId;
  email: string;
  name?: string;
}

/** A principal is a (user, kind) authorization context — never merged across kinds. */
export interface Principal {
  userId: UserId;
  type: PrincipalType;
  /** org/workspace/consumer scope resolved server-side (never from the client). */
  organizationId?: OrganizationId;
  workspaceIds?: WorkspaceId[];
  consumerProfileId?: ConsumerProfileId;
  roles?: string[];
  permissions?: string[];
}

export type MembershipRole = "owner" | "admin" | "editor" | "viewer";

export interface Organization {
  id: OrganizationId;
  name: string;
  ownerUserId: UserId;
  status: "active" | "suspended" | "archived";
}

/** A managed business/store planning environment inside an org. NOT a commerce store. */
export interface Workspace {
  id: WorkspaceId;
  organizationId: OrganizationId;
  name: string;
  status: "active" | "read_only" | "archived";
}

export interface Membership {
  userId: UserId;
  organizationId: OrganizationId;
  role: MembershipRole;
}

export interface Role {
  name: string;
  scope: "org" | "admin";
  permissions: string[];
}

export interface Permission {
  key: string;
  description: string;
}

/** External commerce store/site linked to a workspace (Shopify/Woo/…). Distinct from Workspace. */
export type CommercePlatform =
  | "shopify"
  | "woocommerce"
  | "wix"
  | "squarespace"
  | "custom"
  | "none";

export interface CommerceConnection {
  workspaceId: WorkspaceId;
  platform: CommercePlatform;
  externalRef?: string;
  health?: "connected" | "degraded" | "disconnected";
}
