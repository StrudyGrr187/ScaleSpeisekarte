"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { applyPresetAction, skipOnboardingAction } from "@/app/actions/onboarding";
import { CategoryIcon } from "@/components/menu/category-icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CUISINE_PRESETS } from "@/lib/cuisine-presets";
import { deriveAccentTokens } from "@/lib/color";
import { cn } from "@/lib/utils";

/**
 * One screen, one decision. Picking a cuisine fills the menu with realistic
 * categories and dishes, so the owner starts by *editing* rather than by facing
 * an empty page — which is where most menu tools lose people.
 */
export function OnboardingWizard({ restaurantName }: { restaurantName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const preset = CUISINE_PRESETS.find((p) => p.key === selected);

  const apply = async () => {
    if (!selected) return;
    setPending(true);
    const result = await applyPresetAction(selected, preset?.accent);
    setPending(false);

    if (result.ok) {
      router.replace("/admin/builder");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  const skip = async () => {
    setPending(true);
    await skipOnboardingAction();
    setPending(false);
    router.replace("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-admin-bg px-5 py-12">
      <div className="mx-auto max-w-[720px]">
        <p className="text-admin-sm font-semibold tracking-[0.08em] text-admin-primary uppercase">
          Erste Schritte
        </p>
        <h1 className="mt-2 text-[28px] leading-tight font-semibold text-admin-ink">
          Womit fangen wir bei {restaurantName} an?
        </h1>
        <p className="mt-2 text-admin-base text-admin-muted">
          Wähle eine Vorlage — wir legen passende Kategorien und Beispielgerichte an. Du änderst
          danach nur noch Namen und Preise, statt alles neu zu tippen.
        </p>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {CUISINE_PRESETS.map((option) => {
            const active = selected === option.key;
            const tokens = deriveAccentTokens(option.accent);
            const itemCount = option.categories.reduce((sum, c) => sum + c.items.length, 0);

            return (
              <li key={option.key}>
                <button
                  type="button"
                  onClick={() => setSelected(option.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-admin-lg border bg-admin-surface p-4 text-left",
                    "transition-colors duration-[var(--dur-fast)]",
                    active
                      ? "border-admin-primary shadow-admin-focus"
                      : "border-admin-border hover:bg-[#fafafb]"
                  )}
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-admin"
                    style={{ backgroundColor: tokens.soft, color: tokens.text }}
                    aria-hidden
                  >
                    <CategoryIcon icon={option.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-admin-base font-semibold text-admin-ink">
                        {option.label}
                      </span>
                      {active ? (
                        <Check size={15} strokeWidth={2.5} className="text-admin-primary" aria-hidden />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-admin-sm text-admin-muted">
                      {option.description}
                    </span>
                    <span className="mt-1.5 block text-admin-sm text-admin-muted">
                      {option.categories.length} Kategorien
                      {itemCount > 0 ? ` · ${itemCount} Beispielgerichte` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={skip} disabled={pending}>
            Überspringen
          </Button>
          <Button size="lg" onClick={apply} disabled={!selected || pending}>
            {pending ? "Wird angelegt…" : "Speisekarte anlegen"}
            <ArrowRight size={16} strokeWidth={2} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
