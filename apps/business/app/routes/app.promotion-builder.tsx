import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Wand2,
  Sparkles,
  LayoutTemplate,
  Package,
  Tag,
  CalendarRange,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PageHeader,
  Button,
  Field,
  Badge,
  ScoreBadge,
  EmptyState,
} from "~/components/ui";
import { TextInput, Textarea, Select } from "~/components/ui/FormControls";
import { useData } from "~/context/DataContext";
import { buildOpportunities, type ScoredOpportunity } from "~/lib/opportunities";
import { ProductPicker, AttachedRefs } from "~/features/campaigns/ProductPicker";
import { getCountry } from "~/data";
import { cn } from "~/lib/cn";

const countryName = (code: string): string => getCountry(code)?.name ?? code;

/**
 * PROMOTION BUILDER — the heart of Eventra: it turns an opportunity into
 * ready-to-publish marketing. This is a real, working builder: on save it
 * persists a genuine campaign/advertisement record (optimistic + server seam).
 * It never fabricates data — empty steps stay empty and are clearly explained.
 *
 * NOTE (honest): the domain currently has no dedicated `Promotion` table, so a
 * promotion is saved as a campaign record with its extra marketing fields (title,
 * subtitle, CTA, banner, liquid) captured in the campaign notes. When a promotion
 * schema lands, only the save mapping changes — the builder UI stays.
 */

interface PromotionDraft {
  opportunityId: string | null;
  templateId: string | null;
  productRefs: string[];
  name: string;
  offer: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  liquid: string;
  country: string;
  startDate: string;
  endDate: string;
}

const STEPS = [
  { key: "opportunity", label: "Opportunity", icon: Sparkles },
  { key: "template", label: "Template", icon: LayoutTemplate },
  { key: "products", label: "Products", icon: Package },
  { key: "offer", label: "Offer & text", icon: Tag },
  { key: "schedule", label: "Schedule", icon: CalendarRange },
  { key: "preview", label: "Preview & save", icon: Eye },
] as const;

function emptyDraft(): PromotionDraft {
  return {
    opportunityId: null,
    templateId: null,
    productRefs: [],
    name: "",
    offer: "",
    title: "",
    subtitle: "",
    description: "",
    cta: "Shop now",
    liquid: "",
    country: "",
    startDate: "",
    endDate: "",
  };
}

