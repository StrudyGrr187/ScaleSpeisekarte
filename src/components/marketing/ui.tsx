import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Building blocks of the product system (design/DESIGN.md). Kept as plain class
 * strings and tiny components so the admin can adopt them later without a
 * component library in between.
 */

export const buttonPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[16px] font-medium text-paper shadow-button transition-colors duration-[var(--dur-fast)] hover:bg-ink-hover";

export const buttonSecondary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-paper px-6 text-[16px] font-medium text-ink shadow-edge transition-colors duration-[var(--dur-fast)] hover:bg-sand";

/** Sits above every heading, in place of an all-caps eyebrow. */
export function Chip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-paper py-1 pr-3.5 pl-1 text-[13px] font-medium text-ink shadow-edge">
      <span className="flex size-6 items-center justify-center rounded-full bg-sand text-ink-2">
        <Icon size={13} strokeWidth={1.75} aria-hidden />
      </span>
      {children}
    </p>
  );
}

/** Chip and heading on the left, the introduction on the right. */
export function SectionHead({
  icon,
  chip,
  title,
  intro,
  centered = false,
}: {
  icon: LucideIcon;
  chip: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <div className="flex flex-col items-center text-center">
        <Chip icon={icon}>{chip}</Chip>
        <h2 className="mt-5 text-h2 text-balance text-ink">{title}</h2>
        {intro ? <p className="mt-4 max-w-[52ch] text-lead text-ink-2">{intro}</p> : null}
      </div>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div>
        <Chip icon={icon}>{chip}</Chip>
        <h2 className="mt-5 text-h2 text-ink">{title}</h2>
      </div>
      {intro ? <p className="max-w-[46ch] text-lead text-ink-2 lg:pb-1.5">{intro}</p> : null}
    </div>
  );
}

/** White and canvas sections alternate, separated by hairlines. */
export function Section({
  id,
  tone = "paper",
  className,
  children,
}: {
  id?: string;
  tone?: "paper" | "canvas";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-16 border-t border-line-soft",
        tone === "canvas" ? "bg-canvas" : "bg-paper"
      )}
    >
      <div className={cn("mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-24", className)}>
        {children}
      </div>
    </section>
  );
}

/** Small round icon holder used inside product cards. */
export function IconDot({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-sand text-ink-2",
        className
      )}
      aria-hidden
    >
      <Icon size={16} strokeWidth={1.75} />
    </span>
  );
}

/** The signal in its only job: something is live right now. */
export function LiveBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-tint px-2.5 py-1 text-[12px] font-medium text-signal">
      <span className="size-1.5 rounded-full bg-signal" aria-hidden />
      {children}
    </span>
  );
}
