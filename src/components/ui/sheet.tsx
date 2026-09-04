"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismissable } from "@/components/ui/use-dismissable";

/**
 * Bottom sheet for the guest menu. Reachable with one thumb, which is the only
 * way anything works while standing at a table holding a phone in one hand.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useDismissable<HTMLDivElement>(open, onClose);
  const titleId = React.useId();
  const dragStart = React.useRef<number | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-guest-overlay backdrop-blur-[2px] motion-safe:animate-[fade-in_var(--dur-base)_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col rounded-t-guest-sheet bg-guest-surface shadow-guest-sheet",
          "sm:max-w-[520px]",
          "motion-safe:animate-[sheet-in_var(--dur-sheet)_var(--ease-sheet)]"
        )}
        onTouchStart={(event) => {
          dragStart.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const start = dragStart.current;
          const end = event.changedTouches[0]?.clientY;
          // Swipe down to dismiss — only from a near-stationary start, so
          // scrolling the legend does not close the sheet.
          if (start !== null && end !== undefined && end - start > 80) onClose();
          dragStart.current = null;
        }}
      >
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-guest-border-strong" />
        </div>
        <div className="flex items-center justify-between gap-3 px-gutter pt-2 pb-3">
          <h2 id={titleId} className="font-display text-cat text-guest-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-guest-muted active:bg-guest-surface-2"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
