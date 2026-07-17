/**
 * Build/version identity for observability + the health endpoints (Bloque 13).
 * Server-only. Reads deploy-injected env with safe fallbacks so it never throws.
 */
export interface BuildInfo {
  version: string;
  commit: string;
  builtAt: string;
  env: string;
}

export function buildInfo(): BuildInfo {
  return {
    // Set by the host at build/deploy time; falls back to the package version.
    version: process.env.BUILD_VERSION || process.env.npm_package_version || "0.1.0",
    // Railway/GitHub inject a commit SHA under various names.
    commit:
      process.env.BUILD_COMMIT ||
      process.env.RAILWAY_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT ||
      "unknown",
    builtAt: process.env.BUILD_TIME || "unknown",
    env: process.env.NODE_ENV || "development",
  };
}
