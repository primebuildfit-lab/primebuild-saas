/**
 * Eventra platform commissions (Phase 7, Bloque 11). Eventra may charge a SMALL
 * commission — hard-clamped to **1%–2%** — on eligible automated operations. No
 * real charges here: this only MODELS the amount, transparently and auditably.
 * Actual billing stays off until Brian authorizes it (BILLING_TEST_MODE).
 */

export const COMMISSION_MIN_RATE = 0.01; // 1%
export const COMMISSION_MAX_RATE = 0.02; // 2%

export type CommissionOperation =
  | "automated_offer"
  | "recurring_campaign"
  | "premium_automation";

export type CommissionStatus = "modeled" | "pending" | "applied" | "reversed";

export interface CommissionRule {
  id: string;
  operation: CommissionOperation;
  /** stored rate; always clamped into [1%, 2%] on read via {@link clampRate} */
  rate: number;
  currency: string;
  enabled: boolean;
}

export interface CommissionRecord {
  id: string;
  ruleId: string;
  organizationId: string;
  operation: CommissionOperation;
  /** the monetary base the commission is computed on (minor units, e.g. cents) */
  baseAmount: number;
  rate: number;
  amount: number; // minor units
  currency: string;
  status: CommissionStatus;
  createdAt: string; // ISO
  isDev?: boolean;
}

/** Clamp any configured rate into the authorized 1%–2% band (never outside). */
export function clampRate(rate: number): number {
  if (Number.isNaN(rate)) return COMMISSION_MIN_RATE;
  return Math.min(COMMISSION_MAX_RATE, Math.max(COMMISSION_MIN_RATE, rate));
}

export function isRateAuthorized(rate: number): boolean {
  return rate >= COMMISSION_MIN_RATE && rate <= COMMISSION_MAX_RATE;
}

/**
 * Model a commission amount (minor units, rounded). The rate is clamped so an
 * out-of-band configuration can never produce an unauthorized charge. Returns 0
 * for a non-positive base.
 */
export function computeCommission(baseAmountMinor: number, rate: number): number {
  if (!(baseAmountMinor > 0)) return 0;
  return Math.round(baseAmountMinor * clampRate(rate));
}

/** Build a fully-modeled (not charged) commission record. */
export function modelCommission(input: {
  id: string;
  ruleId: string;
  organizationId: string;
  operation: CommissionOperation;
  baseAmount: number;
  rate: number;
  currency: string;
  at?: string;
  isDev?: boolean;
}): CommissionRecord {
  const rate = clampRate(input.rate);
  return {
    id: input.id,
    ruleId: input.ruleId,
    organizationId: input.organizationId,
    operation: input.operation,
    baseAmount: input.baseAmount,
    rate,
    amount: computeCommission(input.baseAmount, rate),
    currency: input.currency,
    status: "modeled", // never "applied" without authorized billing
    createdAt: input.at ?? new Date().toISOString(),
    isDev: input.isDev,
  };
}
