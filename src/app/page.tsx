import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Nfc,
  Palette,
  QrCode,
  ShieldCheck,
  Smartphone,
  Star,
  ToggleRight,
} from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "ScaleMenu · Digitale Speisekarte mit QR-Code & NFC" },
  description:
    "Digitale Speisekarte für Restaurants, Cafés und Bars. Gäste scannen den QR-Code, du änderst Gerichte, Preise und Fotos jederzeit selbst.",
};

const DEMO_MENU = "/menu/cafe-milano";
const CONTACT_URL = "https://scaleevo.at/kontakt/";

const STEPS = [
  {
    title: "Wir richten deine Karte ein",
    text: "Kategorien, Gerichte, Design in deiner Farbe. Du bekommst einen fertigen Zugang.",
  },
  {
    title: "QR-Code auf den Tisch",
    text: "Als Aufsteller, Sticker oder NFC-Plakette. Gedruckt wird einmal.",
  },
  {
    title: "Du hältst sie aktuell",
    text: "Neues Gericht, anderer Preis, frisches Foto: vom Handy oder Laptop, sofort online.",
  },
];

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ToggleRight,
    title: "„Heute aus“ mit einem Tipp",
    text: "Ausverkauft? Das Gericht bleibt sichtbar und ist für den Abend markiert.",
  },
  {
    icon: ShieldCheck,
    title: "Allergene A bis R",
    text: "Kennzeichnung nach EU-Verordnung, mit Legende direkt auf der Karte.",
  },
  {
    icon: Palette,
    title: "Zehn Looks",
    text: "Von modern bis klassisch gedruckt. In deiner Farbe und immer gut lesbar.",
  },
  {
    icon: QrCode,
    title: "Ein Code für immer",
    text: "Im QR-Code steht nur die Adresse. Die Karte dahinter änderst du, so oft du willst.",
  },
  {
    icon: Nfc,
    title: "NFC am Tisch",
    text: "Handy an die Plakette halten, die Karte ist offen. Ohne App.",
  },
  {
    icon: Smartphone,
    title: "Gemacht fürs Handy",
    text: "Eine leichte Seite mit großer Schrift statt eines PDFs zum Zoomen.",
  },
];

