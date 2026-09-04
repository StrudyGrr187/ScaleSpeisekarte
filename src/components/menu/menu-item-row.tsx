"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu-query";
import { DietaryIcon } from "@/components/menu/dietary-icon";
import { formatPrice, formatPriceDecimal } from "@/lib/money";
import { cn } from "@/lib/utils";

export type GuestTheme = "MODERN" | "CLASSIC";

/**
 * One dish. Both themes share this component; they differ in exactly three
 * structural ways, and everything else comes from the theme tokens:
 *
 *  MODERN  — hairline-divided list, image at the right, price on its own line.
 *  CLASSIC — no dividers, no images, price in a flush right-hand column. That
 *            flush price edge is what replaces dot leaders and what makes the
 *            theme read as a printed menu rather than "modern with a serif".
 */
export function MenuItemRow({
  item,
  currency,
  locale,
  theme,
  onAllergenClick,
  priority,
}: {
  item: PublicMenuItem;
  currency: string;
  locale: string;
  theme: GuestTheme;
  onAllergenClick: () => void;
  priority?: boolean;
}) {
  const soldOut = !item.available;
  const discounted = item.oldPrice !== null && item.oldPrice > item.price;

  return theme === "CLASSIC"
    ? renderClassic({ item, locale, currency, soldOut, discounted })
    : renderModern({ item, currency, locale, soldOut, discounted, onAllergenClick, priority });
}

/* ------------------------------------------------------------------ *
 * CLASSIC
 * ------------------------------------------------------------------ */

