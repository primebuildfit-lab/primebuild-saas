/**
 * Minimal, SAFE Liquid preview for the Estudio editor.
 *
 * This is NOT a Liquid engine. It resolves `{{ variable.path }}` interpolations
 * (with a few common string filters) against a sample context so an operator can
 * see roughly what a Liquid snippet will produce. Control-flow tags (`{% … %}`)
 * are intentionally left untouched — real rendering happens server-side in the
 * published app, never here. Crucially it performs NO code execution and NO eval:
 * it is pure string substitution, so an admin-authored snippet can never run in
 * the console.
 */

export interface LiquidContext {
  [key: string]: unknown;
}

/** A representative context so previews show real-looking values, clearly sample data. */
export const LIQUID_SAMPLE_CONTEXT: LiquidContext = {
  shop: { name: "PrimeBuild Fit", domain: "primebuildfit.com" },
  user: { first_name: "Carlos", plan: "Business Pro" },
  event: { title: "Black Friday", date: "2026-11-27" },
  today: "2026-07-14",
};

function resolvePath(ctx: LiquidContext, path: string): unknown {
  return path.split(".").reduce<unknown>((obj, key) => {
    if (obj != null && typeof obj === "object" && key in (obj as Record<string, unknown>)) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, ctx);
}

function applyFilter(value: string, filter: string): string {
  switch (filter) {
    case "upcase":
      return value.toUpperCase();
    case "downcase":
      return value.toLowerCase();
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1);
    default:
      return value;
  }
}

/**
 * Substitute `{{ path }}` and `{{ path | filter }}` tokens. Unresolved variables
 * are left verbatim (so the operator can see what's missing rather than a silent
 * blank). `{% … %}` tags are preserved unchanged.
 */
export function renderLiquidPreview(code: string, ctx: LiquidContext = LIQUID_SAMPLE_CONTEXT): string {
  return code.replace(
    /\{\{\s*([\w.]+)\s*(?:\|\s*(upcase|downcase|capitalize)\s*)?\}\}/g,
    (match, path: string, filter: string | undefined) => {
      const value = resolvePath(ctx, path);
      if (value === undefined || value === null) return match; // leave the token visible
      const str = String(value);
      return filter ? applyFilter(str, filter) : str;
    },
  );
}

/** Does the snippet use control-flow tags we deliberately don't evaluate here? */
export function hasLiquidTags(code: string): boolean {
  return /\{%[\s\S]*?%\}/.test(code);
}
