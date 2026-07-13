/**
 * Four-year horizon expansion (Phase 7, Bloque 7). Expands a recurring offer into
 * dated yearly occurrences WITHOUT persisting redundant rows — the engine computes
 * them from the anchor date + recurrence. Crucially, it never presents a projected
 * future date as confirmed: only the anchor year keeps the offer's own certainty;
 * generated future years are `historical_projection`.
 */
import type { Offer, OfferOccurrence, DateCertainty } from "./types";

export const DEFAULT_HORIZON_YEARS = 4;

function isoOfYear(dateISO: string, year: number): string {
  // Preserve month/day, swap the year. Guards against invalid input.
  const [, mm, dd] = dateISO.split("-");
  const m = mm ?? "01";
  const d = dd ?? "01";
  return `${year}-${m}-${d}`;
}

/**
 * Occurrences for an offer from `fromYear` through `fromYear + horizonYears`.
 * A non-recurring offer yields at most its single anchor occurrence (if in range).
 */
export function expandOccurrences(
  offer: Offer,
  opts: { fromYear?: number; horizonYears?: number } = {},
): OfferOccurrence[] {
  const anchorYear = Number(offer.startDate.slice(0, 4));
  if (!Number.isFinite(anchorYear)) return [];
  const fromYear = opts.fromYear ?? new Date().getFullYear();
  const horizon = opts.horizonYears ?? DEFAULT_HORIZON_YEARS;
  const lastYear = fromYear + horizon;

  if (!offer.recurring) {
    if (anchorYear < fromYear || anchorYear > lastYear) return [];
    return [{ offerId: offer.id, year: anchorYear, date: offer.startDate, certainty: offer.certainty }];
  }

  const out: OfferOccurrence[] = [];
  for (let year = fromYear; year <= lastYear; year++) {
    const isAnchorYear = year === anchorYear;
    const certainty: DateCertainty = isAnchorYear ? offer.certainty : "historical_projection";
    out.push({
      offerId: offer.id,
      year,
      date: isAnchorYear ? offer.startDate : isoOfYear(offer.startDate, year),
      certainty,
    });
  }
  return out;
}

/** Count how many occurrences in a set are safe to advertise (confirmed only). */
export function confirmedCount(occurrences: OfferOccurrence[]): number {
  return occurrences.filter((o) => o.certainty === "confirmed").length;
}
