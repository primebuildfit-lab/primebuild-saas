import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DataProvider } from "~/context/DataContext";
import Dashboard from "~/routes/app._index";
import Memory from "~/routes/app.memory";

function renderRoute(Comp: React.ComponentType) {
  return render(
    <MemoryRouter>
      <DataProvider>
        <Comp />
      </DataProvider>
    </MemoryRouter>,
  );
}

describe("redesigned dashboard (what-to-do-today)", () => {
  it("renders the contextual hero heading", () => {
    renderRoute(Dashboard);
    expect(
      screen.getByRole("heading", { name: /Good to see you/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("shows the commercial sections", () => {
    renderRoute(Dashboard);
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
    expect(screen.getByText("Recommended for today")).toBeInTheDocument();
    expect(screen.getByText("Next 30–90 days")).toBeInTheDocument();
  });

  it("labels recommendations as rules-based, not fake AI", () => {
    renderRoute(Dashboard);
    expect(screen.getByText(/Rules-based · AI not connected/i)).toBeInTheDocument();
  });
});

describe("memory module", () => {
  it("renders its page heading", () => {
    renderRoute(Memory);
    expect(screen.getByRole("heading", { name: /Memory/i, level: 1 })).toBeInTheDocument();
  });

  it("surfaces reuse capability or an honest empty state", () => {
    renderRoute(Memory);
    // Either there is remembered work (a Reuse action) or the honest empty state.
    const reuse = screen.queryAllByRole("button", { name: /Reuse next year/i });
    const empty = screen.queryByText(/No results registered yet/i);
    expect(reuse.length > 0 || empty !== null).toBe(true);
  });
});
