import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { App } from "../src/App";

afterEach(cleanup);

describe("Consumer calendar app", () => {
  it("renders the product name and a calendar for the current month", () => {
    render(<App />);
    // Product name in the top bar.
    expect(screen.getByText("Eventra")).toBeInTheDocument();
    // The screen title is the page-level heading.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calendario");
    // The calendar month is a sub-heading (e.g. "July 2026").
    const month = screen.getByRole("heading", { level: 2 });
    expect(month.textContent).toMatch(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}\b/,
    );
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

  it("marks today's date and shows the selected-day detail", () => {
    render(<App />);
    const grid = screen.getByRole("grid");
    // Exactly one cell is aria-current="date" (today).
    const today = within(grid)
      .getAllByRole("gridcell")
      .filter((cell) => cell.getAttribute("aria-current") === "date");
    expect(today).toHaveLength(1);
    // The detail card defaults to today ("Today" appears on both the reset
    // button and the detail label) with no events yet.
    expect(screen.getAllByText("Today").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("No events yet.")).toBeInTheDocument();
  });
});
