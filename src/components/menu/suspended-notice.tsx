import { Clock } from "lucide-react";

/**
 * What a guest sees when the customer is suspended. Worded as an ordinary
 * outage on purpose: the guest is standing in the restaurant, and neither the
 * reason nor the fact of a suspension is theirs to learn.
 */
export function SuspendedNotice({ restaurantName }: { restaurantName: string }) {
  return (
    <div
      data-guest-root
      data-guest-theme="modern"
      className="flex min-h-dvh items-center justify-center bg-guest-bg px-gutter font-sans text-guest-ink"
    >
      <div className="flex max-w-[320px] flex-col items-center text-center">
        <span
          className="flex size-12 items-center justify-center rounded-full bg-guest-surface-2 text-guest-muted"
          aria-hidden
        >
          <Clock size={22} strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 font-display text-cat text-guest-ink">{restaurantName}</h1>
        <p className="mt-2 text-body text-guest-muted">
          Die Speisekarte ist gerade nicht verfügbar. Bitte fragen Sie das Personal.
        </p>
      </div>
    </div>
  );
}
