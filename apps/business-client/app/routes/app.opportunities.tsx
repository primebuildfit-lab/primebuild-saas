import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Target, Zap, ShieldCheck } from "lucide-react";
import {
  PageHeader,
  StatTile,
  Toolbar,
  SearchInput,
  FilterChips,
  Select,
  EmptyState,
  CountrySelector,
  type FilterChip,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import {
  buildOpportunities,
  countByState,
  sortOpportunities,
  urgentOpportunities,
  type OpportunitySort,
  type OpportunityState,
  type ScoredOpportunity,
} from "~/lib/opportunities";
import { STATE_LABEL, STATE_ORDER } from "~/features/opportunities/opportunityLabels";
import { OpportunityTable } from "~/features/opportunities/OpportunityTable";
import { OpportunityDrawer } from "~/features/opportunities/OpportunityDrawer";
import { CampaignFormModal } from "~/features/campaigns/CampaignFormModal";
import {
  emptyCampaignValues,
  valuesFromEvent,
  type CampaignFormValues,
} from "~/features/campaigns/campaignModel";

export default function OpportunitiesRoute() {
  const {
    globalEvents,
    enabledCountryCodes,
    eventPreferences,
    campaigns,
    plan,
  } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState<OpportunityState | null>(null);
  const [sort, setSort] = useState<OpportunitySort>("score");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ScoredOpportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<CampaignFormValues>(() =>
    emptyCampaignValues(),
  );

  const built = useMemo(
    () =>
      buildOpportunities({
        globalEvents,
        enabledCodes: enabledCountryCodes,
        prefs: eventPreferences,
        campaigns,
        planHorizonMonths: plan.planningHorizonMonths,
      }),
    [globalEvents, enabledCountryCodes, eventPreferences, campaigns, plan],
  );
  const all = useMemo(
    () => (country ? built.filter((o) => o.reachCodes.includes(country)) : built),
    [built, country],
  );

  const counts = useMemo(() => countByState(all), [all]);
  const urgentCount = useMemo(() => urgentOpportunities(all).length, [all]);
  const verifiedCount = counts.verified;
  const avgScore = all.length
    ? Math.round(all.reduce((s, o) => s + o.score, 0) / all.length)
    : 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all
      .filter((o) => (state ? o.state === state : true))
      .filter((o) =>
        q
          ? o.event.name.toLowerCase().includes(q) ||
            o.source.toLowerCase().includes(q) ||
            o.category.toLowerCase().includes(q)
          : true,
      );
    return sortOpportunities(filtered, sort);
  }, [all, state, query, sort]);

  const stateChips: FilterChip<OpportunityState>[] = STATE_ORDER.map((s) => ({
    value: s,
    label: STATE_LABEL[s],
    count: counts[s],
  }));

  const openForOpportunity = (o: ScoredOpportunity) => {
    setInitialValues(valuesFromEvent(o.event, o.year, o.reachCodes[0]));
    setModalOpen(true);
  };

  const openDrawer = (o: ScoredOpportunity) => {
    setSelected(o);
    setDrawerOpen(true);
  };

  const createPromotion = (o: ScoredOpportunity) => {
    setDrawerOpen(false);
    navigate(`/app/promotion-builder?opp=${encodeURIComponent(o.id)}`);
  };

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Every marketing moment Eventra found for your markets — ranked by how much they’re worth acting on. Click any row to see why it scores and turn it into a promotion."
        actions={<CountrySelector value={country} onChange={setCountry} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Discovered"
          value={all.length}
          icon={Sparkles}
          hint={`Across ${enabledCountryCodes.length} market${enabledCountryCodes.length === 1 ? "" : "s"}`}
        />
        <StatTile
          label="Urgent to act"
          value={urgentCount}
          icon={Zap}
          hint="In their prep window, no campaign yet"
        />
        <StatTile
          label="Verified"
          value={verifiedCount}
          icon={ShieldCheck}
          hint="From the Eventra verified calendar"
        />
        <StatTile
          label="Avg. score"
          value={avgScore}
          icon={Target}
          hint="0–100 opportunity score"
        />
      </div>

      <div className="mt-6 space-y-4">
        <Toolbar
          actions={
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as OpportunitySort)}
              aria-label="Sort opportunities"
              className="w-44"
            >
              <option value="score">Best score</option>
              <option value="score_asc">Lowest score</option>
              <option value="priority">Priority</option>
              <option value="soonest">Soonest</option>
              <option value="reliability">Most reliable</option>
            </Select>
          }
        >
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search opportunities…"
            className="w-full sm:w-64"
          />
          <FilterChips
            chips={stateChips}
            value={state}
            onChange={setState}
            allLabel="All"
            aria-label="Filter by status"
          />
        </Toolbar>

        {visible.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={all.length === 0 ? "No opportunities yet" : "No matches"}
            description={
              all.length === 0
                ? "Enable a country to start discovering marketing opportunities for your markets."
                : "Try a different search or clear the status filter."
            }
          />
        ) : (
          <OpportunityTable
            items={visible}
            onCreateCampaign={openForOpportunity}
            onOpen={openDrawer}
          />
        )}
      </div>

      <OpportunityDrawer
        opportunity={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreatePromotion={createPromotion}
        onCreateCampaign={(o) => {
          setDrawerOpen(false);
          openForOpportunity(o);
        }}
      />

      <CampaignFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={initialValues}
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
