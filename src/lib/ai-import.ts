import "server-only";

import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AppError } from "@/lib/action-result";
import { AI_MODEL, getAiClient, toAiError } from "@/lib/ai";
import { EU_ALLERGENS } from "@/lib/constants";
import { parsePrice } from "@/lib/money";

/**
 * Reads an existing menu (PDF or photo) and returns it as structured data for
 * review. Nothing is written to the database here — the owner confirms first.
 */

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/**
 * Prices come back as the literal printed string and are parsed by our own
 * parser. Letting the model emit a number invites locale guesses and rounding
 * we cannot audit; "12,50" stays "12,50" until parsePrice sees it.
 */
const ExtractionSchema = z.object({
  restaurantName: z
    .string()
    .nullable()
    .describe("Name des Restaurants, falls auf der Karte erkennbar, sonst null"),
  categories: z
    .array(
      z.object({
        name: z.string().describe("Name der Kategorie, z. B. Vorspeisen"),
        items: z.array(
          z.object({
            name: z.string().describe("Name des Gerichts, exakt wie gedruckt"),
            description: z
              .string()
              .nullable()
              .describe("Beschreibung/Zutaten, exakt wie gedruckt, sonst null"),
            priceText: z
              .string()
              .describe("Preis exakt wie gedruckt, z. B. '12,50' oder '8.90 €'"),
            allergenCodes: z
              .array(z.string())
              .describe(
                "NUR Allergen-Buchstaben, die auf der Karte tatsächlich beim Gericht stehen. Niemals raten."
              ),
          })
        ),
      })
    )
    .describe("Kategorien in der Reihenfolge der Vorlage"),
});

export type ImportedItem = {
  name: string;
  description: string | null;
  price: number;
  priceText: string;
  priceParsed: boolean;
  allergenCodes: string[];
};

export type ImportedCategory = { name: string; items: ImportedItem[] };

export type ImportResult = {
  restaurantName: string | null;
  categories: ImportedCategory[];
  itemCount: number;
  unparsedPrices: number;
};

const SYSTEM = `Du liest bestehende Restaurant-Speisekarten und gibst sie als strukturierte Daten zurück.

Regeln:
- Übernimm Namen und Beschreibungen WÖRTLICH. Formuliere nichts um, kürze nichts, ergänze nichts.
- Preise gibst du exakt so zurück, wie sie gedruckt sind, als Text.
- Gibt es zu einem Gericht mehrere Größen/Preise (z. B. 0,3 l / 0,5 l), lege pro Preis einen eigenen Eintrag an und schreibe die Größe in den Namen.
- Allergene: Übernimm NUR Buchstaben/Ziffern, die auf der Karte ausdrücklich beim Gericht stehen. Rate NIEMALS Allergene aus den Zutaten. Steht nichts da, gib eine leere Liste zurück.
- Erfinde keine Gerichte und keine Kategorien. Stehen Gerichte ohne Kategorie auf der Karte, nutze die Kategorie "Weitere".
- Ignoriere Fließtext wie Impressum, Öffnungszeiten oder Werbung.`;

export async function extractMenuFromFile(file: File): Promise<ImportResult> {
  if (!file || file.size === 0) throw new AppError("Keine Datei ausgewählt.");
  if (file.size > MAX_BYTES) throw new AppError("Die Datei ist zu groß (maximal 12 MB).");

  const isPdf = file.type === "application/pdf";
  const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type);
  if (!isPdf && !isImage) {
    throw new AppError("Bitte ein PDF oder ein Foto (JPG, PNG, WebP) hochladen.");
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  const source = isPdf
    ? ({
        type: "document" as const,
        source: { type: "base64" as const, media_type: "application/pdf" as const, data },
      })
    : ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: file.type as (typeof IMAGE_TYPES)[number],
          data,
        },
      });

  const allergenHint = EU_ALLERGENS.map((a) => `${a.code} = ${a.name}`).join(", ");

  try {
    const client = getAiClient();
    const response = await client.messages.parse({
      model: AI_MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: [
            source,
            {
              type: "text",
              text: `Lies diese Speisekarte vollständig aus.

Übliche Allergen-Kennzeichnung in Deutschland/Österreich: ${allergenHint}.
Übernimm solche Kennzeichen nur, wenn sie beim Gericht stehen.`,
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ExtractionSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) throw new AppError("Die Karte konnte nicht ausgelesen werden.");

    return normalise(parsed);
  } catch (error) {
    throw toAiError(error);
  }
}

const VALID_CODES: ReadonlySet<string> = new Set<string>(EU_ALLERGENS.map((a) => a.code));

function normalise(parsed: z.infer<typeof ExtractionSchema>): ImportResult {
  let itemCount = 0;
  let unparsedPrices = 0;

  const categories: ImportedCategory[] = parsed.categories
    .map((category) => ({
      name: category.name.trim().slice(0, 80) || "Weitere",
      items: category.items
        .filter((item) => item.name.trim().length > 0)
        .map((item) => {
          const price = parsePrice(item.priceText ?? "");
          if (price === null) unparsedPrices++;
          itemCount++;
          return {
            name: item.name.trim().slice(0, 120),
            description: item.description?.trim().slice(0, 600) || null,
            // An unreadable price becomes 0 and is flagged, never a guess.
            price: price ?? 0,
            priceText: item.priceText ?? "",
            priceParsed: price !== null,
            allergenCodes: [
              ...new Set(
                (item.allergenCodes ?? [])
                  .map((c) => c.trim().toUpperCase())
                  .filter((c) => VALID_CODES.has(c))
              ),
            ],
          };
        }),
    }))
    .filter((category) => category.items.length > 0);

  return {
    restaurantName: parsed.restaurantName?.trim() || null,
    categories,
    itemCount,
    unparsedPrices,
  };
}
