import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataProvider } from "~/context/DataContext";
import { CampaignDetail } from "~/features/campaigns/CampaignDetail";

function renderDetail(campaignId: string | null, onClose = () => {}) {
  return render(
    <DataProvider>
      <CampaignDetail
        campaignId={campaignId}
        onClose={onClose}
        onEdit={() => {}}
        onOpenOther={() => {}}
      />
    </DataProvider>,
  );
}

describe("CampaignDetail — invalid / deep-link ids", () => {
  it("shows an explicit not-found state for an unknown id", () => {
    renderDetail("cmp_does_not_exist");
    expect(screen.getByText(/doesn’t exist/i)).toBeInTheDocument();
  });

  it("lets the user recover from a stale deep link", async () => {
    const onClose = vi.fn();
    renderDetail("cmp_bad", onClose);
    await userEvent.click(screen.getByRole("button", { name: /back to campaigns/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders the campaign when the id resolves", () => {
    renderDetail("cmp_summer_2026");
    expect(screen.getByText("Summer Sale 2026")).toBeInTheDocument();
  });

  it("renders nothing visible when no id is selected", () => {
    renderDetail(null);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
