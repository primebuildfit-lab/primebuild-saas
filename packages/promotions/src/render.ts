/**
 * Promo template renderer — turns a self-contained promo Liquid snippet into
 * preview HTML, SAFELY (pure string processing, no eval, no code execution).
 *
 * It supports exactly what the built-in promo templates use:
 *   - `{% assign name = "str" | 123 | 4.99 | routes.account_login_url %}`
 *   - `{{ name }}` and `{{ name | money }}`
 *   - a single `{% if customer %}…{% else %}…{% endif %}` block
 * Anything else (other tags) is left untouched — real rendering happens in the
 * storefront. Unknown `{{ vars }}` are left visible so gaps are obvious.
 */

export interface PromoContext {
  customer: boolean;
  [key: string]: unknown;
}

/** Default preview context: a signed-in shopper so member/logic branches show. */
export const PROMO_PREVIEW_CONTEXT: PromoContext = { customer: true };

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function parseLiteral(raw: string): unknown {
  const s = raw.trim();
  const str = s.match(/^"(.*)"$/) || s.match(/^'(.*)'$/);
  if (str) return str[1];
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === "routes.account_login_url") return "/account/login";
  if (s === "true") return true;
  if (s === "false") return false;
  return s; // unknown expression — keep as-is
}

/** Collect `{% assign %}` values into a context and strip the tags from output. */
function collectAssigns(code: string, ctx: PromoContext): string {
  const ASSIGN = /\{%-?\s*assign\s+([\w.]+)\s*=\s*([\s\S]*?)\s*-?%\}\n?/g;
  return code.replace(ASSIGN, (_m, name: string, value: string) => {
    ctx[name] = parseLiteral(value);
    return "";
  });
}

/** Resolve a single `{% if customer %}…{% else %}…{% endif %}` conditional. */
function resolveCustomerIf(code: string, ctx: PromoContext): string {
  return code.replace(
    /\{%-?\s*if\s+customer\s*-?%\}([\s\S]*?)\{%-?\s*else\s*-?%\}([\s\S]*?)\{%-?\s*endif\s*-?%\}/g,
    (_m, ifBranch: string, elseBranch: string) => (ctx.customer ? ifBranch : elseBranch),
  );
}

/** Substitute `{{ var }}` and `{{ var | money }}` from the context. */
function substitute(code: string, ctx: PromoContext): string {
  return code.replace(
    /\{\{-?\s*([\w.]+)\s*(?:\|\s*(money)\s*)?-?\}\}/g,
    (match, name: string, filter: string | undefined) => {
      const value = ctx[name];
      if (value === undefined || value === null) return match; // leave visible
      if (filter === "money") return money(Number(value));
      return String(value);
    },
  );
}

/** Render a promo template's Liquid into preview HTML. */
export function renderPromo(code: string, ctx: PromoContext = PROMO_PREVIEW_CONTEXT): string {
  const context: PromoContext = { ...ctx };
  let out = collectAssigns(code, context);
  out = resolveCustomerIf(out, context);
  out = substitute(out, context);
  return out.trim();
}

/** Wrap rendered promo HTML in a minimal, self-contained document for an iframe. */
export function promoPreviewDoc(code: string, ctx?: PromoContext): string {
  const body = renderPromo(code, ctx);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    *{box-sizing:border-box}
    html,body{margin:0}
    body{padding:18px;background:#ffffff;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111827}
  </style></head><body>${body}</body></html>`;
}
