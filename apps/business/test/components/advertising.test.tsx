import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DataProvider } from "~/context/DataContext";
import Advertisements from "~/routes/app.advertisements";
import Offers from "~/routes/app.offers";

function renderRoute(Comp: React.ComponentType) {
  return render(
    <MemoryRouter>
      <DataProvider>
        <Comp />
      </DataProvider>
    </MemoryRouter>,
  );
}

describe("VIP advertising domain", () => {
  it("Advertisements renders its heading and an honest empty state", () => {
    renderRoute(Advertisements);
    expect(screen.getByRole("heading", { name: /Advertisements/i, level: 1 })).toBeInTheDocument();
    // No fabricated data — starts empty with a create CTA.
    expect(screen.getByText(/No advertisements yet/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Create advertisement/i).length).toBeGreaterThan(0);
  });

  it("Offers renders its heading and an honest empty state", () => {
    renderRoute(Offers);
    expect(screen.getByRole("heading", { name: /Offers/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/No offers yet/i)).toBeInTheDocument();
  });

  it("uses advertisement terminology, not campaign, as the primary create action", () => {
    renderRoute(Advertisements);
    // The screen never labels the primary action "Create campaign".
    expect(screen.queryByText(/Create campaign/i)).toBeNull();
  });
});
