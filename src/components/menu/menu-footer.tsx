import { Globe, MapPin, Phone, Star } from "lucide-react";
import type { PublicRestaurant } from "@/lib/menu-query";
import type { GuestStrings } from "@/lib/guest-i18n";
import type { Archetype } from "@/lib/themes";
import { cn } from "@/lib/utils";

/** Practical detail a guest actually looks for, kept below the menu itself. */
export function MenuFooter({
  restaurant,
  archetype,
  onOpenLegend,
  hasAllergens,
  hasFeatured,
  strings: t,
  translated,
}: {
  restaurant: PublicRestaurant;
  archetype: Archetype;
  onOpenLegend: () => void;
  hasAllergens: boolean;
  hasFeatured: boolean;
  strings: GuestStrings;
  /** True when dishes are shown in a machine translation rather than the owner's German. */
  translated: boolean;
}) {
  const hours = restaurant.openingHours;
  const classic = archetype === "print";

  return (
    <footer className="mt-section border-t border-guest-border px-gutter pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      {classic && hasFeatured ? (
        <p className="mb-6 flex items-center justify-center gap-1.5 text-body text-guest-ink-2">
          <Star size={11} className="fill-current text-brand-text" aria-hidden />
          {t.featuredLong}
        </p>
      ) : null}

      {hasAllergens && !classic ? (
        <button
          type="button"
          onClick={onOpenLegend}
          className="mb-7 flex h-11 w-full items-center justify-center rounded-full border border-guest-border bg-guest-surface px-4 text-[14px] font-semibold text-guest-ink-2 active:bg-guest-surface-2"
        >
          {t.allergensAndAdditives}
        </button>
      ) : null}

      {hours.length > 0 ? (
        <section className="mb-7">
          <h2
            data-chrome
            className={cn(
              "text-meta font-semibold tracking-[0.06em] text-guest-muted uppercase",
              classic && "text-center"
            )}
          >
            {t.openingHours}
          </h2>
          <dl className="mt-3 space-y-1.5">
            {hours.map((day) => (
              <div key={day.dayOfWeek} className="flex justify-between gap-4 text-body">
                <dt className="text-guest-ink-2">{t.weekdaysShort[day.dayOfWeek]}</dt>
                <dd className="tabular-nums text-guest-muted">
                  {day.closed || !day.opensAt || !day.closesAt
                    ? t.closed
                    : `${day.opensAt} – ${day.closesAt}`}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <address className={cn("space-y-2.5 text-body not-italic", classic && "text-center")}>
        {restaurant.address ? (
          <p className="flex items-start gap-2.5 text-guest-ink-2">
            <MapPin size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-guest-faint" />
            {restaurant.address}
          </p>
        ) : null}
        {restaurant.phone ? (
          <p className="flex items-start gap-2.5">
            <Phone size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-guest-faint" />
            <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="text-guest-ink-2 underline decoration-guest-border underline-offset-4">
              {restaurant.phone}
            </a>
          </p>
        ) : null}
        {restaurant.website ? (
          <p className="flex items-start gap-2.5">
            <Globe size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-guest-faint" />
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-guest-ink-2 underline decoration-guest-border underline-offset-4"
            >
              {restaurant.website.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : null}
      </address>

      {restaurant.googleReviewUrl ? (
        <a
          href={restaurant.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-7 flex h-11 items-center justify-center gap-2 rounded-full border border-guest-border-strong bg-guest-surface px-4 text-[14px] font-semibold text-guest-ink-2 active:bg-guest-surface-2",
            classic && "mx-auto max-w-[280px]"
          )}
        >
          <Star size={16} className="fill-current text-brand-text" aria-hidden />
          {t.review}
        </a>
      ) : null}

      {translated ? (
        <p className={cn("mt-8 text-[13px] leading-relaxed text-guest-muted", classic && "text-center")}>
          {t.machineTranslated}
        </p>
      ) : null}

      <p
        data-chrome
        className={cn(
          "text-[13px] text-guest-muted",
          translated ? "mt-3" : "mt-8",
          classic && "text-center"
        )}
      >
        {t.pricesNote.replace("{currency}", restaurant.currency)}
      </p>
    </footer>
  );
}
