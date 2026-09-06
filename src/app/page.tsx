import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Nfc, PencilRuler, QrCode, Smartphone } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ScaleSpeisekarte · Digitale Speisekarten mit QR & NFC",
};

const FEATURES = [
  {
    icon: PencilRuler,
    title: "Karte selbst bauen",
    text: "Kategorien und Gerichte per Drag & Drop, Preise direkt in der Zeile ändern. Kein Ticket, kein Designer.",
  },
  {
    icon: Smartphone,
    title: "Für das Handy gemacht",
    text: "Die Gastansicht lädt in unter einer Sekunde — auch ohne ein einziges Foto und mit einem LTE-Balken.",
  },
  {
    icon: QrCode,
    title: "QR-Code, der bleibt",
    text: "Der Code zeigt auf eine feste Adresse. Karte ändern, so oft du willst — nichts muss neu gedruckt werden.",
  },
  {
    icon: Nfc,
    title: "NFC ohne Extraarbeit",
    text: "Plaketten zeigen auf dieselbe Adresse wie der QR-Code. Antippen, Karte öffnet sich, keine App.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-guest-bg">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5">
        <span className="text-admin-h2 font-semibold text-guest-ink">ScaleSpeisekarte</span>
        <nav className="flex items-center gap-2">
          <Link href="/admin/login" className={buttonClasses("primary", "md")}>
            Anmelden
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-20">
        <section className="py-14 sm:py-20">
          <p className="text-meta font-semibold tracking-[0.06em] text-guest-muted uppercase">
            Für Restaurants, Cafés und Bars
          </p>
          <h1 className="mt-4 max-w-[16ch] font-display text-[40px] leading-[1.08] text-balance text-guest-ink sm:text-[56px]">
            Die Speisekarte, die immer aktuell ist.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[18px] leading-relaxed text-guest-ink-2">
            Karte im Browser pflegen, veröffentlichen, fertig. Der Gast scannt den QR-Code am Tisch
            und sieht sofort deine aktuellen Gerichte, Preise und Allergene.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin/login" className={buttonClasses("primary", "lg")}>
              Zum Login
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/menu/cafe-milano"
              className="inline-flex h-11 items-center gap-2 rounded-admin border border-guest-border-strong bg-guest-surface px-5 text-admin-base font-semibold text-guest-ink transition-colors hover:bg-guest-surface-2"
            >
              Beispielkarte ansehen
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-guest-lg border border-guest-border bg-guest-surface p-6"
            >
              <span
                className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-text"
                aria-hidden
              >
                <feature.icon size={19} strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 text-[17px] font-semibold text-guest-ink">{feature.title}</h2>
              <p className="mt-2 text-body text-guest-muted">{feature.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-guest-border px-5 py-8">
        <p className="mx-auto max-w-[1100px] text-[13px] text-guest-muted">
          ScaleSpeisekarte — digitale Speisekarten mit QR-Code und NFC.
        </p>
      </footer>
    </div>
  );
}