const YOU = [
  "Gerichte anlegen und ändern",
  "Preise und Beschreibungen",
  "Fotos",
  "„Heute aus“ und Allergene",
];
const US = [
  "Kategorien und Aufbau",
  "Design, Schrift und Farbe",
  "Restaurantdaten und Öffnungszeiten",
  "QR-Code und Veröffentlichung",
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-guest-bg text-guest-ink">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-guest-sm focus:bg-guest-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Zum Inhalt
      </a>

      <header className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" aria-label="ScaleMenu Startseite" className="text-[22px] text-guest-ink">
          <Wordmark />
        </Link>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-1">
          <a
            href="#funktionen"
            className="hidden h-11 items-center rounded-guest-sm px-3 text-[15px] font-medium text-guest-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-guest-ink md:inline-flex"
          >
            Funktionen
          </a>
          <a
            href="#ablauf"
            className="hidden h-11 items-center rounded-guest-sm px-3 text-[15px] font-medium text-guest-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-guest-ink md:inline-flex"
          >
            So läuft’s
          </a>
          <Link href="/admin/login" className={cn(outlineButton, "ml-1 h-11 px-4")}>
            Anmelden
          </Link>
        </nav>
      </header>

      <main id="inhalt">
        {/* ---------------- Hero ---------------- */}
        <section className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:pt-14 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-guest-border bg-guest-surface px-3 py-1 text-[13px] font-medium text-guest-ink-2">
              <span className="size-1.5 rounded-full bg-scale" aria-hidden />
              Für Restaurants, Cafés und Bars
            </p>
            <h1 className="mt-5 max-w-[14ch] font-display text-[42px] leading-[1.04] tracking-[-0.02em] text-balance sm:text-[60px]">
              Deine Karte. Immer aktuell.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[18px] leading-[1.6] text-guest-ink-2">
              Gäste scannen den Code am Tisch und sehen Gerichte, Preise und Allergene auf dem
              Handy. Ändert sich etwas, änderst du es selbst. Neu gedruckt wird nichts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={DEMO_MENU} className={cn(primaryButton, "h-12 px-6 text-[16px]")}>
                Beispielkarte ansehen
                <ArrowRight size={18} strokeWidth={2} aria-hidden />
              </Link>
              <a href={CONTACT_URL} className={cn(outlineButton, "h-12 px-6 text-[16px]")}>
                Zugang anfragen
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-guest-muted">
              {["Keine App für Gäste", "QR-Code und NFC", "Allergene nach EU-Verordnung"].map(
                (point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <Check size={15} strokeWidth={2.25} aria-hidden className="text-scale" />
                    {point}
                  </li>
                )
              )}
            </ul>
          </div>

          <PhoneMock />
        </section>

        {/* ---------------- Ablauf ---------------- */}
        <section id="ablauf" className="scroll-mt-6 border-y border-guest-border bg-guest-surface">
          <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 lg:py-24">
            <SectionHead eyebrow="So läuft’s" title="In drei Schritten am Tisch." />
            <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="relative rounded-guest-lg border border-guest-border bg-guest-bg p-6"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-guest-ink font-mono text-[14px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[16px] leading-[1.55] text-guest-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Funktionen ---------------- */}
        <section
          id="funktionen"
          className="mx-auto max-w-[1120px] scroll-mt-6 px-4 py-16 sm:px-6 lg:py-24"
        >
          <SectionHead eyebrow="Funktionen" title="Alles, was eine Karte am Tisch braucht." />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-guest-lg border border-guest-border bg-guest-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="bg-guest-surface p-6">
                <span
                  className="flex size-10 items-center justify-center rounded-guest-sm bg-scale-soft text-scale"
                  aria-hidden
                >
                  <feature.icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-[16px] leading-[1.55] text-guest-muted">{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- Wer macht was ---------------- */}
        <section className="mx-auto max-w-[1120px] px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="grid gap-4 rounded-guest-lg border border-guest-border bg-guest-surface p-6 sm:p-10 lg:grid-cols-[1fr_1fr_1fr] lg:gap-10">
            <div>
              <p className="text-meta font-semibold tracking-[0.08em] text-scale uppercase">
                Aufgeteilt
              </p>
              <h2 className="mt-3 font-display text-[28px] leading-[1.15] tracking-[-0.01em] sm:text-[32px]">
                Deine Gerichte pflegst du. Den Rest machen wir.
              </h2>
            </div>
            <RoleList title="Du" items={YOU} />
            <RoleList title="Wir" items={US} muted />
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="bg-guest-ink text-white">
          <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
            <div>
              <h2 className="max-w-[20ch] font-display text-[32px] leading-[1.1] tracking-[-0.01em] text-balance sm:text-[40px]">
                Am besten auf dem eigenen Handy ansehen.
              </h2>
              <p className="mt-3 max-w-[48ch] text-[17px] leading-[1.6] text-[#c9bfb5]">
                Die Beispielkarte von Café Milano läuft genau so, wie sie bei deinen Gästen laufen
                würde.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href={DEMO_MENU} className={cn(primaryButton, "h-12 px-6 text-[16px]")}>
                Beispielkarte öffnen
                <ArrowRight size={18} strokeWidth={2} aria-hidden />
              </Link>
              <a
                href={CONTACT_URL}
                className="inline-flex h-12 items-center justify-center rounded-guest-sm border border-white/25 px-6 text-[16px] font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-white/10"
              >
                Zugang anfragen
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-guest-ink text-[#c9bfb5]">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 border-t border-white/10 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3 text-[14px]">
            <Wordmark tone="dark" className="text-[17px] text-white" />
            <span>Ein Produkt von ScaleEvo</span>
          </div>
          <nav aria-label="Fußzeile" className="flex gap-1 text-[14px]">
            <Link href={DEMO_MENU} className="inline-flex h-11 items-center px-2 hover:text-white">
              Beispielkarte
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex h-11 items-center px-2 hover:text-white"
            >
              Anmelden
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-guest-sm bg-scale font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-scale-hover";
const outlineButton =
  "inline-flex items-center justify-center gap-2 rounded-guest-sm border border-guest-border-strong bg-guest-surface text-[15px] font-semibold text-guest-ink transition-colors duration-[var(--dur-fast)] hover:bg-guest-surface-2";

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-meta font-semibold tracking-[0.08em] text-scale uppercase">{eyebrow}</p>
      <h2 className="mt-3 max-w-[22ch] font-display text-[32px] leading-[1.12] tracking-[-0.01em] text-balance sm:text-[40px]">
        {title}
      </h2>
    </div>
  );
}

