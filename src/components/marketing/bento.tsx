import { Nfc } from "lucide-react";
import { cn } from "@/lib/utils";
import { EU_ALLERGENS } from "@/lib/constants";
import { LOOKS, MOMENTS, RESTAURANT, starter } from "./sample-data";

/**
 * Feature cards with small product graphics instead of icons: each picture is a
 * piece of the real surface the sentence below it talks about.
 */
export function Bento() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      <BentoCard
        title="Sieht aus wie dein Lokal"
        text="Zehn Designs, dazu deine Farbe und deine Schrift. Wir stimmen alles auf dein Lokal ab."
      >
        <LooksGraphic />
      </BentoCard>
      <BentoCard
        title="Ein Code, der bleibt"
        text="Im Code steckt nur der Link zu deiner Karte. Die Karte änderst du, so oft du willst. Der Aufsteller bleibt am Tisch."
      >
        <CodeGraphic />
      </BentoCard>
      <BentoCard
        title="Allergene von A bis R"
        text="Jedes Gericht trägt seine Buchstaben, die Legende steht gleich dabei. Ein Extrablatt brauchst du nicht mehr."
      >
        <AllergenGraphic />
      </BentoCard>
    </ul>
  );
}

function BentoCard({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-card bg-paper p-2.5 shadow-card" data-reveal>
      <div
        aria-hidden
        className="flex h-[184px] items-center justify-center overflow-hidden rounded-tile bg-canvas shadow-[inset_0_0_0_1px_var(--color-line-soft)]"
      >
        {children}
      </div>
      <div className="px-3.5 pt-5 pb-4">
        <h3 className="text-h3 text-ink">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-[1.6] text-ink-2">{text}</p>
      </div>
    </li>
  );
}

const dish = starter("Vitello Tonnato");

function LooksGraphic() {
  return (
    <div className="flex w-[264px] flex-col gap-2">
      {LOOKS.map((look) => (
        <div key={look.label} className="flex items-center gap-2.5">
          <span className="w-[62px] shrink-0 text-right text-[11px] text-ink-3">{look.label}</span>
          <div
            className="flex min-w-0 flex-1 items-baseline gap-2 rounded-[10px] px-3 py-2 shadow-edge"
            style={{ background: look.paper, color: look.ink }}
          >
            <span
              className="truncate text-[15px] leading-tight"
              style={{ fontFamily: look.display }}
            >
              {dish.name}
            </span>
            {look.leader ? (
              <span
                className="min-w-2 flex-1 translate-y-[-3px] border-b border-dotted"
                style={{ borderColor: look.muted }}
              />
            ) : (
              <span className="flex-1" />
            )}
            <span
              className="shrink-0 text-[13px] font-semibold tabular-nums"
              style={{ fontFamily: look.body, color: look.accent }}
            >
              {dish.price.replace(" €", "")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeGraphic() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-[112px] flex-col items-center gap-2.5 rounded-[16px] bg-paper px-3 pt-3.5 pb-3 shadow-card">
        <QrPattern className="size-[78px]" />
        <span className="flex items-center gap-1 text-[10px] font-medium text-ink-2">
          <Nfc size={12} strokeWidth={1.75} />
          Speisekarte
        </span>
      </div>
      <div className="flex flex-col gap-2 text-[11px]">
        <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-ink-2 shadow-edge">
          {RESTAURANT.path}
        </span>
        <span className="pl-2.5 text-ink-3">Der Code bleibt,</span>
        <span className="pl-2.5 text-ink-3">die Karte ändert sich.</span>
      </div>
    </div>
  );
}

function AllergenGraphic() {
  const vongole = starter(MOMENTS.soldOut.dish);
  const legend = EU_ALLERGENS.filter((a) => ["A", "G", "R"].includes(a.code));
  return (
    <div className="w-[248px] rounded-[12px] bg-guest-bg px-3.5 py-3 font-sans text-guest-ink shadow-edge">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold">{vongole.name}</span>
        <span className="text-[13px] font-semibold tabular-nums">{vongole.price}</span>
      </div>
      <p className="mt-0.5 font-mono text-[11px] text-guest-muted">{vongole.codes.join(" ")}</p>
      <ul className="mt-2.5 space-y-1 border-t border-guest-border pt-2.5">
        {legend.map((a) => (
          <li
            key={a.code}
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              vongole.codes.includes(a.code) ? "text-guest-ink" : "text-guest-faint"
            )}
          >
            <span className="w-2.5 font-mono font-semibold">{a.code}</span>
            {a.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A QR-shaped picture, not a working code: three finder squares and a fixed,
 * pseudo-random module pattern so server and client always draw the same thing.
 */
const QR_SIZE = 21;
const QR_MODULES = (() => {
  const cells: [number, number][] = [];
  let seed = 7;
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (seed * 16807) % 2147483647;
      if (!inFinder(x, y) && seed % 100 < 46) cells.push([x, y]);
    }
  }
  return cells;
})();

function QrPattern({ className }: { className?: string }) {
  const finders = [
    [0, 0],
    [QR_SIZE - 7, 0],
    [0, QR_SIZE - 7],
  ];
  return (
    <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} className={className} shapeRendering="crispEdges">
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#0b0b0c">
          <path d={`M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
      {QR_MODULES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b0b0c" />
      ))}
    </svg>
  );
}