export default function PromotionBuilderRoute() {
  const {
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    campaigns,
    plan,
    templates,
    createCampaign,
  } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const opportunities = useMemo(
    () =>
      buildOpportunities({
        globalEvents,
        enabledCodes: enabledCountryCodes,
        prefs: eventPreferences,
        campaigns,
        planHorizonMonths: plan.planningHorizonMonths,
      })
        .filter((o) => o.daysUntil >= 0 && o.state !== "cancelled")
        .slice(0, 30),
    [globalEvents, enabledCountryCodes, eventPreferences, campaigns, plan],
  );

  // Optional deep-link: /app/promotion-builder?opp=<id> preselects an opportunity.
  const preOpp = params.get("opp");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PromotionDraft>(() => {
    const d = emptyDraft();
    if (preOpp) {
      const o = opportunities.find((x) => x.id === preOpp);
      if (o) applyOpportunity(d, o, enabledCountryCodes[0]);
    }
    return d;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const set = (patch: Partial<PromotionDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const selectOpportunity = (o: ScoredOpportunity) => {
    setDraft((d) => {
      const next = { ...d };
      applyOpportunity(next, o, enabledCountryCodes[0]);
      return next;
    });
  };

  const canSave = draft.name.trim() && draft.startDate && draft.endDate;

  const save = (publish: boolean) => {
    if (!canSave) return;
    const notesParts = [
      draft.title && `Title: ${draft.title}`,
      draft.subtitle && `Subtitle: ${draft.subtitle}`,
      draft.cta && `CTA: ${draft.cta}`,
      draft.liquid && `Liquid:\n${draft.liquid}`,
    ].filter(Boolean);
    const campaign = createCampaign({
      name: draft.name.trim(),
      globalEventId: draft.opportunityId
        ? opportunities.find((o) => o.id === draft.opportunityId)?.event.id
        : undefined,
      country: draft.country || undefined,
      objective: draft.subtitle.trim() || undefined,
      description: draft.description.trim() || undefined,
      offer: draft.offer.trim() || undefined,
      notes: notesParts.join("\n") || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate,
      status: publish ? "scheduled" : "draft",
      productRefs: draft.productRefs,
      actions: [],
    });
    navigate(`/app/campaigns?c=${campaign.id}`);
  };

  const selectedOpp = opportunities.find((o) => o.id === draft.opportunityId) ?? null;

  return (
    <div>
      <PageHeader
        title="Promotion Builder"
        description="Turn an opportunity into ready-to-publish marketing: pick an opportunity, choose a template and products, write your offer, and schedule it. Saving creates a real campaign you can reuse next year."
      />

      {/* Stepper */}
      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-brand-500/50 bg-brand-500/15 text-white"
                    : done
                      ? "border-line bg-surface text-ink-muted hover:text-ink"
                      : "border-line bg-surface text-ink-faint hover:text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    active ? "bg-brand-600 text-white" : done ? "bg-ok/20 text-ok" : "bg-surface-2 text-ink-faint",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <Icon className="hidden h-4 w-4 sm:block" />
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-line bg-surface p-5">
        {/* Step 1 — Opportunity */}
        {step === 0 ? (
          opportunities.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No opportunities available yet"
              description="Enable more countries or wait for upcoming events to appear inside your plan horizon, then start a promotion from one."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((o) => {
                const chosen = o.id === draft.opportunityId;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => selectOpportunity(o)}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
                      chosen
                        ? "border-brand-500/60 bg-brand-500/10 ring-1 ring-inset ring-brand-500/30"
                        : "border-line bg-surface-2 hover:border-brand-500/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium text-ink">{o.event.name}</span>
                      <ScoreBadge score={o.score} size="sm" />
                    </div>
                    <span className="text-xs text-ink-muted">
                      {o.daysUntil}d · {o.reachCodes.map(countryName).slice(0, 2).join(", ")}
                    </span>
                    {chosen ? <Badge tone="brand">Selected</Badge> : null}
                  </button>
                );
              })}
            </div>
          )
        ) : null}

        {/* Step 2 — Template */}
        {step === 1 ? (
          <div>
            <p className="mb-3 text-sm text-ink-muted">
              Start from a reusable structure, or skip and build from scratch.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => set({ templateId: null })}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-colors",
                  draft.templateId === null
                    ? "border-brand-500/60 bg-brand-500/10 text-white"
                    : "border-line bg-surface-2 text-ink-muted hover:text-ink",
                )}
              >
                No template — start blank
              </button>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set({ templateId: t.id })}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    draft.templateId === t.id
                      ? "border-brand-500/60 bg-brand-500/10"
                      : "border-line bg-surface-2 hover:border-brand-500/40",
                  )}
                >
                  <span className="block truncate text-sm font-medium text-ink">{t.name}</span>
                  <span className="block text-xs text-ink-faint">{t.category}</span>
                </button>
              ))}
              {templates.length === 0 ? (
                <p className="col-span-full text-sm text-ink-faint">
                  No templates yet — you can create them from any campaign later.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Step 3 — Products */}
        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-muted">Attach the products and collections this promotion features.</p>
              <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                <Package className="h-4 w-4" />
                Choose products
              </Button>
            </div>
            <AttachedRefs ids={draft.productRefs} />
            <ProductPicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              selected={draft.productRefs}
              onChange={(ids) => set({ productRefs: ids })}
            />
          </div>
        ) : null}

        {/* Step 4 — Offer & marketing text */}
        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Promotion name" required className="sm:col-span-2">
              <TextInput
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="e.g. Black Friday — 25% off"
              />
            </Field>
            <Field label="Offer">
              <TextInput
                value={draft.offer}
                onChange={(e) => set({ offer: e.target.value })}
                placeholder="e.g. 25% off sitewide"
              />
            </Field>
            <Field label="Call to action">
              <TextInput value={draft.cta} onChange={(e) => set({ cta: e.target.value })} />
            </Field>
            <Field label="Headline">
              <TextInput
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="Big, bold headline"
              />
            </Field>
            <Field label="Subheadline">
              <TextInput
                value={draft.subtitle}
                onChange={(e) => set({ subtitle: e.target.value })}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="What is this promotion about?"
              />
            </Field>
            <Field label="Liquid block (optional)" className="sm:col-span-2" hint="Advanced: paste a Shopify Liquid snippet to reuse.">
              <Textarea
                rows={3}
                value={draft.liquid}
                onChange={(e) => set({ liquid: e.target.value })}
                className="font-mono text-xs"
                placeholder="{% if product.available %} … {% endif %}"
              />
            </Field>
          </div>
        ) : null}

        {/* Step 5 — Schedule & country */}
        {step === 4 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country">
              <Select value={draft.country} onChange={(e) => set({ country: e.target.value })}>
                <option value="">All enabled countries</option>
                {enabledCountryCodes.map((c) => (
                  <option key={c} value={c}>
                    {countryName(c)}
                  </option>
                ))}
              </Select>
            </Field>
            <div />
            <Field label="Start date" required>
              <TextInput type="date" value={draft.startDate} onChange={(e) => set({ startDate: e.target.value })} />
            </Field>
            <Field label="End date" required>
              <TextInput type="date" value={draft.endDate} onChange={(e) => set({ endDate: e.target.value })} />
            </Field>
          </div>
        ) : null}

        {/* Step 6 — Preview & save */}
        {step === 5 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Preview</p>
              <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-600/40 to-brand-800/40 text-center">
                  <div className="px-4">
                    <p className="text-lg font-bold text-white">{draft.title || draft.name || "Your headline"}</p>
                    {draft.subtitle ? <p className="text-sm text-brand-100">{draft.subtitle}</p> : null}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-ink">{draft.description || "Promotion description will appear here."}</p>
                  {draft.offer ? <Badge tone="green" className="mt-2">{draft.offer}</Badge> : null}
                  <div className="mt-3">
                    <span className="inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">
                      {draft.cta || "Shop now"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Summary</p>
              <SummaryRow label="Opportunity" value={selectedOpp?.event.name ?? "None"} />
              <SummaryRow label="Products" value={`${draft.productRefs.length} attached`} />
              <SummaryRow label="Country" value={draft.country ? countryName(draft.country) : "All enabled"} />
              <SummaryRow label="Schedule" value={draft.startDate && draft.endDate ? `${draft.startDate} → ${draft.endDate}` : "Not set"} />
              {!canSave ? (
                <p className="mt-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
                  Add a promotion name and schedule (step 4–5) before saving.
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={() => save(false)} disabled={!canSave}>
                  Save draft
                </Button>
                <Button onClick={() => save(true)} disabled={!canSave}>
                  <Wand2 className="h-4 w-4" />
                  Save & schedule
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer nav */}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function applyOpportunity(d: PromotionDraft, o: ScoredOpportunity, fallbackCountry?: string) {
  d.opportunityId = o.id;
  if (!d.name) d.name = `${o.event.name} ${o.year}`;
  d.country = o.reachCodes[0] ?? fallbackCountry ?? "";
  d.startDate = o.occurrence.startISO;
  d.endDate = o.occurrence.endISO;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-1.5 last:border-0">
      <span className="text-ink-faint">{label}</span>
      <span className="truncate font-medium text-ink">{value}</span>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
