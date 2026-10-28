/**
 * Languages a guest menu can be read in.
 *
 * German is the source: the owner writes every dish in German, and every other
 * language is a machine translation of that text (src/lib/translation.ts).
 * Adding a language means one entry here and one block in guest-i18n.ts.
 *
 * Right-to-left scripts (Arabic, Hebrew, Persian) are deliberately absent: the
 * guest layout is not mirrored, and a half-mirrored menu reads worse than a
 * German one.
 */

export const SOURCE_LANGUAGE = "de";

export const MENU_LANGUAGES = [
  { code: "de", label: "Deutsch", germanLabel: "Deutsch", htmlLang: "de" },
  { code: "en", label: "English", germanLabel: "Englisch", htmlLang: "en" },
  { code: "fr", label: "Français", germanLabel: "Französisch", htmlLang: "fr" },
  { code: "it", label: "Italiano", germanLabel: "Italienisch", htmlLang: "it" },
  { code: "es", label: "Español", germanLabel: "Spanisch", htmlLang: "es" },
  { code: "nl", label: "Nederlands", germanLabel: "Niederländisch", htmlLang: "nl" },
  { code: "pl", label: "Polski", germanLabel: "Polnisch", htmlLang: "pl" },
  { code: "tr", label: "Türkçe", germanLabel: "Türkisch", htmlLang: "tr" },
  { code: "ru", label: "Русский", germanLabel: "Russisch", htmlLang: "ru" },
  { code: "uk", label: "Українська", germanLabel: "Ukrainisch", htmlLang: "uk" },
  { code: "zh", label: "中文", germanLabel: "Chinesisch", htmlLang: "zh-Hans" },
  { code: "ja", label: "日本語", germanLabel: "Japanisch", htmlLang: "ja" },
] as const;

export type LanguageCode = (typeof MENU_LANGUAGES)[number]["code"];
export type TargetLanguage = Exclude<LanguageCode, typeof SOURCE_LANGUAGE>;
export type LanguageInfo = (typeof MENU_LANGUAGES)[number];

export const TARGET_LANGUAGES = MENU_LANGUAGES.filter(
  (l): l is Extract<LanguageInfo, { code: TargetLanguage }> => l.code !== SOURCE_LANGUAGE
);

export function isTargetLanguage(value: string): value is TargetLanguage {
  return TARGET_LANGUAGES.some((l) => l.code === value);
}

export function languageInfo(code: LanguageCode): LanguageInfo {
  return MENU_LANGUAGES.find((l) => l.code === code) ?? MENU_LANGUAGES[0];
}

/** Stored or submitted codes → known target languages, deduplicated, in registry order. */
export function normalizeLanguages(codes: readonly string[]): TargetLanguage[] {
  const wanted = new Set(codes);
  return TARGET_LANGUAGES.filter((l) => wanted.has(l.code)).map((l) => l.code);
}

/**
 * Picks the language a guest sees. An explicit `?lang=` wins, then the phone's
 * own language order (Accept-Language), then German. Only languages the
 * restaurant offers are eligible, so a request can never conjure up an
 * untranslated page.
 */
export function resolveGuestLanguage(
  requested: string | undefined,
  acceptLanguage: string | null,
  offered: readonly LanguageCode[]
): LanguageCode {
  const offeredSet = new Set<string>(offered);
  if (requested && offeredSet.has(requested)) return requested as LanguageCode;

  for (const tag of preferredLanguages(acceptLanguage)) {
    if (offeredSet.has(tag)) return tag as LanguageCode;
  }
  return SOURCE_LANGUAGE;
}

/** "en-US,en;q=0.9,de;q=0.8" → ["en", "de"], highest preference first. */
function preferredLanguages(header: string | null): string[] {
  if (!header) return [];

  return header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return {
        tag: tag.trim().toLowerCase().split("-")[0] ?? "",
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.tag);
}
