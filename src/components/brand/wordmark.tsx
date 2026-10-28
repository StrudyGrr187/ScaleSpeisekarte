import { cn } from "@/lib/utils";

/**
 * Scale[Menu] — the ScaleEvo lockup with the product word in brackets, set in
 * Space Grotesk like Scale[Evo] and Scale[Booked]. The brackets stay grey: the
 * product colour means "live" and never decorates (design/DESIGN.md).
 * `tone="dark"` is the variant for ink backgrounds.
 */
export function Wordmark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const bracket = tone === "dark" ? "text-ink-2" : "text-ink-5";
  return (
    <span
      className={cn("font-bold tracking-[-0.02em] whitespace-nowrap", className)}
      style={{ fontFamily: "var(--font-spacegrotesk), ui-sans-serif, system-ui, sans-serif" }}
    >
      Scale
      <span className={cn("font-medium", bracket)} aria-hidden>
        [
      </span>
      Menu
      <span className={cn("font-medium", bracket)} aria-hidden>
        ]
      </span>
    </span>
  );
}

/**
 * The app icon in front of the wordmark: three menu lines, each with its price
 * dot, the top one in the signal colour — the dish that just changed.
 */
export function AppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect width="28" height="28" rx="8" fill="#0b0b0c" />
      <rect x="0.5" y="0.5" width="27" height="27" rx="7.5" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
      <rect x="6" y="7.5" width="12" height="3" rx="1.5" fill="var(--color-signal-on-ink)" />
      <rect x="20" y="7.5" width="2.5" height="3" rx="1.25" fill="var(--color-signal-on-ink)" />
      <rect x="6" y="12.5" width="9" height="3" rx="1.5" fill="#71717a" />
      <rect x="20" y="12.5" width="2.5" height="3" rx="1.25" fill="#71717a" />
      <rect x="6" y="17.5" width="11" height="3" rx="1.5" fill="#3f3f46" />
      <rect x="20" y="17.5" width="2.5" height="3" rx="1.25" fill="#3f3f46" />
    </svg>
  );
}
