import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App";

afterEach(cleanup);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Consumer shell", () => {
  it("renders the product name and primary navigation", () => {
    renderAt("/");
    // product name appears (sidebar + header)
    expect(screen.getAllByText("Eventra").length).toBeGreaterThan(0);
    for (const label of ["Calendar", "Deals", "Companies", "Saved", "Notifications", "Subscription", "Settings"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("wires the shared entitlement engine on the home route (Core → ads on)", () => {
    renderAt("/");
    expect(screen.getByText("Ads: on")).toBeInTheDocument();
  });

  it("routes to a scaffolded placeholder surface", () => {
    renderAt("/deals");
    expect(screen.getByRole("heading", { name: "Deals" })).toBeInTheDocument();
    expect(screen.getByText(/Coming in a later Mega Module/i)).toBeInTheDocument();
  });
});
