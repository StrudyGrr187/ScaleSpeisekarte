"use client";

import * as React from "react";
import { Info } from "lucide-react";
import type { GuestTheme } from "@/components/menu/menu-item-row";
import { cn } from "@/lib/utils";

/**
 * Sticky category navigation. The active entry keeps itself scrolled into view.
 *
 * MODERN  — pill chips, the active one filled with the tenant accent.
 * CLASSIC — a register: no radius, no fill, no blur; the active entry carries a
 *           2px accent underline. It also hosts the allergen legend button,
 *           because classic renders allergen codes as non-interactive
 *           superscripts, which can never be a 44px target.
 */
export function CategoryNav({
  categories,
  activeId,
  onSelect,
  scrolled,
  theme,
  onOpenLegend,
  hasAllergens,
}: {
  categories: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (sectionId: string) => void;
  scrolled: boolean;
  theme: GuestTheme;
  onOpenLegend: () => void;
  hasAllergens: boolean;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const chipRefs = React.useRef(new Map<string, HTMLButtonElement>());

  React.useEffect(() => {
    if (!activeId) return;
    const chip = chipRefs.current.get(activeId);
    const list = listRef.current;
    if (!chip || !list) return;

    // Deliberately not scrollIntoView: that scrolls *every* scrollable ancestor,
    // and doing so aborts the vertical smooth scroll the same click just started
    // on the menu container — the chip lit up while the page stayed put.
    // Only the chip strip should move, so move only the chip strip.
    const delta = chip.getBoundingClientRect().left - list.getBoundingClientRect().left;
    const centered = list.scrollLeft + delta - (list.clientWidth - chip.clientWidth) / 2;
    const left = Math.max(0, Math.min(centered, list.scrollWidth - list.clientWidth));
    if (Math.abs(left - list.scrollLeft) < 1) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [activeId]);

  if (categories.length === 0) return null;

  const classic = theme === "CLASSIC";

  return (
    <nav
      aria-label="Kategorien"
      className={cn(
        "sticky top-0 z-40 flex h-nav items-stretch",
        classic
          ? "bg-guest-bg"
          : "bg-guest-bg/[0.88] backdrop-blur-[12px]",
        "transition-colors duration-[var(--dur-fast)]",
        classic
          ? scrolled
            ? "border-b-2 border-guest-border-strong"
            : "border-b-2 border-transparent"
          : scrolled
            ? "border-b border-guest-border"
            : "border-b border-transparent"
      )}
    >
      <div
        ref={listRef}
        className={cn(
          "no-scrollbar flex flex-1 items-center overflow-x-auto px-gutter",
          classic ? "gap-0" : "scroll-fade-x gap-2",
          // Room for the sticky legend button, so the last entry is never
          // stuck underneath it.
          classic && hasAllergens && "pr-12"
        )}
      >
        {categories.map((category) => {
          const sectionId = `section-${category.id}`;
          const active = activeId === sectionId;
          return (
            <button
              key={category.id}
              ref={(el) => {
                if (el) chipRefs.current.set(sectionId, el);
                else chipRefs.current.delete(sectionId);
              }}
              type="button"
              data-chrome
              onClick={() => onSelect(sectionId)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "shrink-0 transition-colors duration-[var(--dur-base)]",
                classic
                  ? cn(
                      "h-11 border-b-2 px-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase",
                      active
                        ? "border-brand text-guest-ink"
                        : "border-transparent text-guest-ink-2"
                    )
                  : cn(
                      "h-11 rounded-full border px-4 text-[14px] font-semibold",
                      active
                        ? "border-transparent bg-brand text-brand-ink"
                        : "border-guest-border bg-guest-surface text-guest-ink-2 active:bg-guest-surface-2"
                    )
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {classic && hasAllergens ? (
        <button
          type="button"
          data-chrome
          onClick={onOpenLegend}
          aria-label="Allergene und Zusatzstoffe"
          className="sticky right-0 flex size-11 shrink-0 items-center justify-center self-center border-l border-guest-border bg-guest-bg text-guest-ink-2"
        >
          <Info size={16} strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </nav>
  );
}
