import { cn } from "@/lib/utils";

/**
 * Scale[Menu] — the ScaleEvo lockup with the product word in brackets, set in
 * Space Grotesk like Scale[Evo] and Scale[Booked]. The brackets take the accent;
 * `tone="dark"` swaps it for the variant that stays readable on ink.
 */
export function Wordmark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const accent = tone === "dark" ? "text-scale-on-dark" : "text-scale";
  return (
    <span
      className={cn("font-bold tracking-[-0.02em] whitespace-nowrap", className)}
      style={{ fontFamily: "var(--font-spacegrotesk), ui-sans-serif, system-ui, sans-serif" }}
    >
      Scale
      <span className={accent} aria-hidden>
        [
      </span>
      Menu
      <span className={accent} aria-hidden>
        ]
      </span>
    </span>
  );
}
