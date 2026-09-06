"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { accentStyle } from "@/lib/color";
import type { MenuThemeDef } from "@/lib/themes";
import { cn } from "@/lib/utils";

/**
 * Miniature of a theme's layout, painted in that theme's own tokens.
 *
 * The swatch carries `data-guest-theme` and the derived accent variables, so it
 * inherits the real palette from design/theme.css instead of repeating it in
 * TypeScript. A new theme therefore needs no change here, and the swatch can
 * never show colours the guest menu does not actually use.
 */
export function ThemeCard({
  theme,
  active,
  accent,
  onSelect,
}: {
  theme: MenuThemeDef;
  active: boolean;
  accent: string;
  onSelect: () => void;
}) {
  const print = theme.archetype === "print";
  // Three print themes share a palette and differ only in rhythm — without this
  // they are indistinguishable at swatch size.
  const rowGap = { tight: "mt-1", normal: "mt-1.5", airy: "mt-2.5" }[theme.density];
  const width = { tight: "w-[82%]", normal: "w-full", airy: "w-full" }[theme.density];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-admin-lg border bg-admin-surface p-2.5 text-left",
        "transition-colors duration-[var(--dur-fast)]",
        active
          ? "border-admin-primary shadow-admin-focus"
          : "border-admin-border hover:bg-[#fafafb]"
      )}
    >
      <span
        data-guest-theme={theme.key.toLowerCase()}
        style={accentStyle(accent, theme.key) as React.CSSProperties}
        className="block h-[112px] overflow-hidden rounded-admin border border-admin-border bg-guest-bg px-2.5 py-2"
        aria-hidden
      >
        {print ? (
          <span className={cn("mx-auto flex h-full flex-col items-center gap-1", width)}>
            <span className="h-px w-8 bg-guest-border-strong" />
            <span className="h-1.5 w-14 rounded-[1px] bg-guest-ink" />
            <span className="h-px w-8 bg-guest-border-strong" />
            <span className="mt-1.5 h-1 w-10 rounded-[1px] bg-brand" />
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn("flex w-full items-baseline gap-1", rowGap)}>
                <span className="h-1.5 w-10 rounded-[1px] bg-guest-ink-2" />
                <span className="h-px flex-1 bg-guest-border-strong" />
                <span className="h-1.5 w-4 rounded-[1px] bg-guest-ink" />
              </span>
            ))}
          </span>
        ) : (
          <span className="flex h-full flex-col gap-1.5">
            <span className="h-2 w-16 rounded-[1px] bg-guest-ink" />
            <span className="flex gap-1">
              <span className="h-2.5 w-7 rounded-guest-sm bg-brand" />
              <span className="h-2.5 w-7 rounded-guest-sm border border-guest-border bg-guest-surface" />
              <span className="h-2.5 w-7 rounded-guest-sm border border-guest-border bg-guest-surface" />
            </span>
            {[0, 1].map((i) => (
              <span key={i} className={cn("flex w-full gap-1.5", theme.density === "airy" ? "mt-2" : "mt-0.5")}>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="h-1.5 w-14 rounded-[1px] bg-guest-ink" />
                  <span className="h-1 w-full rounded-[1px] bg-guest-muted" />
                  <span className="h-1.5 w-6 rounded-[1px] bg-guest-ink" />
                </span>
                <span className="size-7 shrink-0 rounded-guest-sm bg-guest-surface-2" />
              </span>
            ))}
          </span>
        )}
      </span>

      <span>
        <span className="flex items-center gap-1.5">
          <span className="text-admin-sm font-semibold text-admin-ink">{theme.label}</span>
          {active ? (
            <Check size={14} strokeWidth={2.5} className="text-admin-primary" aria-hidden />
          ) : null}
        </span>
        <span className="mt-0.5 block text-admin-sm leading-snug text-admin-muted">
          {theme.mood}
        </span>
      </span>
    </button>
  );
}
