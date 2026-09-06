import "server-only";

import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AppError } from "@/lib/action-result";
import { AI_MODEL, getAiClient, toAiError } from "@/lib/ai";
import { contrastRatio, deriveAccentTokens, normalizeHex } from "@/lib/color";
import { DEFAULT_THEME, MENU_THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes";
import { DEFAULT_FONT_PAIR, FONT_PAIRS, type FontPairKey } from "@/lib/fonts";

/**
 * Turns a sentence about the restaurant into a concrete look: accent colour,
 * font pairing and menu theme. The model proposes; nothing is applied until the
 * owner accepts, and every value is re-validated here — an unreadable or
 * unknown value can never reach the database.
 */

const SuggestionSchema = z.object({
  accentColor: z
    .string()
    .describe("Akzentfarbe als Hex, z. B. #7A3B2E. Genau ein Farbwert."),
  fontPair: z
    .enum(FONT_PAIRS.map((p) => p.key) as [FontPairKey, ...FontPairKey[]])
    .describe("Schlüssel der Schriftpaarung"),
  menuTheme: z
    .enum(THEME_KEYS as [ThemeKey, ...ThemeKey[]])
    .describe("Schlüssel der Darstellung"),
  rationale: z
    .string()
    .describe("Ein bis zwei Sätze auf Deutsch, warum das zum Restaurant passt. Kein Marketing."),
});

export type ThemeSuggestion = {
  accentColor: string;
  fontPair: FontPairKey;
  menuTheme: ThemeKey;
  rationale: string;
  /** True when the model's colour was replaced because it was unusable. */
  colorAdjusted: boolean;
};

const SYSTEM = `Du bist Art Director für Restaurant-Speisekarten und schlägst einen Look vor.

Du wählst genau drei Dinge: eine Akzentfarbe, eine Schriftpaarung und ein Theme.

Akzentfarbe:
- Sie wird sparsam eingesetzt: aktiver Kategorie-Chip, Empfehlungs-Badge, Aktionspreis, feine Trennlinie. Nie als große Fläche.
- Wähle satte, gedeckte Töne, die auf warmem Papier gut wirken. Keine Neonfarben, kein reines Schwarz, kein reines Weiß.
- Orientiere dich an Küche und Stimmung, nicht an Modetrends.

Theme — wähle genau einen Schlüssel:
${MENU_THEMES.map((t) => `- ${t.key}: ${t.mood}${t.archetype === "print" ? " (ohne Gerichtsfotos)" : ""}`).join("\n")}

Themes mit Bildern lohnen sich nur, wenn Fotos die Speisen verkaufen (Streetfood, Burger, Brunch, Kuchen). Trägt die Typografie mehr als das Bild, nimm eine der Druck-Darstellungen.

Halte die Begründung sachlich und kurz.`;

export async function suggestTheme(
  prompt: string,
  restaurantName: string
): Promise<ThemeSuggestion> {
  const description = prompt.trim();
  if (description.length < 3) {
    throw new AppError("Bitte beschreibe dein Restaurant in ein paar Worten.");
  }
  if (description.length > 500) {
    throw new AppError("Bitte kürzer fassen (maximal 500 Zeichen).");
  }

  const options = FONT_PAIRS.map((p) => `- ${p.key}: ${p.label} — ${p.mood}`).join("\n");

  try {
    const client = getAiClient();
    const response = await client.messages.parse({
      model: AI_MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `Restaurant: ${restaurantName}
Beschreibung des Wirts: ${description}

Verfügbare Schriftpaarungen:
${options}

Schlage einen passenden Look vor.`,
        },
      ],
      output_config: { format: zodOutputFormat(SuggestionSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) throw new AppError("Es kam kein verwertbarer Vorschlag zurück.");

    return validate(parsed);
  } catch (error) {
    throw toAiError(error);
  }
}

/**
 * The model is a design assistant, not a source of truth. A colour it returns
 * must still survive our own rules before it can be shown as a proposal.
 */
function validate(parsed: z.infer<typeof SuggestionSchema>): ThemeSuggestion {
  const normalized = normalizeHex(parsed.accentColor);

  // Reject near-white and near-black: both collapse the accent into the page.
  const unusable =
    !normalized ||
    contrastRatio(normalized, "#ffffff") < 1.6 ||
    contrastRatio(normalized, "#000000") < 1.6;

  const accentColor = unusable ? "#b4472a" : normalized;

  // deriveAccentTokens guarantees readable foregrounds for whatever we keep.
  deriveAccentTokens(accentColor, parsed.menuTheme);

  return {
    accentColor,
    fontPair: FONT_PAIRS.some((p) => p.key === parsed.fontPair)
      ? parsed.fontPair
      : DEFAULT_FONT_PAIR,
    menuTheme: THEME_KEYS.includes(parsed.menuTheme) ? parsed.menuTheme : DEFAULT_THEME,
    rationale: parsed.rationale.trim().slice(0, 400),
    colorAdjusted: unusable,
  };
}
