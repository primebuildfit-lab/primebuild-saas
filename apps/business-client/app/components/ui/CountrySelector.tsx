import { Globe } from "lucide-react";
import { useData } from "~/context/DataContext";
import { getCountry } from "~/data";

/**
 * The primary scope control. Choosing a country narrows the surface to that
 * market (default: all enabled countries). Real data only — options come from
 * the store's enabled countries.
 */
export function CountrySelector({
  value,
  onChange,
  className,
}: {
  /** country code, or "" for all enabled countries */
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  const { enabledCountryCodes } = useData();
  return (
    <label className={className}>
      <span className="sr-only">Country scope</span>
      <span className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5">
        <Globe className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          aria-label="Filter by country"
        >
          <option value="">All enabled countries</option>
          {enabledCountryCodes.map((c) => {
            const country = getCountry(c);
            return (
              <option key={c} value={c}>
                {country ? `${country.flag} ${country.name}` : c}
              </option>
            );
          })}
        </select>
      </span>
    </label>
  );
}
