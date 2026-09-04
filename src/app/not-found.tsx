import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-guest-bg px-5">
      <div className="max-w-[420px] text-center">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-text"
          aria-hidden
        >
          <UtensilsCrossed size={22} strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 font-display text-hero text-guest-ink">Karte nicht gefunden</h1>
        <p className="mt-3 text-body text-guest-muted">
          Unter dieser Adresse liegt keine Speisekarte. Bitte prüfe den Link oder scanne den
          QR-Code am Tisch noch einmal.
        </p>
        <Link href="/" className={buttonClasses("secondary", "lg", "mt-6")}>
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
