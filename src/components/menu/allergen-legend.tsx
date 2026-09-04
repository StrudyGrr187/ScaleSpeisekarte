"use client";

import { Sheet } from "@/components/ui/sheet";

export function AllergenLegend({
  open,
  onClose,
  allergens,
}: {
  open: boolean;
  onClose: () => void;
  allergens: { code: string; name: string }[];
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Allergene">
      <p className="mb-4 text-body text-guest-muted">
        Die Buchstaben hinter einem Gericht verweisen auf enthaltene Allergene nach
        EU-Lebensmittelinformationsverordnung.
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
        {allergens.map((allergen) => (
          <div key={allergen.code} className="contents">
            <dt className="font-mono text-[14px] font-semibold tracking-[0.08em] text-brand-text">
              {allergen.code}
            </dt>
            <dd className="text-body text-guest-ink-2">{allergen.name}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-guest-border pt-4 text-[13px] leading-relaxed text-guest-muted">
        Bei Fragen zu Zutaten und Unverträglichkeiten sprechen Sie bitte unser Personal an.
      </p>
    </Sheet>
  );
}
