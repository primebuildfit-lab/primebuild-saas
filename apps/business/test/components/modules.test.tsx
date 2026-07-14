import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ComponentType } from "react";
import { DataProvider } from "~/context/DataContext";
import Content from "~/routes/app.content";
import Audiences from "~/routes/app.audiences";
import Media from "~/routes/app.media";
import Sources from "~/routes/app.sources";
import Integrations from "~/routes/app.integrations";
import Automations from "~/routes/app.automations";
import Jobs from "~/routes/app.jobs";
import Ai from "~/routes/app.ai";
import Team from "~/routes/app.team";
import Account from "~/routes/app.account";

function renderModule(Comp: ComponentType) {
  return render(
    <MemoryRouter>
      <DataProvider>
        <Comp />
      </DataProvider>
    </MemoryRouter>,
  );
}

const cases: Array<[string, ComponentType, RegExp]> = [
  ["Content", Content, /Content/],
  ["Audiences", Audiences, /Audiences/],
  ["Media", Media, /Media/],
  ["Sources", Sources, /Sources/],
  ["Integrations", Integrations, /Integrations/],
  ["Automations", Automations, /Automations/],
  ["Jobs", Jobs, /Jobs/],
  ["AI", Ai, /AI/],
  ["Team", Team, /Team/],
  ["Account", Account, /Account/],
];

describe("new Business modules render", () => {
  it.each(cases)("%s renders its page heading", (_name, Comp, heading) => {
    renderModule(Comp);
    expect(screen.getByRole("heading", { name: heading, level: 1 })).toBeInTheDocument();
  });
});
