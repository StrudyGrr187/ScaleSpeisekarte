"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Globe } from "lucide-react";
import type { GuestStrings } from "@/lib/guest-i18n";
import { languageInfo, SOURCE_LANGUAGE, type LanguageCode } from "@/lib/languages";
import type { Archetype } from "@/lib/themes";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Top-right language button and its sheet. Each language is listed in its own
 * name and script — a guest scans for "Italiano", not for "Italienisch". The
 * entries are plain links: the server renders the menu in the chosen language,
 * and the URL can be shared or bookmarked as it is.
 */
export function LanguageSwitcher({
  slug,
  language,
  languages,
  strings: t,
  archetype,
  className,
}: {
  slug: string;
  language: LanguageCode;
  languages: LanguageCode[];
  strings: GuestStrings;
  archetype: Archetype;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = languageInfo(language);
  const classic = archetype === "print";

  return (
    <>
      <button
        type="button"
        data-chrome
        onClick={() => setOpen(true)}
        aria-label={`${t.language}: ${current.label}`}
        aria-haspopup="dialog"
        className={cn(
          "flex h-11 items-center gap-1.5 border px-3.5 text-[13px] font-semibold tracking-[0.06em] uppercase",
          classic
            ? "border-guest-border-strong bg-guest-bg text-guest-ink-2"
            : "rounded-full border-guest-border bg-guest-surface/90 text-guest-ink-2 shadow-sm backdrop-blur-[8px] active:bg-guest-surface-2",
          className
        )}
      >
        <Globe size={16} strokeWidth={1.75} aria-hidden />
        {language}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t.language} closeLabel={t.close}>
        <ul className="divide-y divide-guest-border">
          {languages.map((code) => {
            const info = languageInfo(code);
            const active = code === language;
            return (
              <li key={code}>
                <Link
                  href={`/menu/${slug}?lang=${code}`}
                  replace
                  scroll={false}
                  lang={info.htmlLang}
                  hrefLang={info.htmlLang}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between gap-4 py-2 text-body text-guest-ink active:bg-guest-surface-2"
                >
                  <span className={active ? "font-semibold" : undefined}>{info.label}</span>
                  {active ? (
                    <Check size={18} strokeWidth={2} aria-hidden className="text-brand-text" />
                  ) : (
                    <span
                      className="font-mono text-[12px] tracking-[0.14em] text-guest-faint uppercase"
                      aria-hidden
                    >
                      {code}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {language !== SOURCE_LANGUAGE ? (
          <p className="mt-4 border-t border-guest-border pt-4 text-[13px] leading-relaxed text-guest-muted">
            {t.machineTranslated}
          </p>
        ) : null}
      </Sheet>
    </>
  );
}
