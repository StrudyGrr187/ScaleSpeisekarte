import { Nfc, ShieldCheck, Star, Tag, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EU_ALLERGENS } from "@/lib/constants";
import {
  GUEST_CATEGORIES,
  MOMENTS,
  RESTAURANT,
  SAMPLE_LABEL,
  STARTERS,
} from "./sample-data";
import { IconDot, LiveBadge } from "./ui";

/**
 * The hero stage: a light panel with a dot grid, the guest menu on a phone in
 * the middle and, from lg up, cards around it that tell what happened to that
 * menu tonight. Below lg the cards line up under the phone.
 */
export function Stage() {
  return (
    <div
      id="beispiel"
      className="relative scroll-mt-20 overflow-hidden rounded-stage bg-dotgrid px-4 pt-10 pb-6 shadow-edge sm:px-8 lg:h-[760px] lg:px-0 lg:pt-14"
    >
      <figure className="mx-auto w-full max-w-[312px]">
        <Phone />
        <figcaption className="mt-4 text-center text-[13px] text-ink-3">
          Beispiel: Café Milano im Design „Modern“
        </figcaption>
      </figure>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:contents">
        <FloatCard className="lg:absolute lg:top-[96px] lg:left-[5%] xl:left-[7%]">
          <div className="flex items-start gap-3">
            <IconDot icon={ToggleRight} />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-3 text-[14px] font-medium text-ink">
                Heute aus
                <span className="text-[13px] text-signal">
                  {MOMENTS.soldOut.time}
                </span>
              </p>
              <p className="mt-0.5 text-[13px] text-ink-2">{MOMENTS.soldOut.dish}</p>
              <p className="mt-0.5 text-[13px] text-ink-3">Bleibt auf der Karte, als ausverkauft markiert.</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="lg:absolute lg:top-[376px] lg:left-[3%] xl:left-[5%]">
          <div className="flex items-start gap-3">
            <IconDot icon={Tag} />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-3 text-[14px] font-medium text-ink">
                Preis geändert
                <span className="text-[13px] text-ink-3">{MOMENTS.price.time}</span>
              </p>
              <p className="mt-0.5 text-[13px] text-ink-2">{MOMENTS.price.dish}</p>
              <p className="mt-0.5 text-[13px] whitespace-nowrap text-ink-2">
                <s className="text-ink-3">{MOMENTS.price.from}</s> → {MOMENTS.price.to}
              </p>
              <div className="mt-2.5">
                <LiveBadge>jetzt auf der Karte</LiveBadge>
              </div>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="max-sm:hidden lg:absolute lg:top-[168px] lg:right-[4%] xl:right-[6%]">
          <div className="flex items-start gap-3">
            <IconDot icon={Nfc} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-ink">Handy an den Aufsteller</p>
              <p className="mt-0.5 text-[13px] text-ink-2">Die Karte öffnet sich, ganz ohne App.</p>
              <p className="mt-2.5 inline-flex rounded-full bg-sand px-2.5 py-1 font-mono text-[11px] text-ink-2">
                {RESTAURANT.path}
              </p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="max-sm:hidden lg:absolute lg:top-[432px] lg:right-[3%] xl:right-[5%]">
          <div className="flex items-start gap-3">
            <IconDot icon={ShieldCheck} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-ink">Allergene A bis R</p>
              <p className="mt-0.5 text-[13px] text-ink-2">Bei jedem Gericht, mit Legende.</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {EU_ALLERGENS.filter((a) => a.code === "A" || a.code === "R").map((a) => (
                  <li
                    key={a.code}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sand py-1 pr-2.5 pl-1 text-[12px] text-ink-2"
                  >
                    <span className="flex size-[18px] items-center justify-center rounded-full bg-paper font-mono text-[10px] font-semibold text-ink shadow-edge">
                      {a.code}
                    </span>
                    {a.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FloatCard>
      </div>

      <p className="mt-5 text-[12px] text-ink-3 lg:absolute lg:bottom-6 lg:left-7 lg:mt-0">
        {SAMPLE_LABEL}
      </p>
    </div>
  );
}

function FloatCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-card bg-paper p-4 shadow-float lg:w-[288px]", className)}>
      {children}
    </div>
  );
}

/**
 * A still of the guest menu in the default "Modern" look, drawn with the guest
 * tokens. It is the restaurant's surface, so it deliberately does not use the
 * product system around it — the contrast is the point.
 */
function Phone() {
  return (
    <div aria-hidden className="rounded-[46px] bg-ink p-[9px] shadow-float">
      <div className="relative h-[560px] overflow-hidden rounded-[38px] bg-guest-bg font-sans text-guest-ink sm:h-[600px]">
        <div className="flex h-11 items-center justify-between px-7 text-[13px] font-semibold">
          <span className="tabular-nums">9:41</span>
          <span className="absolute top-2.5 left-1/2 h-[26px] w-[84px] -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-4 rounded-[3px] border border-guest-ink/70" />
          </span>
        </div>

        <div className="px-5 pt-3 pb-4">
          <p className="font-display text-[26px] leading-tight">{RESTAURANT.name}</p>
          <p className="mt-1 text-[13px] text-guest-muted">{RESTAURANT.line}</p>
        </div>

        <div className="flex gap-2 overflow-hidden border-b border-guest-border px-5 pb-3">
          {GUEST_CATEGORIES.map((chip, i) => (
            <span
              key={chip}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium",
                i === 0
                  ? "border-brand bg-brand text-brand-ink"
                  : "border-guest-border bg-guest-surface text-guest-ink-2"
              )}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="px-5 pt-5">
          <p className="font-display text-[20px]">Vorspeisen</p>
          <p className="text-[13px] text-guest-muted">Zum Ankommen und Teilen</p>
          <ul className="mt-2">
            {STARTERS.map((row) => (
              <li
                key={row.name}
                className={cn(
                  "border-b border-guest-border py-3 last:border-b-0",
                  row.out && "opacity-60"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold">
                    <span className="truncate">{row.name}</span>
                    {row.featured ? (
                      <Star size={12} strokeWidth={2.25} className="shrink-0 fill-brand text-brand" />
                    ) : null}
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                    {row.price}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[13px] text-guest-muted">{row.text}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-guest-muted">
                    {row.codes.join(" ")}
                  </span>
                  {row.out ? (
                    <span className="rounded-full bg-guest-surface-2 px-2 py-0.5 text-[11px] font-semibold text-guest-ink-2">
                      Heute aus
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <span className="h-[5px] w-28 rounded-full bg-guest-ink/80" />
        </div>
      </div>
    </div>
  );
}
