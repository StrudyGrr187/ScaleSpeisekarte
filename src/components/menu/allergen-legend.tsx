"use client";

import type { GuestStrings } from "@/lib/guest-i18n";
import { Sheet } from "@/components/ui/sheet";

export function AllergenLegend({
  open,
  onClose,
  allergens,
  strings: t,
}: {
  open: boolean;
  onClose: () => void;
  allergens: { code: string; name: string }[];
  strings: GuestStrings;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={t.allergens} closeLabel={t.close}>
      <p className="mb-4 text-body text-guest-muted">{t.legendIntro}</p>
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
        {t.legendNote}
      </p>
    </Sheet>
  );
}
