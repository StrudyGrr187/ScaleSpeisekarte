import { cn } from "@/lib/utils";
import { EDITOR_CATEGORIES, MOMENTS, RESTAURANT, SAMPLE_LABEL, STARTERS } from "./sample-data";

/**
 * The owner's side of the hero: the dish editor, drawn in the product system.
 * It shows only what a restaurant login can really change — dishes, prices,
 * allergens, "Heute aus". Categories are listed, not editable, as in the app.
 */
export function EditorPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-card bg-paper shadow-card"
      data-reveal
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line-soft px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <p className="text-[15px] font-medium text-ink">Speisekarte</p>
          <span className="text-[13px] text-ink-3">{RESTAURANT.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-tint px-2.5 py-1 font-medium text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Online
          </span>
          <span>Gespeichert {MOMENTS.soldOut.time}</span>
          <span className="hidden md:inline">Deine Ansicht · {SAMPLE_LABEL}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1.5 overflow-hidden border-b border-line-soft p-3 md:flex-col md:border-r md:border-b-0">
          {EDITOR_CATEGORIES.map((cat, i) => (
            <span
              key={cat.name}
              className={cn(
                "flex shrink-0 items-center justify-between gap-3 rounded-field px-3 py-2 text-[14px]",
                i === 0 ? "bg-sand font-medium text-ink" : "text-ink-2",
                i > 2 && "max-md:hidden"
              )}
            >
              {cat.name}
              <span className="text-[12px] text-ink-3">{cat.count}</span>
            </span>
          ))}
        </nav>

        <ul className="divide-y divide-line-soft">
          {STARTERS.map((dish) => (
            <li
              key={dish.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5"
            >
              <div className={cn("min-w-0", dish.out && "opacity-55")}>
                <p className="truncate text-[15px] font-medium text-ink">{dish.name}</p>
                <p className="mt-0.5 truncate text-[13px] text-ink-3">{dish.text}</p>
                <p className="mt-2 flex gap-1">
                  {dish.codes.map((code) => (
                    <span
                      key={code}
                      className="flex size-5 items-center justify-center rounded-full bg-sand font-mono text-[10px] font-semibold text-ink-2"
                    >
                      {code}
                    </span>
                  ))}
                </p>
              </div>

              <span
                className={cn(
                  "w-[92px] rounded-field bg-paper px-3 py-2 text-right text-[14px] text-ink shadow-edge",
                  dish.out && "text-ink-3"
                )}
              >
                {dish.price}
              </span>

              <span className="col-span-2 flex items-center gap-2.5 text-[13px] text-ink-2 sm:col-span-1 sm:w-[112px] sm:justify-end">
                <span>Heute aus</span>
                <Switch on={Boolean(dish.out)} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-[22px] w-[38px] shrink-0 rounded-full transition-colors",
        on ? "bg-ink" : "bg-sand-deep"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-4 rounded-full bg-paper shadow-edge",
          on ? "left-[19px]" : "left-[3px]"
        )}
      />
    </span>
  );
}
