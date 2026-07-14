/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  PLANTILLA · Catálogo de promociones (bloques Liquid listos para usar)      │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  Para AÑADIR una promoción: copia una entrada de PROMO_TEMPLATES y cámbiala.│
 * │  Se muestra sola en Plantillas con vista previa en vivo y código copiable.  │
 * │  Campos: id · name · description · tag (etiqueta corta) · code (Liquid).     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

export interface PromoTemplate {
  id: string;
  name: string;
  description: string;
  tag: string;
  code: string;
}

export const PROMO_TEMPLATES: PromoTemplate[] = [
  {
    id: "discount-10",
    name: "10% OFF — Descuento general",
    description:
      "Ahorra un 10% en productos seleccionados durante un periodo limitado. Una promoción sencilla para incentivar compras sin reducir demasiado el margen.",
    tag: "Descuento",
    code: `{% assign discount_percent = 10 %}
{% assign promotion_title = "Save 10% Today" %}
{% assign promotion_description = "Enjoy 10% off selected products for a limited time." %}
{% assign button_text = "Shop Now" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-promo eventra-promo--discount">
  <div class="eventra-promo__content">
    <span class="eventra-promo__badge">
      {{ discount_percent }}% OFF
    </span>

    <h2 class="eventra-promo__title">
      {{ promotion_title }}
    </h2>

    <p class="eventra-promo__description">
      {{ promotion_description }}
    </p>

    <a href="{{ button_url }}" class="eventra-promo__button">
      {{ button_text }}
    </a>
  </div>
</section>

<style>
  .eventra-promo {
    padding: 32px;
    border-radius: 16px;
    text-align: center;
    background: linear-gradient(135deg, #5b4cf0, #7c3aed);
    color: #ffffff;
  }

  .eventra-promo__badge {
    display: inline-block;
    margin-bottom: 12px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 14px;
    font-weight: 700;
  }

  .eventra-promo__title {
    margin: 0 0 10px;
    font-size: 32px;
    line-height: 1.1;
  }

  .eventra-promo__description {
    margin: 0 auto 20px;
    max-width: 600px;
    font-size: 16px;
  }

  .eventra-promo__button {
    display: inline-block;
    padding: 12px 22px;
    border-radius: 10px;
    background: #ffffff;
    color: #5b4cf0;
    font-weight: 700;
    text-decoration: none;
  }
</style>`,
  },
  {
    id: "discount-15",
    name: "15% OFF — Incentivo de compra",
    description:
      "Obtén un 15% de descuento en artículos elegibles. Ideal para aumentar conversiones y motivar al cliente a completar su compra.",
    tag: "Descuento",
    code: `{% assign discount_percent = 15 %}
{% assign promotion_title = "Get 15% Off" %}
{% assign promotion_description = "Save 15% on eligible products while the promotion is available." %}
{% assign button_text = "View Products" %}
{% assign button_url = "/collections/all" %}

<div class="eventra-banner">
  <div>
    <strong class="eventra-banner__value">
      {{ discount_percent }}% OFF
    </strong>

    <span class="eventra-banner__text">
      {{ promotion_description }}
    </span>
  </div>

  <a href="{{ button_url }}" class="eventra-banner__action">
    {{ button_text }}
  </a>
</div>

<style>
  .eventra-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 24px;
    border: 1px solid #d9d6ff;
    border-radius: 14px;
    background: #f3f1ff;
    color: #111827;
  }

  .eventra-banner__value {
    display: block;
    margin-bottom: 4px;
    color: #5b4cf0;
    font-size: 24px;
  }

  .eventra-banner__text {
    color: #4b5563;
  }

  .eventra-banner__action {
    flex-shrink: 0;
    padding: 11px 18px;
    border-radius: 9px;
    background: #5b4cf0;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }

  @media screen and (max-width: 749px) {
    .eventra-banner {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>`,
  },
  {
    id: "discount-20",
    name: "20% OFF — Promoción destacada",
    description:
      "Disfruta de un 20% de descuento en una selección de productos. Diseñada para generar una respuesta rápida y dar mayor visibilidad a una colección.",
    tag: "Descuento",
    code: `{% assign discount_percent = 20 %}
{% assign promotion_title = "Save More on Your Favorites" %}
{% assign promotion_description = "Take 20% off selected items and upgrade your order for less." %}
{% assign button_text = "Shop the Selection" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-highlight">
  <div class="eventra-highlight__icon">
    %
  </div>

  <div class="eventra-highlight__body">
    <p class="eventra-highlight__eyebrow">
      LIMITED PROMOTION
    </p>

    <h2>
      {{ promotion_title }}
    </h2>

    <p>
      {{ promotion_description }}
    </p>

    <a href="{{ button_url }}">
      {{ button_text }}
    </a>
  </div>

  <div class="eventra-highlight__discount">
    {{ discount_percent }}%
    <small>OFF</small>
  </div>
</section>

<style>
  .eventra-highlight {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 28px;
    border-radius: 18px;
    background: #0f172a;
    color: #ffffff;
  }

  .eventra-highlight__icon {
    display: grid;
    width: 56px;
    height: 56px;
    place-items: center;
    border-radius: 50%;
    background: #7c3aed;
    font-size: 24px;
    font-weight: 800;
  }

  .eventra-highlight__eyebrow {
    margin: 0 0 6px;
    color: #a78bfa;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .eventra-highlight h2 {
    margin: 0 0 8px;
    font-size: 28px;
  }

  .eventra-highlight p {
    margin: 0 0 16px;
    color: #cbd5e1;
  }

  .eventra-highlight a {
    color: #ffffff;
    font-weight: 700;
  }

  .eventra-highlight__discount {
    font-size: 42px;
    font-weight: 800;
    text-align: center;
  }

  .eventra-highlight__discount small {
    display: block;
    font-size: 13px;
  }

  @media screen and (max-width: 749px) {
    .eventra-highlight {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .eventra-highlight__icon {
      margin: auto;
    }
  }
</style>`,
  },
  {
    id: "free-shipping",
    name: "Free Shipping — Envío incluido",
    description:
      "Recibe tu pedido sin costo de envío al alcanzar el importe mínimo establecido. Ayuda a aumentar el valor promedio de cada compra.",
    tag: "Envío",
    code: `{% assign minimum_amount = 50 %}
{% assign promotion_title = "Free Shipping Available" %}
{% assign promotion_description = "Get free shipping when your order reaches the minimum purchase amount." %}
{% assign button_text = "Start Shopping" %}
{% assign button_url = "/collections/all" %}

<div class="eventra-shipping">
  <div class="eventra-shipping__symbol">
    ✦
  </div>

  <div class="eventra-shipping__copy">
    <strong>{{ promotion_title }}</strong>

    <span>
      {{ promotion_description }}
      Minimum order: {{ minimum_amount | money }}.
    </span>
  </div>

  <a href="{{ button_url }}">
    {{ button_text }}
  </a>
</div>

<style>
  .eventra-shipping {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
    border-radius: 14px;
    background: #ecfdf5;
    color: #064e3b;
  }

  .eventra-shipping__symbol {
    display: grid;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 50%;
    background: #10b981;
    color: #ffffff;
    font-size: 22px;
  }

  .eventra-shipping__copy {
    flex: 1;
  }

  .eventra-shipping__copy strong,
  .eventra-shipping__copy span {
    display: block;
  }

  .eventra-shipping__copy span {
    margin-top: 3px;
    color: #047857;
    font-size: 14px;
  }

  .eventra-shipping a {
    color: #065f46;
    font-weight: 800;
  }

  @media screen and (max-width: 749px) {
    .eventra-shipping {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>`,
  },
  {
    id: "bogo",
    name: "Buy One, Save on the Second",
    description:
      "Compra un producto elegible y recibe un descuento en una segunda unidad. Ideal para aumentar la cantidad de productos por pedido.",
    tag: "2x",
    code: `{% assign second_item_discount = 50 %}
{% assign promotion_title = "Buy One, Save on the Second" %}
{% assign promotion_description = "Purchase one eligible item and receive a discount on the second." %}
{% assign button_text = "Explore Eligible Items" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-bogo">
  <div class="eventra-bogo__label">
    BUY 1
  </div>

  <div class="eventra-bogo__plus">
    +
  </div>

  <div class="eventra-bogo__label eventra-bogo__label--accent">
    {{ second_item_discount }}% OFF
  </div>

  <div class="eventra-bogo__content">
    <h2>{{ promotion_title }}</h2>
    <p>{{ promotion_description }}</p>
    <a href="{{ button_url }}">{{ button_text }}</a>
  </div>
</section>

<style>
  .eventra-bogo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    padding: 30px;
    border-radius: 18px;
    background: #fff7ed;
    color: #7c2d12;
    text-align: center;
  }

  .eventra-bogo__label {
    padding: 14px 18px;
    border: 2px solid #fb923c;
    border-radius: 12px;
    background: #ffffff;
    font-size: 18px;
    font-weight: 800;
  }

  .eventra-bogo__label--accent {
    background: #f97316;
    color: #ffffff;
  }

  .eventra-bogo__plus {
    font-size: 28px;
    font-weight: 800;
  }

  .eventra-bogo__content {
    width: 100%;
    margin-top: 8px;
  }

  .eventra-bogo__content h2 {
    margin: 0 0 8px;
  }

  .eventra-bogo__content p {
    margin: 0 0 14px;
  }

  .eventra-bogo__content a {
    color: #9a3412;
    font-weight: 800;
  }
</style>`,
  },
  {
    id: "free-gift",
    name: "Free Gift — Regalo incluido",
    description:
      "Recibe un obsequio al completar una compra elegible. Una promoción útil para aumentar el valor percibido sin reducir directamente el precio principal.",
    tag: "Regalo",
    code: `{% assign minimum_amount = 75 %}
{% assign promotion_title = "A Gift Is Waiting for You" %}
{% assign promotion_description = "Receive a complimentary gift when your purchase meets the required amount." %}
{% assign button_text = "Unlock Your Gift" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-gift">
  <div class="eventra-gift__symbol">
    🎁
  </div>

  <div>
    <span class="eventra-gift__badge">
      COMPLIMENTARY GIFT
    </span>

    <h2>{{ promotion_title }}</h2>

    <p>
      {{ promotion_description }}
      Minimum purchase: {{ minimum_amount | money }}.
    </p>

    <a href="{{ button_url }}">
      {{ button_text }}
    </a>
  </div>
</section>

<style>
  .eventra-gift {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 22px;
    align-items: center;
    padding: 28px;
    border: 1px solid #ede9fe;
    border-radius: 18px;
    background: linear-gradient(135deg, #faf5ff, #eef2ff);
    color: #312e81;
  }

  .eventra-gift__symbol {
    font-size: 54px;
  }

  .eventra-gift__badge {
    display: inline-block;
    margin-bottom: 8px;
    color: #7c3aed;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }

  .eventra-gift h2 {
    margin: 0 0 8px;
  }

  .eventra-gift p {
    margin: 0 0 14px;
    color: #4c1d95;
  }

  .eventra-gift a {
    color: #5b21b6;
    font-weight: 800;
  }
</style>`,
  },
  {
    id: "threshold",
    name: "Spend More, Save More",
    description:
      "Obtén un descuento al alcanzar un importe mínimo de compra. Diseñada para aumentar el valor promedio del carrito.",
    tag: "Umbral",
    code: `{% assign minimum_amount = 100 %}
{% assign discount_percent = 20 %}
{% assign promotion_title = "Spend More, Save More" %}
{% assign button_text = "Build Your Order" %}
{% assign button_url = "/collections/all" %}

<div class="eventra-threshold">
  <p class="eventra-threshold__label">
    CART REWARD
  </p>

  <h2>
    Spend {{ minimum_amount | money }} and save {{ discount_percent }}%
  </h2>

  <p>
    Add eligible products to your order and unlock a larger discount at checkout.
  </p>

  <a href="{{ button_url }}">
    {{ button_text }}
  </a>
</div>

<style>
  .eventra-threshold {
    padding: 34px;
    border-radius: 18px;
    background: #111827;
    color: #ffffff;
    text-align: center;
  }

  .eventra-threshold__label {
    margin: 0 0 8px;
    color: #c4b5fd;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .eventra-threshold h2 {
    margin: 0 0 10px;
    font-size: 30px;
  }

  .eventra-threshold p {
    margin: 0 auto 20px;
    max-width: 620px;
    color: #cbd5e1;
  }

  .eventra-threshold a {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 10px;
    background: #8b5cf6;
    color: #ffffff;
    font-weight: 800;
    text-decoration: none;
  }
</style>`,
  },
  {
    id: "bundle",
    name: "Bundle & Save",
    description:
      "Combina productos seleccionados y obtén un mejor precio. Ideal para promover rutinas completas, kits o grupos de productos relacionados.",
    tag: "Bundle",
    code: `{% assign bundle_discount = 15 %}
{% assign promotion_title = "Build Your Bundle and Save" %}
{% assign promotion_description = "Combine eligible products and receive a better total price." %}
{% assign button_text = "Create Your Bundle" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-bundle">
  <div class="eventra-bundle__visual">
    <span>1</span>
    <span>2</span>
    <span>3</span>
  </div>

  <div class="eventra-bundle__content">
    <span class="eventra-bundle__badge">
      SAVE {{ bundle_discount }}%
    </span>

    <h2>{{ promotion_title }}</h2>

    <p>{{ promotion_description }}</p>

    <a href="{{ button_url }}">
      {{ button_text }}
    </a>
  </div>
</section>

<style>
  .eventra-bundle {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 26px;
    align-items: center;
    padding: 30px;
    border-radius: 18px;
    background: #eff6ff;
    color: #172554;
  }

  .eventra-bundle__visual {
    display: flex;
    gap: 8px;
  }

  .eventra-bundle__visual span {
    display: grid;
    width: 52px;
    height: 70px;
    place-items: center;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
    font-weight: 800;
  }

  .eventra-bundle__badge {
    color: #2563eb;
    font-size: 13px;
    font-weight: 800;
  }

  .eventra-bundle h2 {
    margin: 6px 0 8px;
  }

  .eventra-bundle p {
    margin: 0 0 16px;
    color: #1e3a8a;
  }

  .eventra-bundle a {
    color: #1d4ed8;
    font-weight: 800;
  }

  @media screen and (max-width: 749px) {
    .eventra-bundle {
      grid-template-columns: 1fr;
    }
  }
</style>`,
  },
  {
    id: "special-price",
    name: "Special Price — Precio promocional",
    description:
      "Accede a un precio especial en productos seleccionados. Ideal para destacar una reducción directa sin utilizar porcentajes.",
    tag: "Precio",
    code: `{% assign old_price = 49.99 %}
{% assign new_price = 39.99 %}
{% assign promotion_title = "Special Price Available" %}
{% assign promotion_description = "Selected products are now available at a reduced promotional price." %}
{% assign button_text = "View Offer" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-price">
  <div>
    <p class="eventra-price__label">
      SPECIAL PRICE
    </p>

    <h2>{{ promotion_title }}</h2>

    <p>{{ promotion_description }}</p>
  </div>

  <div class="eventra-price__numbers">
    <del>{{ old_price | money }}</del>
    <strong>{{ new_price | money }}</strong>
  </div>

  <a href="{{ button_url }}">
    {{ button_text }}
  </a>
</section>

<style>
  .eventra-price {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 24px;
    padding: 26px;
    border-radius: 16px;
    background: #fef2f2;
    color: #7f1d1d;
  }

  .eventra-price__label {
    margin: 0;
    color: #dc2626;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }

  .eventra-price h2 {
    margin: 5px 0 7px;
  }

  .eventra-price p {
    margin: 0;
  }

  .eventra-price__numbers {
    text-align: right;
  }

  .eventra-price__numbers del,
  .eventra-price__numbers strong {
    display: block;
  }

  .eventra-price__numbers del {
    color: #991b1b;
    font-size: 14px;
  }

  .eventra-price__numbers strong {
    font-size: 28px;
  }

  .eventra-price a {
    padding: 11px 18px;
    border-radius: 9px;
    background: #dc2626;
    color: #ffffff;
    font-weight: 800;
    text-decoration: none;
  }

  @media screen and (max-width: 749px) {
    .eventra-price {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .eventra-price__numbers {
      text-align: center;
    }
  }
</style>`,
  },
  {
    id: "member-exclusive",
    name: "Member Exclusive",
    description:
      "Una promoción reservada para clientes registrados o miembros del programa. Ayuda a fortalecer la retención y aumentar el valor de la membresía.",
    tag: "Miembros",
    code: `{% assign discount_percent = 20 %}
{% assign promotion_title = "Exclusive Member Offer" %}
{% assign promotion_description = "Registered members can access a private discount on eligible products." %}
{% assign login_url = routes.account_login_url %}
{% assign button_url = "/collections/all" %}

<section class="eventra-member">
  {% if customer %}
    <span class="eventra-member__status">
      MEMBER ACCESS
    </span>

    <h2>{{ promotion_title }}</h2>

    <p>
      {{ promotion_description }}
      Your discount: {{ discount_percent }}%.
    </p>

    <a href="{{ button_url }}">
      Shop Member Offers
    </a>
  {% else %}
    <span class="eventra-member__status">
      MEMBERS ONLY
    </span>

    <h2>Sign in to unlock this offer</h2>

    <p>
      Log in to access exclusive member pricing and benefits.
    </p>

    <a href="{{ login_url }}">
      Sign In
    </a>
  {% endif %}
</section>

<style>
  .eventra-member {
    padding: 34px;
    border-radius: 18px;
    background: linear-gradient(135deg, #312e81, #581c87);
    color: #ffffff;
    text-align: center;
  }

  .eventra-member__status {
    display: inline-block;
    margin-bottom: 10px;
    color: #ddd6fe;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .eventra-member h2 {
    margin: 0 0 10px;
  }

  .eventra-member p {
    margin: 0 auto 18px;
    max-width: 580px;
    color: #ede9fe;
  }

  .eventra-member a {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 10px;
    background: #ffffff;
    color: #5b21b6;
    font-weight: 800;
    text-decoration: none;
  }
</style>`,
  },
  {
    id: "quantity-discount",
    name: "Quantity Discount",
    description:
      "Ahorra más al comprar varias unidades del mismo producto. Diseñada para fomentar compras múltiples y pedidos de mayor tamaño.",
    tag: "Cantidad",
    code: `{% assign required_quantity = 3 %}
{% assign discount_percent = 15 %}
{% assign promotion_title = "Buy More and Save" %}
{% assign promotion_description = "Purchase multiple eligible units and receive an additional discount." %}
{% assign button_text = "Shop Eligible Products" %}
{% assign button_url = "/collections/all" %}

<section class="eventra-quantity">
  <div class="eventra-quantity__number">
    {{ required_quantity }}+
  </div>

  <div>
    <h2>{{ promotion_title }}</h2>

    <p>
      Buy {{ required_quantity }} or more eligible units and save
      {{ discount_percent }}%.
    </p>

    <a href="{{ button_url }}">
      {{ button_text }}
    </a>
  </div>
</section>

<style>
  .eventra-quantity {
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 28px;
    border-radius: 18px;
    background: #f0fdf4;
    color: #14532d;
  }

  .eventra-quantity__number {
    display: grid;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 50%;
    background: #22c55e;
    color: #ffffff;
    font-size: 30px;
    font-weight: 800;
  }

  .eventra-quantity h2 {
    margin: 0 0 8px;
  }

  .eventra-quantity p {
    margin: 0 0 14px;
  }

  .eventra-quantity a {
    color: #15803d;
    font-weight: 800;
  }
</style>`,
  },
  {
    id: "promo-code",
    name: "Promo Code Banner",
    description:
      "Utiliza un código promocional al finalizar la compra para activar el beneficio indicado.",
    tag: "Código",
    code: `{% assign promo_code = "SAVE10" %}
{% assign discount_percent = 10 %}
{% assign promotion_title = "Use Your Promo Code" %}
{% assign promotion_description = "Apply the code at checkout to receive your discount." %}
{% assign button_text = "Copy Code" %}

<section class="eventra-code">
  <div>
    <p class="eventra-code__label">
      PROMO CODE
    </p>

    <h2>{{ promotion_title }}</h2>

    <p>
      Save {{ discount_percent }}%.
      {{ promotion_description }}
    </p>
  </div>

  <button
    type="button"
    class="eventra-code__button"
    data-promo-code="{{ promo_code }}"
    onclick="navigator.clipboard.writeText(this.dataset.promoCode); this.innerText='Copied';"
  >
    {{ promo_code }}
  </button>
</section>

<style>
  .eventra-code {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    padding: 28px;
    border: 2px dashed #a78bfa;
    border-radius: 18px;
    background: #faf5ff;
    color: #4c1d95;
  }

  .eventra-code__label {
    margin: 0;
    color: #7c3aed;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .eventra-code h2 {
    margin: 5px 0 8px;
  }

  .eventra-code p {
    margin: 0;
  }

  .eventra-code__button {
    min-width: 130px;
    padding: 14px 18px;
    border: 0;
    border-radius: 10px;
    background: #7c3aed;
    color: #ffffff;
    cursor: pointer;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  @media screen and (max-width: 749px) {
    .eventra-code {
      align-items: stretch;
      flex-direction: column;
      text-align: center;
    }
  }
</style>`,
  },
];