function RoleList({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className="border-t border-guest-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[16px] text-guest-ink-2">
            <span
              className={cn(
                "mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full",
                muted ? "bg-guest-surface-2 text-guest-muted" : "bg-scale-soft text-scale"
              )}
              aria-hidden
            >
              <Check size={12} strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A still of the guest menu, drawn with the same tokens the real one uses. The
 * dishes are the seeded Café Milano card, so the picture matches the live demo
 * one click away.
 */
function PhoneMock() {
  const rows = [
    {
      name: "Bruschetta Classica",
      text: "Sauerteigbrot, Tomaten, Basilikum",
      price: "7,90 €",
      codes: "A",
    },
    {
      name: "Vitello Tonnato",
      text: "Kalbfleisch, Thunfisch-Kapern-Creme",
      price: "12,90 €",
      codes: "C D",
      featured: true,
    },
    {
      name: "Burrata Pugliese",
      text: "Ochsenherztomaten, Basilikumöl",
      price: "11,90 €",
      codes: "G",
    },
    {
      name: "Vongole in Weißwein",
      text: "Venusmuscheln, Knoblauch, Ciabatta",
      price: "13,90 €",
      codes: "A R",
      out: true,
    },
  ];

  return (
    <figure className="relative mx-auto w-full max-w-[340px] lg:max-w-none">
      <figcaption className="sr-only">
        Beispiel: die Speisekarte von Café Milano auf dem Handy.
      </figcaption>
      <div
        aria-hidden
        className="rounded-[44px] bg-[#17181c] p-[10px] shadow-[0_40px_80px_-30px_rgb(26_22_20/0.45)]"
      >
        <div className="overflow-hidden rounded-[34px] bg-guest-bg">
          <div className="flex h-7 items-center justify-center">
            <span className="h-[5px] w-16 rounded-full bg-[#17181c]/15" />
          </div>

          <div className="px-5 pt-3 pb-4">
            <p className="font-display text-[26px] leading-tight">Café Milano</p>
            <p className="mt-1 text-[13px] text-guest-muted">
              Italienische Küche · heute bis 23:00
            </p>
          </div>

          <div className="flex gap-2 overflow-hidden border-b border-guest-border px-5 pb-3">
            {["Vorspeisen", "Hauptgerichte", "Pizza", "Pasta"].map((chip, i) => (
              <span
                key={chip}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium",
                  i === 0
                    ? "border-scale bg-scale text-white"
                    : "border-guest-border bg-guest-surface text-guest-ink-2"
                )}
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="px-5 pt-5 pb-6">
            <p className="font-display text-[20px]">Vorspeisen</p>
            <p className="text-[13px] text-guest-muted">Zum Ankommen und Teilen</p>
            <ul className="mt-2">
              {rows.map((row) => (
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
                        <Star
                          size={12}
                          strokeWidth={2.25}
                          className="shrink-0 fill-scale text-scale"
                        />
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                      {row.price}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-guest-muted">{row.text}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-guest-muted">{row.codes}</span>
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
        </div>
      </div>

      {/* The owner's side of the same moment: one switch, and the row above changes. */}
      <div
        aria-hidden
        className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-guest border border-guest-border bg-guest-surface py-3 pr-4 pl-3 shadow-guest-raise sm:-left-10"
      >
        <span className="flex size-9 items-center justify-center rounded-guest-sm bg-scale-soft text-scale">
          <ToggleRight size={18} strokeWidth={1.75} />
        </span>
        <span>
          <span className="block text-[13px] font-semibold">Vongole in Weißwein</span>
          <span className="block text-[12px] text-guest-muted">auf „Heute aus“ gesetzt</span>
        </span>
      </div>
    </figure>
  );
}
