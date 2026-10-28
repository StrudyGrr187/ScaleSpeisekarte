import "server-only";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  GEMINI_MODEL,
  generateWithRetry,
  getGeminiClient,
  isAiConfigured,
  toAiError,
} from "@/lib/ai";
import {
  languageInfo,
  normalizeLanguages,
  SOURCE_LANGUAGE,
  type LanguageCode,
  type TargetLanguage,
} from "@/lib/languages";

/**
 * Machine translation of the owner's German text.
 *
 * Each translatable row — category, dish, the restaurant's tagline — carries a
 * `translations` JSON keyed by language. Every entry remembers a fingerprint of
 * the German it was made from. Once the owner edits the German, the fingerprint
 * no longer matches and guests see the German original until a fresh
 * translation lands: a stale translation could still name an ingredient the
 * dish no longer has, and for an allergic guest German is the safe failure.
 */

export type TranslationEntry = {
  name?: string;
  description?: string | null;
  /** Fingerprint of the German source this entry was translated from. */
  src: string;
};

type Source = { name?: string | null; description?: string | null };

export function fingerprint(source: Source): string {
  return createHash("sha1")
    .update(`${source.name ?? ""}\u0000${source.description ?? ""}`)
    .digest("base64url")
    .slice(0, 16);
}

function entryFor(stored: unknown, lang: TargetLanguage): TranslationEntry | null {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return null;
  const entry = (stored as Record<string, unknown>)[lang];
  if (!entry || typeof entry !== "object" || typeof (entry as TranslationEntry).src !== "string") {
    return null;
  }
  return entry as TranslationEntry;
}

/** The translation for `lang`, or null when there is none or it was made from older German. */
export function currentTranslation(
  stored: unknown,
  lang: TargetLanguage,
  source: Source
): TranslationEntry | null {
  const entry = entryFor(stored, lang);
  return entry && entry.src === fingerprint(source) ? entry : null;
}

/**
 * Name and description in `lang`, each falling back to the German original.
 * German itself passes straight through.
 */
export function localize(
  source: { name: string; description: string | null; translations: unknown },
  lang: LanguageCode
): { name: string; description: string | null } {
  if (lang === SOURCE_LANGUAGE) return { name: source.name, description: source.description };
  const entry = currentTranslation(source.translations, lang, source);
  return {
    name: entry?.name || source.name,
    description: source.description ? entry?.description || source.description : null,
  };
}

/* ------------------------------------------------------------------ *
 * What needs translating
 * ------------------------------------------------------------------ */

type UnitKind = "restaurant" | "category" | "item";

type Unit = {
  kind: UnitKind;
  id: string;
  name: string | null;
  description: string | null;
  translations: unknown;
};

async function loadUnits(restaurantId: string) {
  const [restaurant, categories, items] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, description: true, translations: true, languages: true },
    }),
    prisma.category.findMany({
      where: { menu: { restaurantId } },
      select: { id: true, name: true, description: true, translations: true },
    }),
    prisma.menuItem.findMany({
      where: { category: { menu: { restaurantId } } },
      select: { id: true, name: true, description: true, translations: true },
    }),
  ]);
  if (!restaurant) return null;

  const units: Unit[] = [
    // The restaurant's name is a brand and stays as written; only the tagline travels.
    ...(restaurant.description?.trim()
      ? [
          {
            kind: "restaurant" as const,
            id: restaurant.id,
            name: null,
            description: restaurant.description,
            translations: restaurant.translations,
          },
        ]
      : []),
    ...categories.map((c) => ({ kind: "category" as const, ...c })),
    ...items.map((i) => ({ kind: "item" as const, ...i })),
  ];

  return { languages: normalizeLanguages(restaurant.languages), units };
}

function isPending(unit: Unit, lang: TargetLanguage): boolean {
  return currentTranslation(unit.translations, lang, unit) === null;
}

export type TranslationOverview = {
  total: number;
  languages: { code: TargetLanguage; done: number }[];
};

