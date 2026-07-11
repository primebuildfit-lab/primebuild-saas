import type { AccentColor } from "~/types/domain";

/**
 * Accent palettes. Tailwind v4 utilities like `bg-brand-600` resolve to
 * `var(--color-brand-600)` at runtime, so overriding these CSS variables on a
 * wrapper element re-tints every brand utility inside it — that's how the
 * Appearance accent setting works without a rebuild.
 */
type Scale = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

const palettes: Record<AccentColor, Scale> = {
  indigo: {
    "50": "#eef2ff", "100": "#e0e7ff", "200": "#c7d2fe", "300": "#a5b4fc",
    "400": "#818cf8", "500": "#6366f1", "600": "#4f46e5", "700": "#4338ca",
    "800": "#3730a3", "900": "#312e81",
  },
  blue: {
    "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd",
    "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8",
    "800": "#1e40af", "900": "#1e3a8a",
  },
  emerald: {
    "50": "#ecfdf5", "100": "#d1fae5", "200": "#a7f3d0", "300": "#6ee7b7",
    "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857",
    "800": "#065f46", "900": "#064e3b",
  },
  violet: {
    "50": "#f5f3ff", "100": "#ede9fe", "200": "#ddd6fe", "300": "#c4b5fd",
    "400": "#a78bfa", "500": "#8b5cf6", "600": "#7c3aed", "700": "#6d28d9",
    "800": "#5b21b6", "900": "#4c1d95",
  },
};

export const ACCENT_OPTIONS: { value: AccentColor; label: string; swatch: string }[] =
  [
    { value: "indigo", label: "Indigo", swatch: palettes.indigo["600"] },
    { value: "blue", label: "Blue", swatch: palettes.blue["600"] },
    { value: "emerald", label: "Emerald", swatch: palettes.emerald["600"] },
    { value: "violet", label: "Violet", swatch: palettes.violet["600"] },
  ];

/** CSS custom properties to spread onto a wrapper's `style` for the given accent. */
export function accentVars(accent: AccentColor = "indigo"): Record<string, string> {
  const scale = palettes[accent] ?? palettes.indigo;
  return Object.fromEntries(
    Object.entries(scale).map(([k, v]) => [`--color-brand-${k}`, v]),
  );
}
