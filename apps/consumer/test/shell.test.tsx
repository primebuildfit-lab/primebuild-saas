import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, within, fireEvent } from "@testing-library/react";
import { defaultCountry } from "@eventra/config";
import { App } from "../src/App";

afterEach(cleanup);

const MONTH_YEAR =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}\b/;

describe("Consumer mobile app", () => {
  it("renders the product name and the Inicio home", () => {
    render(<App />);
    // Product name in the top bar.
    expect(screen.getByText("Eventra")).toBeInTheDocument();
    // The Home is the default screen (page-level heading).
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Descubre lo que pasa");
    // The bottom nav keeps its 4 tabs (structure unchanged); Inicio is current.
    for (const label of ["Inicio", "Ofertas", "Alertas", "Cuenta"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  });

  it("integrates a calendar for the current month inside the home", () => {
    render(<App />);
    // The calendar month is a sub-heading (e.g. "July 2026") within the home.
    const month = screen.getByRole("heading", { level: 2, name: MONTH_YEAR });
    expect(month.textContent).toMatch(MONTH_YEAR);
  });

  it("shows its market + language from the shared platform catalog (ORDER §6)", () => {
    render(<App />);
    const market = defaultCountry();
    expect(screen.getByText(new RegExp(market.nameEs))).toBeInTheDocument();
    expect(screen.getByTitle(`Idioma: ${market.primaryLocale.label}`)).toBeInTheDocument();
  });

  it("shows weekday headers and month navigation controls", () => {
    render(<App />);
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(screen.getByRole("columnheader", { name: day })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
  });

  it("marks today's date and shows the selected-day agenda", () => {
    render(<App />);
    const grid = screen.getByRole("grid");
    // Exactly one cell is aria-current="date" (today).
    const today = within(grid)
      .getAllByRole("gridcell")
      .filter((cell) => cell.getAttribute("aria-current") === "date");
    expect(today).toHaveLength(1);
    // The agenda defaults to today.
    expect(screen.getByText("Hoy")).toBeInTheDocument();
  });

  it("switches tabs without changing the navigation structure", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Ofertas" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ofertas verificadas");
    fireEvent.click(screen.getByRole("button", { name: "Cuenta" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tu cuenta");
  });
});