/** Per enabled language: how many texts are translated against the current German. */
export async function getTranslationOverview(restaurantId: string): Promise<TranslationOverview> {
  const loaded = await loadUnits(restaurantId);
  if (!loaded) return { total: 0, languages: [] };

  return {
    total: loaded.units.length,
    languages: loaded.languages.map((code) => ({
      code,
      done: loaded.units.filter((unit) => !isPending(unit, code)).length,
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Translating
 * ------------------------------------------------------------------ */

const BATCH_SIZE = 40;
const PARALLEL_REQUESTS = 3;

const SYSTEM = `Du übersetzt Einträge einer Restaurant-Speisekarte aus dem Deutschen in die angegebene Zielsprache.

Regeln:
- Übersetze genau, was dasteht. Lass keine Zutat weg und füge keine hinzu — Gäste mit Allergien verlassen sich darauf.
- Gerichte, die in der Zielsprache unter ihrem Originalnamen bekannt sind (Pizza Margherita, Tiramisu, Wiener Schnitzel, Currywurst, Carpaccio), behalten ihn. Beschreibende Namen („Gegrillter Lachs mit Kräuterbutter“) werden übersetzt.
- Eigennamen, Marken und geschützte Herkunftsbezeichnungen (Aperol, Parmigiano Reggiano, Spreewälder Gurken) bleiben unverändert.
- Zahlen, Mengen und Größen (0,3 l, 250 g, 6 Stück) bleiben erhalten. Nur die Schreibweise an die Zielsprache anpassen.
- Natürlicher Speisekarten-Stil der Zielsprache. Keine Werbesprache, keine Erklärungen, keine Anführungszeichen um den Text.
- Für jede id genau ein Eintrag. Ein Feld, das im Original fehlt, lässt du weg.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    entries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["id"],
      },
    },
  },
  required: ["entries"],
};

const ResponseSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

const keyOf = (unit: Unit) => `${unit.kind[0]}:${unit.id}`;

async function translateBatch(
  lang: TargetLanguage,
  batch: Unit[]
): Promise<Map<Unit, TranslationEntry>> {
  const payload = batch.map((unit) => ({
    id: keyOf(unit),
    ...(unit.name ? { name: unit.name } : {}),
    ...(unit.description ? { description: unit.description } : {}),
  }));

  const ai = getGeminiClient();
  const response = await generateWithRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Zielsprache: ${languageInfo(lang).germanLabel} (${lang})\n\n${JSON.stringify({ entries: payload })}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    })
  );

  const text = response.text?.trim();
  if (!text) throw new Error("empty translation response");
  const parsed = ResponseSchema.parse(JSON.parse(text));
  const byKey = new Map(parsed.entries.map((entry) => [entry.id, entry]));

  const result = new Map<Unit, TranslationEntry>();
  for (const unit of batch) {
    const out = byKey.get(keyOf(unit));
    if (!out) continue;
    const name = out.name?.trim().slice(0, 200);
    const description = out.description?.trim().slice(0, 1000);
    // Half a translation is worse than none: a dish whose name is English but
    // whose description silently stayed German reads like a bug. Retry next run.
    if (unit.name && !name) continue;
    if (unit.description && !description) continue;
    result.set(unit, {
      ...(unit.name ? { name } : {}),
      ...(unit.description ? { description } : {}),
      src: fingerprint(unit),
    });
  }
  return result;
}

const TABLES: Record<UnitKind, Prisma.Sql> = {
  restaurant: Prisma.raw('"Restaurant"'),
  category: Prisma.raw('"Category"'),
  item: Prisma.raw('"MenuItem"'),
};

/**
 * Merges one language into the row's JSON in a single statement, so parallel
 * runs for different languages cannot overwrite each other. The WHERE clause
 * re-checks the German text: if the owner edited it while the model was
 * working, this translation describes something that no longer exists and is
 * dropped instead of written.
 */
async function writeTranslation(
  unit: Unit,
  lang: TargetLanguage,
  entry: TranslationEntry
): Promise<boolean> {
  const json = JSON.stringify(entry);
  const sameName =
    unit.kind === "restaurant" ? Prisma.sql`TRUE` : Prisma.sql`"name" = ${unit.name}`;

  const updated = await prisma.$executeRaw`
    UPDATE ${TABLES[unit.kind]}
    SET "translations" = COALESCE("translations", '{}'::jsonb) || jsonb_build_object(${lang}::text, ${json}::jsonb)
    WHERE "id" = ${unit.id}
      AND ${sameName}
      AND "description" IS NOT DISTINCT FROM ${unit.description}
  `;
  return updated > 0;
}

export type TranslationRun = {
  translated: number;
  failed: number;
  /** First failure, worded for the owner. Null when everything went through. */
  error: string | null;
};

/** Translates every text that is missing or stale in an enabled language. */
async function translatePending(restaurantId: string): Promise<TranslationRun> {
  const run: TranslationRun = { translated: 0, failed: 0, error: null };
  const loaded = await loadUnits(restaurantId);
  if (!loaded || loaded.languages.length === 0) return run;

  const jobs: { lang: TargetLanguage; batch: Unit[] }[] = [];
  for (const lang of loaded.languages) {
    const pending = loaded.units.filter((unit) => isPending(unit, lang));
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      jobs.push({ lang, batch: pending.slice(i, i + BATCH_SIZE) });
    }
  }

  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        const results = await translateBatch(job.lang, job.batch);
        let written = 0;
        for (const [unit, entry] of results) {
          if (await writeTranslation(unit, job.lang, entry)) written++;
        }
        run.translated += written;
        run.failed += job.batch.length - written;
      } catch (error) {
        run.failed += job.batch.length;
        run.error ??= toAiError(error).message;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL_REQUESTS, jobs.length) }, worker));

  return run;
}

/**
 * One run per restaurant at a time on this instance. A request that arrives
 * while a run is going joins it and asks for one more pass, so a burst of edits
 * costs one extra pass rather than one run each — and nothing is left out.
 */
const inflight = new Map<string, { again: boolean; promise: Promise<TranslationRun> }>();

export function runTranslation(restaurantId: string): Promise<TranslationRun> {
  const current = inflight.get(restaurantId);
  if (current) {
    current.again = true;
    return current.promise;
  }

  const state = { again: false } as { again: boolean; promise: Promise<TranslationRun> };
  state.promise = (async () => {
    const total: TranslationRun = { translated: 0, failed: 0, error: null };
    try {
      do {
        state.again = false;
        const run = await translatePending(restaurantId);
        total.translated += run.translated;
        // Only the last pass says what is still missing; earlier failures were retried.
        total.failed = run.failed;
        total.error = run.error;
      } while (state.again);
      return total;
    } finally {
      inflight.delete(restaurantId);
    }
  })();
  inflight.set(restaurantId, state);
  return state.promise;
}

/**
 * Called by every action that changes German text. Runs after the response
 * has gone out, so saving a dish never waits for the model. Without an AI key
 * or with no extra language switched on, this is a no-op.
 */
export function scheduleTranslation(restaurantId: string) {
  if (!isAiConfigured()) return;
  after(async () => {
    try {
      const run = await runTranslation(restaurantId);
      if (run.error) console.error("[translation]", run.error);
    } catch (error) {
      console.error("[translation]", error);
    }
  });
}
