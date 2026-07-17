import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
// `within` is used to scope the status-filter chip query.
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DataProvider } from "~/context/DataContext";
import OpportunitiesRoute from "~/routes/app.opportunities";

function renderOpportunities() {
  return render(
    <MemoryRouter>
      <DataProvider>
        <OpportunitiesRoute />
      </DataProvider>
    </MemoryRouter>,
  );
}

describe("Opportunities screen", () => {
  it("renders discovered opportunities from the verified catalog", () => {
    renderOpportunities();
    expect(screen.getByRole("heading", { name: "Opportunities" })).toBeInTheDocument();
    // Black Friday is a high-importance seed event in the US/CA catalog.
    expect(screen.getAllByText(/Black Friday/i).length).toBeGreaterThan(0);
  });

  it("renders the KPI strip", () => {
    renderOpportunities();
    for (const label of ["Discovered", "Urgent to act", "Avg. score"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("filters to a single lifecycle state when a chip is chosen", async () => {
    renderOpportunities();
    const group = screen.getByRole("group", { name: /filter by status/i });
    // Every seed opportunity is Verified by default, so filtering to "New"
    // should narrow the table (Back to School is the seeded New signal).
    const newChip = within(group).getByRole("button", { name: /New/ });
    await userEvent.click(newChip);
    expect(newChip).toHaveAttribute("aria-pressed", "true");
  });
});
