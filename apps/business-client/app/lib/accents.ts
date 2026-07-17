import type { AccentColor } from "~/types/domain";

/**
 * Accent palettes — DARK-optimized (the Business app shares the Internal OS dark
 * identity). Tailwind v4 utilities like `bg-brand-600` resolve to
 * `var(--color-brand-600)`, so injecting these on a wrapper re-tints every brand
 * utility inside it — that's how the Appearance accent setting works, no rebuild.
 *
 * Ramp convention for dark surfaces:
 *   -50  subtle dark tint (chip backgrounds, e.g. active nav)
 *   -200 subtle ring / inset border
 *   -300 hover border
 *   -600 the SOLID accent (primary buttons)
 *   -700 a LIGHT shade for accent text on dark
 */
type Scale = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

const palettes: Record<AccentColor, Scale> = {
  // Violet — matches the Internal OS brand (#7C4DFF). Default.
  violet: {
    "50": "#191a33", "100": "#20213f", "200": "#322d63", "300": "#453a86",
    "400": "#6d5cf0", "500": "#8b62ff", "600": "#7c4dff", "700": "#a78bff",
    "800": "#c4b5fd", "900": "#14102b",
  },
  indigo: {
    "50": "#171932", "100": "#1d2044", "200": "#2b2f63", "300": "#3b3f86",
    "400": "#6366f1", "500": "#7f82f5", "600": "#6366f1", "700": "#a5b4fc",
    "800": "#c7d2fe", "900": "#131530",
  },
  blue: {
    "50": "#0e2036", "100": "#12294a", "200": "#1c3c66", "300": "#2a5691",
    "400": "#3b82f6", "500": "#60a5fa", "600": "#2563eb", "700": "#93c5fd",
    "800": "#bfdbfe", "900": "#0b1a30",
  },
  emerald: {
    "50": "#0c2a20", "100": "#0f3529", "200": "#16513c", "300": "#1e7a54",
    "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#6ee7b7",
    "800": "#a7f3d0", "900": "#0a2019",
  },
};

export const ACCENT_OPTIONS: { value: AccentColor; label: string; swatch: string }[] =
  [
    { value: "violet", label: "Violet", swatch: palettes.violet["600"] },
    { value: "indigo", label: "Indigo", swatch: palettes.indigo["600"] },
    { value: "blue", label: "Blue", swatch: palettes.blue["600"] },
    { value: "emerald", label: "Emerald", swatch: palettes.emerald["600"] },
  ];

/** CSS custom properties to spread onto a wrapper's `style` for the given accent. */
export function accentVars(accent: AccentColor = "violet"): Record<string, string> {
  const scale = palettes[accent] ?? palettes.violet;
  return Object.fromEntries(
    Object.entries(scale).map(([k, v]) => [`--color-brand-${k}`, v]),
  );
}
