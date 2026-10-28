import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleHelp,
  LayoutGrid,
  ListOrdered,
  Mail,
  PenLine,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { AppIcon, Wordmark } from "@/components/brand/wordmark";
import { brandFont } from "@/lib/brand-font";
import { cn } from "@/lib/utils";
import { Bento } from "@/components/marketing/bento";
import { EditorPreview } from "@/components/marketing/editor-preview";
import { CONTACT_URL, DEMO_MENU, MOMENTS } from "@/components/marketing/sample-data";
import { Stage } from "@/components/marketing/stage";
import {
  Chip,
  Section,
  SectionHead,
  buttonPrimary,
  buttonSecondary,
} from "@/components/marketing/ui";

export const metadata: Metadata = {
  title: { absolute: "ScaleMenu · Digitale Speisekarte mit QR-Code & NFC" },
  description:
    "Digitale Speisekarte für Restaurants, Cafés und Bars. Gäste scannen den QR-Code, du änderst Gerichte, Preise und Fotos jederzeit selbst.",
};

const NAV = [
  { href: "#beispiel", label: "Beispiel" },
  { href: "#karte", label: "Bearbeiten" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#fragen", label: "Fragen" },
];

const STEPS = [
  {
    title: "Du schickst uns deine Karte",
    text: "Als PDF, Foto oder Excel-Datei. Wir übernehmen Gerichte und Preise und richten das Design passend zu deinem Lokal ein.",
  },
  {
    title: "Der Code kommt auf den Tisch",
    text: "Als Tischaufsteller, Sticker oder mit NFC. Gedruckt wird er ein einziges Mal.",
  },
  {
    title: "Ab dann pflegst du sie selbst",
    text: "Neues Gericht, anderer Preis, heute aus: am Handy erledigt, bevor der nächste Gast bestellt.",
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
  "Öffnungszeiten und Kontaktdaten",
  "QR-Code und Freischaltung",
];

const FAQ = [
  {
    q: "Brauchen meine Gäste eine App?",
    a: "Nein. Kamera auf den QR-Code oder Handy an den Aufsteller halten, und die Karte öffnet sich im Browser.",
  },
  {
    q: "Muss ich neu drucken, wenn sich Preise ändern?",
    a: "Nein. Der Code führt immer zu deiner aktuellen Karte. Du änderst die Karte, der Code am Tisch bleibt derselbe.",
  },
  {
    q: "Was ändere ich selbst, was macht ihr?",
    a: "Gerichte, Preise, Fotos, Allergene und „Heute aus“ pflegst du selbst. Aufbau, Design, Öffnungszeiten und die Freischaltung übernehmen wir.",
  },
  {
    q: "Was mache ich, wenn ein Gericht aus ist?",
    a: "Du tippst auf „Heute aus“. Das Gericht bleibt auf der Karte, deine Gäste sehen aber sofort, dass es heute nichts mehr gibt.",
  },
  {
    q: "Können Gäste darüber auch bestellen?",
    a: "Noch nicht. ScaleMenu zeigt deine Karte. Bestellen und Bezahlen am Tisch gibt es derzeit nicht.",
  },
];

export default function LandingPage() {
  return (
    <div
      data-brand-root
      className={cn(brandFont.variable, "min-h-dvh bg-paper font-grotesk text-ink antialiased")}
    >
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Zum Inhalt
      </a>

      <header className="sticky top-0 z-40 border-b border-line-soft bg-paper">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="ScaleMenu Startseite"
            className="flex items-center gap-2.5 text-[19px] text-ink"
          >
            <AppIcon />
            <Wordmark />
          </Link>
          <nav aria-label="Hauptnavigation" className="flex items-center gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hidden h-10 items-center rounded-full px-3 text-[15px] text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink lg:inline-flex"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/admin/login"
              className="inline-flex h-10 items-center rounded-full px-3 text-[15px] text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink lg:ml-3"
            >
              Anmelden
            </Link>
            <Link
              href={DEMO_MENU}
              className="ml-1 hidden h-10 items-center rounded-full bg-ink px-4 text-[15px] font-medium text-paper shadow-button transition-colors duration-[var(--dur-fast)] hover:bg-ink-hover sm:inline-flex"
            >
              Beispielkarte ansehen
            </Link>
          </nav>
        </div>
      </header>

      <main id="inhalt">
        {/* ---------------- Hero: steht still, bewegt sich beim Laden nicht ---------------- */}
        <section className="mx-auto max-w-[1120px] px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
          <div className="flex flex-col items-center text-center">
            <Chip icon={UtensilsCrossed}>Digitale Speisekarte für die Gastronomie</Chip>
            <h1 className="mt-6 text-display text-balance">
              <span className="block text-ink">
                Um{" "}
                <span className="inline-block rounded-[0.2em] bg-paper px-[0.12em] leading-[1.06] shadow-edge">
                  <span
                    className="mr-[0.12em] inline-block size-[0.17em] -translate-y-[0.06em] rounded-full bg-signal align-middle"
                    aria-hidden
                  />
                  {MOMENTS.soldOut.time}
                </span>{" "}
                sind die Vongole aus.
              </span>
              <span className="mt-[0.06em] block text-ink-4">
                Ab {MOMENTS.soldOut.liveAt} fragt keiner mehr.
              </span>
            </h1>
            <p className="mt-7 max-w-[50ch] text-lead text-pretty text-ink-2">
              Deine Gäste öffnen die Karte am Handy, per QR-Code oder NFC. Ist ein Gericht aus
              oder ändert sich ein Preis, trägst du es selbst ein. Gedruckt wird nur der Code.
            </p>
            <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href={DEMO_MENU} className={buttonPrimary}>
                Beispielkarte ansehen
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
              </Link>
              <a href={CONTACT_URL} className={buttonSecondary}>
                Unverbindlich anfragen
              </a>
            </div>
            <p className="mt-6 text-[14px] text-ink-3">
              Ohne App · QR-Code und NFC · Allergene A bis R
            </p>
          </div>

          <div className="mt-14 sm:mt-16">
            <Stage />
          </div>
        </section>

        {/* ---------------- Karte bearbeiten ---------------- */}
        <Section id="karte">
          <SectionHead
            icon={PenLine}
            chip="Für dich"
            title={
              <>
                Am Handy geändert.
                <br />
                Am Tisch aktuell.
              </>
            }
            intro="Preise, Gerichte, Fotos und Allergene pflegst du selbst, am Handy oder am Laptop. Speichern, fertig. Wer die Karte danach öffnet, sieht den neuen Stand."
          />
          <div className="mt-12">
            <EditorPreview />
          </div>
        </Section>

        {/* ---------------- Funktionen ---------------- */}
        <Section id="funktionen" tone="canvas">
          <SectionHead
            centered
            icon={LayoutGrid}
            chip="Für deine Gäste"
            title={
              <>
                Was deine Gäste
                <br />
                am Tisch sehen.
              </>
            }
          />
          <div className="mt-12">
            <Bento />
          </div>
        </Section>

        {/* ---------------- Ablauf ---------------- */}
        <Section id="ablauf">
          <SectionHead
            icon={ListOrdered}
            chip="Ablauf"
            title={
              <>
                In drei Schritten
                <br />
                zur fertigen Karte.
              </>
            }
            intro="Du musst nichts abtippen. Wir richten alles ein, danach pflegst du nur noch deine Gerichte."
          />

          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-card bg-paper p-6 shadow-card" data-reveal>
                <span className="flex size-8 items-center justify-center rounded-full bg-sand text-[14px] font-medium text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-h3 text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-ink-2">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <RoleCard title="Das machst du" items={YOU} />
            <RoleCard title="Das machen wir" items={US} dark />
          </div>
        </Section>

        {/* ---------------- Fragen ---------------- */}
        <Section id="fragen" tone="canvas">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <Chip icon={CircleHelp}>Fragen</Chip>
              <h2 className="mt-5 text-h2 text-ink">
                Was Wirte als Erstes
                <br />
                wissen wollen.
              </h2>
            </div>

            <div>
              <div className="rounded-card bg-paper px-5 shadow-card sm:px-6">
                {FAQ.map((item) => (
                  <details
                    key={item.q}
                    className="group border-b border-line-soft last:border-b-0"
                  >
                    <summary className="flex min-h-16 list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-paper text-ink-2 shadow-edge transition-transform duration-[var(--dur-base)] group-open:rotate-45">
                        <Plus size={14} strokeWidth={1.75} aria-hidden />
                      </span>
                    </summary>
                    <p className="max-w-[56ch] pb-5 text-[15px] leading-[1.6] text-ink-2">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <a
                  href={CONTACT_URL}
                  className="flex items-center gap-3.5 rounded-card bg-paper p-4 shadow-card transition-colors duration-[var(--dur-fast)] hover:bg-sand"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand text-ink-2"
                    aria-hidden
                  >
                    <Mail size={17} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-[13px] text-ink-3">Etwas anderes? Schreib uns.</span>
                    <span className="block text-[16px] font-medium text-ink">
                      scaleevo.at/kontakt
                    </span>
                  </span>
                </a>
                <Link href={DEMO_MENU} className={buttonPrimary}>
                  Beispielkarte ansehen
                  <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <footer className="bg-ink text-on-ink-2">
        <div className="mx-auto max-w-[1120px] px-4 pt-16 pb-8 sm:px-6 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div className="flex items-center gap-3.5 text-[34px] text-on-ink sm:text-[44px]">
              <AppIcon className="size-11 sm:size-12" />
              <Wordmark tone="dark" />
            </div>
            <p className="max-w-[46ch] text-[15px] leading-[1.65]">
              Die Speisekarte fürs Handy, für Restaurants, Cafés und Bars. Deine Gäste öffnen
              sie am Tisch, du hältst sie selbst aktuell.
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-on-ink-line pt-6 text-[14px] sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Fußzeile" className="-ml-2 flex flex-wrap">
              <Link href={DEMO_MENU} className="inline-flex h-10 items-center px-2 hover:text-on-ink">
                Beispielkarte
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex h-10 items-center px-2 hover:text-on-ink"
              >
                Anmelden
              </Link>
              <a href="https://scaleevo.at" className="inline-flex h-10 items-center px-2 hover:text-on-ink">
                scaleevo.at
              </a>
            </nav>
            <p className="text-on-ink-3">ScaleMenu ist ein Produkt von ScaleEvo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Who does what: a white card for the owner, a black one for us. */
function RoleCard({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card p-6 sm:p-8",
        dark ? "bg-ink text-on-ink shadow-float" : "bg-paper text-ink shadow-card"
      )}
      data-reveal
    >
      <h3 className="text-h3">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={cn("flex items-center gap-3 text-[15px]", dark ? "text-on-ink-2" : "text-ink-2")}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                dark ? "bg-on-ink text-ink" : "bg-ink text-paper"
              )}
              aria-hidden
            >
              <Check size={12} strokeWidth={2.25} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
