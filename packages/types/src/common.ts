/** Cross-domain primitives. */
export type ISODate = string; // yyyy-MM-dd
export type ISODateTime = string; // full ISO timestamp
export type EnvironmentName = "local" | "test" | "development" | "staging" | "production";

/** Attached to auditable records/actions (who/when). */
export interface AuditMetadata {
  actorId: string;
  actorType: "consumer" | "org_member" | "admin" | "service";
  at: ISODateTime;
  ip?: string;
}