function renderClassic({
  item,
  locale,
  currency,
  soldOut,
  discounted,
}: {
  item: PublicMenuItem;
  locale: string;
  currency: string;
  soldOut: boolean;
  discounted: boolean;
}) {
  const allergenLabel = item.allergenCodes.join(", ");

  return (
    <article
      id={`item-${item.id}`}
      data-preview-item={item.id}
      aria-disabled={soldOut || undefined}
      className="pt-row first:pt-0"
    >
      <div className="flex items-baseline gap-3">
        <h3
          className={cn(
            "relative min-w-0 flex-1 text-item",
            item.featured && !soldOut ? "font-semibold" : "font-normal",
            soldOut ? "text-guest-muted" : "text-guest-ink"
          )}
        >
          {item.featured && !soldOut ? (
            <>
              {/* Hangs in the gutter so it costs the name no width. */}
              <span
                className="absolute top-[0.42em] -left-[1.05rem] text-brand-text"
                aria-hidden
              >
                <Star size={11} className="fill-current" />
              </span>
              <span className="sr-only">Empfehlung des Hauses: </span>
            </>
          ) : null}
          {item.name}
          {item.allergenCodes.length > 0 ? (
            <>
              <span className="allergen-sup" aria-hidden>
                {item.allergenCodes.join(",")}
              </span>
              <span className="sr-only"> — Allergene: {allergenLabel}</span>
            </>
          ) : null}
        </h3>

        <p className="price-col text-item">
          {soldOut ? (
            <span className="text-guest-muted" aria-hidden>
              —
            </span>
          ) : (
            <>
              {discounted ? (
                <span className="mr-2 text-[0.8em] text-guest-muted line-through">
                  <span className="sr-only">Vorher </span>
                  {formatPriceDecimal(item.oldPrice!, locale)}
                </span>
              ) : null}
              <span className={discounted ? "text-brand-text" : "text-guest-ink"}>
                {formatPriceDecimal(item.price, locale)}
              </span>
              <span className="sr-only">{formatPrice(item.price, currency, locale)}</span>
            </>
          )}
        </p>
      </div>

      {item.description ? (
        <p
          className={cn(
            "mt-1 text-body italic",
            soldOut ? "text-guest-muted" : "text-guest-ink-2"
          )}
        >
          {item.description}
        </p>
      ) : null}

      {soldOut ? (
        <p
          data-chrome
          className="mt-1.5 text-meta font-semibold tracking-[0.08em] text-guest-muted uppercase"
        >
          Heute nicht verfügbar
        </p>
      ) : item.dietaryTags.length > 0 ? (
        <ul
          data-chrome
          className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta font-semibold tracking-[0.08em] text-guest-veg uppercase"
        >
          {item.dietaryTags.slice(0, 3).map((tag, index) => (
            <li key={tag.key} className="flex items-center gap-1">
              {index > 0 ? (
                <span className="mr-1 text-guest-faint" aria-hidden>
                  ·
                </span>
              ) : null}
              <DietaryIcon icon={tag.icon} size={11} />
              {tag.name}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * MODERN
 * ------------------------------------------------------------------ */

function renderModern({
  item,
  currency,
  locale,
  soldOut,
  discounted,
  onAllergenClick,
  priority,
}: {
  item: PublicMenuItem;
  currency: string;
  locale: string;
  soldOut: boolean;
  discounted: boolean;
  onAllergenClick: () => void;
  priority?: boolean;
}) {
  return (
    <article
      id={`item-${item.id}`}
      data-preview-item={item.id}
      aria-disabled={soldOut || undefined}
      className={cn(
        "flex gap-3 border-b border-guest-border py-row last:border-b-0",
        soldOut && "opacity-60"
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-item font-semibold text-balance text-guest-ink">
          {item.name}
          {item.featured && !soldOut ? (
            <span className="inline-flex h-[20px] shrink-0 items-center gap-1 rounded-full bg-brand-soft px-[7px] text-[11px] font-bold tracking-[0.06em] text-brand-text uppercase">
              <Star size={11} className="fill-current" aria-hidden />
              Empfehlung
            </span>
          ) : null}
        </h3>

        {item.allergenCodes.length > 0 ? (
          <button
            type="button"
            onClick={onAllergenClick}
            aria-label={`Allergene: ${item.allergenCodes.join(", ")}. Legende öffnen`}
            className="-my-3 inline-flex min-h-11 min-w-11 items-center py-3 font-mono text-[12px] tracking-[0.14em] text-guest-muted underline decoration-guest-border-strong decoration-from-font underline-offset-4"
          >
            {item.allergenCodes.join(" ")}
          </button>
        ) : null}

        {item.description ? (
          <p className="mt-1 line-clamp-3 text-body text-guest-muted">{item.description}</p>
        ) : null}

        {item.dietaryTags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.dietaryTags.slice(0, 3).map((tag) => (
              <li
                key={tag.key}
                className="inline-flex h-[22px] items-center gap-1 rounded-full border border-guest-veg/25 bg-guest-veg-soft px-2 text-[12px] font-semibold tracking-[0.06em] text-guest-veg uppercase"
              >
                <DietaryIcon icon={tag.icon} />
                {tag.name}
              </li>
            ))}
          </ul>
        ) : null}

        {soldOut ? (
          <p className="mt-2">
            <span className="inline-flex h-[22px] items-center rounded-full border border-guest-border bg-guest-surface-2 px-2 text-[12px] font-semibold tracking-[0.06em] text-guest-muted uppercase">
              Heute nicht verfügbar
            </span>
          </p>
        ) : (
          <p className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                "text-item font-bold tabular-nums",
                discounted ? "text-brand-text" : "text-guest-ink"
              )}
            >
              {formatPrice(item.price, currency, locale)}
            </span>
            {discounted ? (
              <span className="text-body text-guest-muted line-through decoration-1">
                <span className="sr-only">Vorher </span>
                {formatPrice(item.oldPrice!, currency, locale)}
              </span>
            ) : null}
          </p>
        )}
      </div>

      {item.image ? (
        <div className="relative size-[76px] shrink-0 overflow-hidden rounded-guest bg-guest-surface-2">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="76px"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={cn("object-cover", soldOut && "grayscale")}
          />
        </div>
      ) : null}
    </article>
  );
}
