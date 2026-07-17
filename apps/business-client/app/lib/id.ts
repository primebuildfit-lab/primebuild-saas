/**
 * Client-side id generator for mock records (Phase 2–4). In Phase 5 ids come from
 * the database (uuid). Only ever called from event handlers, never during render,
 * so it does not affect SSR hydration.
 */
export function createId(prefix: string): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}
