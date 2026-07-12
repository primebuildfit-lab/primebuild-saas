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

describe("Admin shell", () => {
  it("renders the admin product name and grouped navigation", () => {
    renderAt("/");
    expect(screen.getAllByText("Eventra Admin Console").length).toBeGreaterThan(0);
    for (const label of ["Overview", "Consumers", "Businesses", "Deals", "Advertising", "Feature Flags", "Audit Logs"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("wires the admin-principal boundary (mock granted)", () => {
    renderAt("/");
    expect(screen.getByText(/granted \(mock\)/i)).toBeInTheDocument();
  });

  it("routes to a scaffolded admin surface", () => {
    renderAt("/deals");
    expect(screen.getByRole("heading", { name: "Deals" })).toBeInTheDocument();
    expect(screen.getByText(/Coming in a later Mega Module/i)).toBeInTheDocument();
  });
});
