"use client";

import * as React from "react";

/**
 * Shared overlay behaviour: Escape to close, background scroll lock, focus moved
 * into the panel on open and returned to the trigger on close, and a focus trap
 * so Tab cannot wander behind the overlay.
 */
export function useDismissable<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = React.useRef<T>(null);

  // Callers pass an inline arrow, so `onClose` gets a new identity on every
  // parent render. Keeping it in a ref means the effect below depends only on
  // `open` — otherwise each re-render tears the overlay down and re-focuses the
  // panel, yanking the caret out of whatever field the user is typing in.
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    // Focus the panel itself rather than its first control, so screen readers
    // announce the dialog title before its contents.
    const frame = requestAnimationFrame(() => {
      const panel = ref.current;
      if (!panel) return;
      panel.setAttribute("tabindex", "-1");
      panel.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === ref.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
