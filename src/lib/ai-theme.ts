import "server-only";

import { z } from "zod";
import { Type } from "@google/genai";
import { AppError } from "@/lib/action-result";
import {
  GEMINI_MODEL,
  generateWithRetry,
  getGeminiClient,
  toAiError,
} from "@/lib/ai";
import { contrastRatio, deriveAccentTokens, normalizeHex } from "@/lib/color";
import { DEFAULT_THEME, MENU_THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes";
import { DEFAULT_CUSTOM_THEME, type CustomTheme } from "@/lib/themes";
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
  customTheme: z.object({
    name: z.string().min(1).max(60),
    mood: z.string().min(1).max(120),
    background: z.string(),
    surface: z.string(),
    surfaceAlt: z.string(),
    ink: z.string(),
    muted: z.string(),
    border: z.string(),
    borderStrong: z.string(),
    radius: z.number().int().min(0).max(28),
    density: z.enum(["tight", "normal", "airy"]),
  }),
});

export type ThemeSuggestion = {
  accentColor: string;
  fontPair: FontPairKey;
  menuTheme: ThemeKey;
  rationale: string;
  /** True when the model's colour was replaced because it was unusable. */
  colorAdjusted: boolean;
  customTheme: CustomTheme;
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

Erzeuge zusätzlich immer einen eigenen Theme-Entwurf. Die Farben müssen zueinander passen und ausreichend Kontrast haben: dunkle Tinte auf hellem Hintergrund, keine Neonfarben. Nutze radius zwischen 0 und 28 und eine Dichte aus tight, normal oder airy.

Halte die Begründung sachlich und kurz.`;

const geminiSuggestionSchema = {
  type: Type.OBJECT,
  properties: {
    accentColor: {
      type: Type.STRING,
      description: "Akzentfarbe als Hex, z. B. #7A3B2E. Genau ein Farbwert.",
    },
    fontPair: {
      type: Type.STRING,
      description: "Schlüssel der Schriftpaarung",
    },
    menuTheme: {
      type: Type.STRING,
      description: "Schlüssel der Darstellung",
    },
    rationale: {
      type: Type.STRING,
      description: "Ein bis zwei Sätze auf Deutsch, warum das zum Restaurant passt. Kein Marketing.",
    },
    customTheme: {
      type: Type.OBJECT,
      description: "Ein eigener, in sich stimmiger Theme-Entwurf für die Gästekarte.",
      properties: {
        name: { type: Type.STRING, description: "Kurzer Name des individuellen Looks" },
        mood: { type: Type.STRING, description: "Kurze Stilbeschreibung" },
        background: { type: Type.STRING, description: "Hintergrundfarbe als Hex" },
        surface: { type: Type.STRING, description: "Flächenfarbe als Hex" },
        surfaceAlt: { type: Type.STRING, description: "Alternative Flächenfarbe als Hex" },
        ink: { type: Type.STRING, description: "Haupttextfarbe als Hex" },
        muted: { type: Type.STRING, description: "Sekundärtextfarbe als Hex" },
        border: { type: Type.STRING, description: "Feine Rahmenfarbe als Hex" },
        borderStrong: { type: Type.STRING, description: "Starke Rahmenfarbe als Hex" },
        radius: { type: Type.NUMBER, description: "Eckenradius zwischen 0 und 28 Pixel" },
        density: { type: Type.STRING, description: "Abstandsdichte: tight, normal oder airy" },
      },
      required: ["name", "mood", "background", "surface", "surfaceAlt", "ink", "muted", "border", "borderStrong", "radius", "density"],
    },
  },
  required: ["accentColor", "fontPair", "menuTheme", "rationale", "customTheme"],
};

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
    const ai = getGeminiClient();
    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Restaurant: ${restaurantName}
Beschreibung des Wirts: ${description}

Verfügbare Schriftpaarungen:
${options}

Schlage einen passenden Look vor.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema: geminiSuggestionSchema,
        },
      })
    );

    const text = response.text?.trim();
    if (!text) throw new AppError("Es kam kein verwertbarer Vorschlag zurück.");
    const parsed = SuggestionSchema.parse(JSON.parse(text));
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
    customTheme: normaliseCustomTheme(parsed.customTheme),
  };
}

function normaliseCustomTheme(theme: z.infer<typeof SuggestionSchema>["customTheme"]): CustomTheme {
  const color = (value: string, fallback: string) => normalizeHex(value) ?? fallback;
  return {
    name: theme.name.trim().slice(0, 60) || DEFAULT_CUSTOM_THEME.name,
    mood: theme.mood.trim().slice(0, 120) || DEFAULT_CUSTOM_THEME.mood,
    background: color(theme.background, DEFAULT_CUSTOM_THEME.background),
    surface: color(theme.surface, DEFAULT_CUSTOM_THEME.surface),
    surfaceAlt: color(theme.surfaceAlt, DEFAULT_CUSTOM_THEME.surfaceAlt),
    ink: color(theme.ink, DEFAULT_CUSTOM_THEME.ink),
    muted: color(theme.muted, DEFAULT_CUSTOM_THEME.muted),
    border: color(theme.border, DEFAULT_CUSTOM_THEME.border),
    borderStrong: color(theme.borderStrong, DEFAULT_CUSTOM_THEME.borderStrong),
    radius: Math.max(0, Math.min(28, Math.round(theme.radius))),
    density: theme.density,
  };
}
