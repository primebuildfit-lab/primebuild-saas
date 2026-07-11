/** Formatting helpers shared across surfaces. */

/** Plan price → "Free" or "$20/mo". */
export function formatPrice(priceMonthly: number): string {
  return priceMonthly === 0 ? "Free" : `$${priceMonthly}/mo`;
}

/** null → "Unlimited", otherwise the number as a string. */
export function formatLimitValue(limit: number | null): string {
  return limit === null ? "Unlimited" : String(limit);
}

/** Title-case a snake_case category, e.g. "major_sales" → "Major Sales". */
export function humanizeCategory(category: string): string {
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Compact possessive-free label for a country list, e.g. "US, CA". */
export function joinCodes(codes: string[]): string {
  return codes.join(", ");
}
