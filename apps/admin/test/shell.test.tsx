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

describe("Internal OS shell", () => {
  it("renders the Eventra Internal OS brand and grouped navigation", () => {
    renderAt("/");
    expect(screen.getAllByText("Internal OS").length).toBeGreaterThan(0);
    for (const label of ["Home", "Offers", "Sources", "Companies", "Commissions", "AI", "Audit"]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
    }
  });

  it("renders the operational Home with platform KPIs", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByText(/Companies/i).length).toBeGreaterThan(0);
  });

  it("renders the real Offers screen with dev data marked", () => {
    renderAt("/offers");
    expect(screen.getByRole("heading", { name: "Offers" })).toBeInTheDocument();
    expect(screen.getAllByText(/DEV DATA/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Black Friday")).toBeInTheDocument();
  });

  it("renders a scaffolded module honestly (not faked)", () => {
    renderAt("/settings");
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText(/Planned module/i)).toBeInTheDocument();
  });

  it("shows the environment badge (development in test)", () => {
    renderAt("/");
    expect(screen.getAllByText(/development/i).length).toBeGreaterThan(0);
  });
});
