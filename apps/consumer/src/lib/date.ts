/**
 * Eventra Mobile — tiny presentation-only date helpers (Spanish labels).
 * No date math beyond parsing an ISO day; the calendar engine owns real logic.
 */
const MONTHS_ES_SHORT = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MONTHS_ES_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const WEEKDAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isoDay(iso: string): string {
  return String(parseISO(iso).getDate());
}
export function isoMonthShort(iso: string): string {
  return MONTHS_ES_SHORT[parseISO(iso).getMonth()] ?? "";
}
/** e.g. "viernes, 24 de julio". */
export function isoLongEs(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS_ES[d.getDay()]}, ${d.getDate()} de ${MONTHS_ES_LONG[d.getMonth()]}`;
}
