import Image from "next/image";
import type { PublicRestaurant } from "@/lib/menu-query";
import type { Archetype } from "@/lib/themes";

/**
 * Cover, logo and name. Every visual element is optional: with no cover and no
 * logo this still renders as a deliberate title block, not a gap.
 *
 * CLASSIC centres the block, drops the logo overlap and closes with a double
 * rule — the title page of a printed menu rather than a profile header.
 */
export function MenuHeader({
  restaurant,
  archetype,
}: {
  restaurant: PublicRestaurant;
  archetype: Archetype;
}) {
  const subtitle = [restaurant.description, restaurant.address].filter(Boolean)[0];

  if (archetype === "print") {
    return (
      <header>
        {restaurant.coverImage ? (
          <div className="relative h-[150px] w-full overflow-hidden border-b border-guest-border-strong bg-guest-surface-2">
            <Image
              src={restaurant.coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="px-gutter text-center">
          {restaurant.logo ? (
            <div className="relative mx-auto mt-7 size-[60px] overflow-hidden rounded-guest-sm border border-guest-border-strong bg-guest-surface">
              <Image
                src={restaurant.logo}
                alt={`Logo ${restaurant.name}`}
                fill
                priority
                sizes="60px"
                className="object-cover"
              />
            </div>
          ) : null}

          <h1
            className={`font-display text-hero text-guest-ink ${
              restaurant.logo ? "mt-[18px]" : "mt-8"
            }`}
          >
            {restaurant.name}
          </h1>

          {subtitle ? (
            <p className="mt-2 text-body italic text-guest-ink-2">{subtitle}</p>
          ) : null}

          <div className="rule-double mt-6" aria-hidden />
        </div>
      </header>
    );
  }

  return (
    <header>
      <div className="relative">
        {restaurant.coverImage ? (
          <div className="relative h-[200px] w-full overflow-hidden bg-guest-surface-2">
            <Image
              src={restaurant.coverImage}
              alt=""
              fill
              priority
              sizes="(max-width: 552px) 100vw, 552px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="cover-fallback h-[132px] w-full" aria-hidden />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,var(--color-guest-bg),transparent_55%)]"
          aria-hidden
        />
      </div>

      <div className="px-gutter">
        {restaurant.logo ? (
          <div className="relative -mt-9 size-[72px] overflow-hidden rounded-guest-lg bg-guest-surface ring-4 ring-guest-bg">
            <Image
              src={restaurant.logo}
              alt={`Logo ${restaurant.name}`}
              fill
              priority
              sizes="72px"
              className="object-cover"
            />
          </div>
        ) : null}

        <h1
          className={`font-display text-hero text-guest-ink ${restaurant.logo ? "mt-3" : "mt-5"}`}
        >
          {restaurant.name}
        </h1>

        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-body text-guest-muted">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
