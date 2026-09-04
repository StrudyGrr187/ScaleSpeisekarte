"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Miniature of each theme's layout. Abstract on purpose — the real preview is
 * the phone next to it; this only has to make the choice legible at a glance.
 */
export function ThemeCard({
  theme,
  active,
  accent,
  onSelect,
}: {
  theme: "MODERN" | "CLASSIC";
  active: boolean;
  accent: string;
  onSelect: () => void;
}) {
  const isClassic = theme === "CLASSIC";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col gap-3 rounded-admin-lg border bg-admin-surface p-3 text-left",
        "transition-colors duration-[var(--dur-fast)]",
        active
          ? "border-admin-primary shadow-admin-focus"
          : "border-admin-border hover:bg-[#fafafb]"
      )}
    >
      <span
        className="block h-[132px] overflow-hidden rounded-admin border border-admin-border bg-[#fbf9f6] px-3 py-2.5"
        aria-hidden
      >
        {isClassic ? (
          <span className="flex h-full flex-col items-center gap-1.5">
            <span className="h-px w-10 bg-[#d6cfc6]" />
            <span className="h-2 w-16 rounded-[1px] bg-[#1a1614]" />
            <span className="h-px w-10 bg-[#d6cfc6]" />
            <span className="mt-2 h-1.5 w-12 rounded-[1px]" style={{ backgroundColor: accent }} />
            {[0, 1, 2].map((i) => (
              <span key={i} className="mt-1.5 flex w-full items-baseline gap-1">
                <span className="h-1.5 w-12 rounded-[1px] bg-[#4a423c]" />
                <span className="h-px flex-1 bg-[#d6cfc6]" />
                <span className="h-1.5 w-5 rounded-[1px] bg-[#1a1614]" />
              </span>
            ))}
          </span>
        ) : (
          <span className="flex h-full flex-col gap-1.5">
            <span className="h-2.5 w-20 rounded-[1px] bg-[#1a1614]" />
            <span className="flex gap-1">
              <span className="h-3 w-9 rounded-full" style={{ backgroundColor: accent }} />
              <span className="h-3 w-9 rounded-full border border-[#e8e2da] bg-white" />
              <span className="h-3 w-9 rounded-full border border-[#e8e2da] bg-white" />
            </span>
            {[0, 1].map((i) => (
              <span key={i} className="mt-1 flex w-full gap-2">
                <span className="flex flex-1 flex-col gap-1">
                  <span className="h-1.5 w-16 rounded-[1px] bg-[#1a1614]" />
                  <span className="h-1 w-full rounded-[1px] bg-[#c9c1b8]" />
                  <span className="h-1.5 w-7 rounded-[1px] bg-[#1a1614]" />
                </span>
                <span className="size-8 shrink-0 rounded-[4px] bg-[#e8e2da]" />
              </span>
            ))}
          </span>
        )}
      </span>

      <span>
        <span className="flex items-center gap-1.5">
          <span className="text-admin-base font-semibold text-admin-ink">
            {isClassic ? "Klassisch" : "Modern"}
          </span>
          {active ? (
            <Check size={15} strokeWidth={2.5} className="text-admin-primary" aria-hidden />
          ) : null}
        </span>
        <span className="mt-0.5 block text-admin-sm text-admin-muted">
          {isClassic
            ? "Satzbild einer gedruckten Karte. Keine Bilder, Preis am Zeilenende."
            : "Digitale Liste mit Bildern, Chips und Diät-Kennzeichnung."}
        </span>
      </span>
    </button>
  );
}
