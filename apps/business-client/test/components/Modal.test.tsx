import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "~/components/ui/Modal";

function Harness({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Edit campaign">
      <button type="button">First</button>
      <button type="button">Second</button>
    </Modal>
  );
}

describe("Modal accessibility", () => {
  it("has dialog semantics labelled by its title", () => {
    render(<Harness onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Edit campaign");
  });

  it("moves initial focus into the dialog panel", () => {
    render(<Harness onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps Tab focus within the dialog (never escapes to the page behind)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside before</button>
        <Harness onClose={() => {}} />
        <button type="button">Outside after</button>
      </>,
    );
    const dialog = screen.getByRole("dialog");
    // Tab through more times than there are controls; focus must stay inside.
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    // Shift+Tab also stays trapped.
    for (let i = 0; i < 3; i++) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("returns focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal open={open} onClose={() => setOpen(false)} title="Edit">
            <button type="button">Inside</button>
          </Modal>
        </>
      );
    }
    render(<Wrapper />);
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
