import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusableWithin(node: HTMLElement): HTMLElement[] {
  // The selector already excludes disabled controls and tabindex=-1. We avoid
  // layout-based visibility checks (offsetParent) so this behaves consistently
  // in jsdom (no layout) and real browsers; hidden nodes also filter out.
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Accessible modal-dialog behavior shared by Modal and Drawer:
 * - moves initial focus into the dialog;
 * - traps Tab / Shift+Tab within it;
 * - closes on Escape;
 * - locks background scroll while open;
 * - returns focus to the previously-focused element on close.
 *
 * Attach the returned ref to the dialog panel (also give the panel tabIndex={-1}
 * so it can receive focus when it has no focusable children).
 */
export function useDialog<T extends HTMLElement = HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;

    // Move focus to the dialog panel itself so screen readers announce it (via
    // aria-labelledby) and an accidental Enter doesn't trigger the Close button.
    // Tab then moves through the dialog's controls, trapped below.
    node?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;

      const focusables = focusableWithin(node);
      if (focusables.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      // Return focus to whatever opened the dialog.
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}
