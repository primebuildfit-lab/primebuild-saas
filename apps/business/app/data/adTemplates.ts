import type { OfferType } from "~/types/advertising";

/**
 * Base ad templates — shipped in the app's codebase as the DEFAULT starting point
 * a merchant (client) uses to create a promotion. Clients open the editor already
 * on this base and MODIFY it; the owner does not edit it per-tenant. Add more
 * presets to BASE_AD_TEMPLATES to offer additional starting points.
 */

export interface AdTemplate {
  id: string;
  /** template label shown to the client */
  name: string;
  title: string;
  description: string;
  discountType: OfferType;
  discountValue: string;
  buttonText: string;
  buttonLink: string;
  /** CSS background for the banner canvas */
  background: string;
  /** editable Liquid for the background / full text */
  liquid: string;
}

/** Default Liquid the client edits in the design phase. */
export const DEFAULT_AD_LIQUID = `{% comment %} Fondo y texto del anuncio — edítalo con Liquid {% endcomment %}
<div class="promo-banner">
  <span class="badge">LIMITED TIME</span>
  <h2>{{ promo.title }}</h2>
  <p>{{ promo.description }}</p>
  <a href="{{ promo.button_link }}" class="cta">{{ promo.button_text }}</a>
</div>`;

/** The default base template every new promotion starts from. */
export const BASE_AD_TEMPLATE: AdTemplate = {
  id: "base-default",
  name: "Plantilla base",
  title: "Save 10% Today",
  description: "Enjoy 10% off selected products for a limited time.",
  discountType: "percentage",
  discountValue: "10",
  buttonText: "Shop Now",
  buttonLink: "/collections/all",
  background: "radial-gradient(120% 120% at 80% 20%, #a855f7 0%, #7c3aed 40%, #4c1d95 100%)",
  liquid: DEFAULT_AD_LIQUID,
};

/** All base templates a client can start from (extensible). */
export const BASE_AD_TEMPLATES: AdTemplate[] = [BASE_AD_TEMPLATE];
