/**
 * Minimal, dependency-free Liquid sanity checks for the Promotion Builder.
 *
 * This is NOT a full Liquid parser — it catches the mistakes that matter for a
 * marketing snippet: unbalanced tags/outputs and obviously unsafe content. It
 * never claims a snippet is "valid Shopify Liquid", only that it looks balanced
 * and safe to save/reuse.
 */
export interface LiquidCheck {
  ok: boolean;
  /** Blocking problems (unbalanced tags). */
  errors: string[];
  /** Non-blocking cautions (e.g. inline scripts). */
  warnings: string[];
}

export function validateLiquid(src: string): LiquidCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = src ?? "";

  const openTags = (text.match(/\{%/g) ?? []).length;
  const closeTags = (text.match(/%\}/g) ?? []).length;
  if (openTags !== closeTags) {
    errors.push(`Unbalanced tags: ${openTags} "{%" vs ${closeTags} "%}".`);
  }

  const openOut = (text.match(/\{\{/g) ?? []).length;
  const closeOut = (text.match(/\}\}/g) ?? []).length;
  if (openOut !== closeOut) {
    errors.push(`Unbalanced outputs: ${openOut} "{{" vs ${closeOut} "}}".`);
  }

  // Balanced block tags (if/for/unless/case/capture/comment/schema…).
  const BLOCKS = ["if", "for", "unless", "case", "capture", "comment", "schema", "form", "paginate"];
  for (const block of BLOCKS) {
    const opens = (text.match(new RegExp(`\\{%-?\\s*${block}\\b`, "g")) ?? []).length;
    const closes = (text.match(new RegExp(`\\{%-?\\s*end${block}\\b`, "g")) ?? []).length;
    if (opens !== closes) {
      errors.push(`Unclosed "${block}" block: ${opens} open, ${closes} "end${block}".`);
    }
  }

  if (/<script[\s>]/i.test(text)) {
    warnings.push("Contains an inline <script> — most Shopify surfaces strip or block it.");
  }
  if (/on\w+\s*=/.test(text)) {
    warnings.push("Contains an inline event handler (onclick=…) — usually blocked.");
  }

  return { ok: errors.length === 0, errors, warnings };
}
