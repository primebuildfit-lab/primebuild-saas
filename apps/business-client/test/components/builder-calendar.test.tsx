import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DataProvider } from "~/context/DataContext";
import PromotionBuilder from "~/routes/app.promotion-builder";
import Calendar from "~/routes/app.calendar";

function renderRoute(Comp: React.ComponentType, initialEntries: string[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DataProvider>
        <Comp />
      </DataProvider>
    </MemoryRouter>,
  );
}

describe("Promotion Builder", () => {
  it("renders its heading and the stepper", () => {
    renderRoute(PromotionBuilder);
    expect(
      screen.getByRole("heading", { name: /Promotion Builder/i, level: 1 }),
    ).toBeInTheDocument();
    // Stepper steps present
    expect(screen.getAllByText(/Opportunity/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Preview & save/i)).toBeInTheDocument();
  });
});

describe("Annual calendar", () => {
  it("renders the annual heatmap with a legend", () => {
    renderRoute(Calendar, ["/?view=year"]);
    expect(screen.getByRole("heading", { name: /Calendar/i, level: 1 })).toBeInTheDocument();
    // Heatmap legend communicates meaning without labels on every day.
    expect(screen.getByText(/High \/ critical/i)).toBeInTheDocument();
    expect(screen.getByText(/Campaign active/i)).toBeInTheDocument();
  });
});
