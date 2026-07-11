# Eventra — Business Rules & Product Vision

> Source material (priority #3). Consolidated from the original product brief and
> the AI development context. Where this conflicts with the Roadmap, the Roadmap wins;
> where it conflicts with a later direct user instruction, the user wins.

## Identity
Eventra (Calendar Engine) is an **independent** product. PrimeBuild is only the first
test store — treat it as a future external customer. No PrimeBuild branding, code,
accounts, rewards logic, databases, colors, logos, or design system. Do not hardcode
`primebuildfit.com`, PrimeBuild store/customer IDs, colors, terminology, or rewards/affiliate logic.

## Product type
First commercial version = a **Shopify app for merchants**, designed so **multiple stores**
can install and use it independently. Each store eventually has separate: settings,
countries, events, campaigns, templates, subscription, calendar preferences. Architecture
must never assume a single store exists.

## Vision
Not a personal calendar. A **business planning system** that helps merchants prepare
marketing events/campaigns based on dates, countries, commercial opportunities, past
strategies, and planned actions. Move businesses from *"I need to remember to do this"*
to *"This business action is already scheduled."*

## Version 1 purpose
Planning, organization, and reusable **campaign memory**. No advanced automation. Actions
may be displayed/configured visually but remain **non-executing placeholders** until the
automation phase is approved.

### V1 must include
Shopify app structure · merchant auth & install flow · base SaaS layout · dashboard ·
year calendar · month calendar · event create/edit/delete · categories · status ·
country selection · country-specific dates · date search · campaign builder · campaign
history · reusable templates · calendar preferences · subscription-plan UI · admin UI
for countries and official events.

### Do NOT build yet
Advanced AI recommendations · automatic Shopify discount/banner/reward changes · Meta/Google
Ads integration · team collaboration · public standalone SaaS version · native iOS/Android ·
complex analytics · real automated payouts/external payment workflows.

## Design system
White backgrounds · light-gray surfaces · dark readable text · restrained green/blue/neutral
accents · clean borders · moderate radius · subtle shadows · clear spacing · accessible
contrast. References: Shopify Admin, Stripe, Notion, Linear, Google Calendar. "Premium" =
polished, not luxurious. Avoid gold styling, neon, gaming UI, fitness imagery, heavy
gradients, excessive animation, oversized in-app marketing heroes.

## Shopify rule
Build as its own Shopify app; never inside the PrimeBuild theme. Never overwrite theme
sections (header, footer, product, collections, rewards, account). Later storefront
integration only via app blocks, theme app extensions, or app proxies. No direct theme
edits unless explicitly approved.

## Multi-store preparation
Even with mock data, structure everything around a `store/shop` identifier:
`Store → Countries → Calendar Events → Campaigns → Templates → Preferences → Subscription`.
Never design business data as one global list shared by all merchants.

## Feature rules (product objects)
- **Countries** define available markets/events. Users add/remove/disable; plan-limited.
- **Global events** are platform-managed (name, country, date/rule, importance, category,
  description, recommended campaigns, recurrence, active state). Merchants cannot create
  global events but can create custom campaigns.
- **Event removal:** hiding a global date is **per-store**, restorable, never a global delete.
- **Repeat:** recurring events default Repeat-next-year = ON; user can disable.
- **Importance colors** (official dates): 🟢 high, 🟡 medium, 🔴 low/niche. Categories use a
  **separate** indicator.
- **Search:** deterministic search engine (not AI chat) over events/dates/countries/importance.
- **Campaigns:** create/edit/save/duplicate/mark-ready/mark-active/complete/archive/delete.
  A campaign stores objective, timing, products, strategy, notes — more than a discount.
- **Campaign memory:** reuse preserves prior history; duplication creates a new version.
- **Notifications:** in-app preparation reminders (e.g., 30/14/7/1 days before). No complex
  multichannel automation in V1.

## Subscription (frontend only in V1, no live payments)
Free ($0, 1 country) · Starter ($10, 2) · Growth ($20, 3) · VIP ($50, unlimited).
Do not use "Pro"/"Advanced". Plan limits enforced server-side later; don't hardcode prices
in multiple places; don't delete merchant data instantly on downgrade.

## Final V1 experience
A merchant installs Eventra and can immediately: see upcoming opportunities; select operating
countries; view important dates; hide/restore irrelevant dates; create a campaign linked to a
date; save it; reuse previous campaigns/templates; understand what is active/scheduled/
completed/archived. It must feel like an independent commercial product.
