"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, guard, ok, type ActionResult } from "@/lib/action-result";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { extractMenuFromFile, type ImportResult } from "@/lib/ai-import";
import { suggestTheme, type ThemeSuggestion } from "@/lib/ai-theme";
import { parsePrice } from "@/lib/money";

/**
 * Reads an uploaded menu and returns the result for review. Deliberately does
 * not touch the database — the owner edits and confirms in the next step.
 */
export async function analyzeMenuFileAction(
  formData: FormData
): Promise<ActionResult<ImportResult>> {
  return guard(async () => {
    await requireTenant();

    const file = formData.get("file");
    if (!(file instanceof File)) return fail("Keine Datei erhalten.");

    const result = await extractMenuFromFile(file);

    if (result.categories.length === 0) {
      return fail(
        "Auf dieser Vorlage waren keine Gerichte erkennbar. Bitte ein schärferes Foto oder das Original-PDF versuchen."
      );
    }

    return ok(result);
  });
}

const commitSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        items: z
          .array(
            z.object({
              name: z.string().trim().min(1).max(120),
              description: z.string().max(600).nullable(),
              priceText: z.string().max(40),
              allergenCodes: z.array(z.string().max(2)).max(20),
            })
          )
          .max(200),
      })
    )
    .min(1)
    .max(40),
});

/**
 * Writes a reviewed import into the menu. Imported categories are appended and
 * their items start hidden, so an import can never silently change what guests
 * are already seeing.
 */
export async function commitImportAction(
  payload: unknown
): Promise<ActionResult<{ categories: number; items: number }>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    const menu = await requireDefaultMenu(restaurant.id);

    const parsed = commitSchema.safeParse(payload);
    if (!parsed.success) return fail("Die übernommenen Daten sind unvollständig.");

    const allergens = await prisma.allergen.findMany({ select: { id: true, code: true } });
    const allergenByCode = new Map(allergens.map((a) => [a.code, a.id]));

    const last = await prisma.category.findFirst({
      where: { menuId: menu.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    let sortOrder = (last?.sortOrder ?? -1) + 1;

    let itemCount = 0;

    for (const category of parsed.data.categories) {
      if (category.items.length === 0) continue;

      await prisma.category.create({
        data: {
          menuId: menu.id,
          name: category.name,
          sortOrder: sortOrder++,
          active: true,
          items: {
            create: category.items.map((item, index) => {
              itemCount++;
              return {
                name: item.name,
                description: item.description?.trim() || null,
                price: parsePrice(item.priceText) ?? 0,
                sortOrder: index,
                // Hidden until the owner has checked them — an OCR slip must
                // never reach a guest unreviewed.
                visible: false,
                allergens: {
                  create: [...new Set(item.allergenCodes)]
                    .map((code) => allergenByCode.get(code))
                    .filter((id): id is string => Boolean(id))
                    .map((allergenId) => ({ allergenId })),
                },
              };
            }),
          },
        },
      });
    }

    revalidatePath("/admin", "layout");
    return ok(
      { categories: parsed.data.categories.length, items: itemCount },
      `${itemCount} Gerichte übernommen — sie sind noch ausgeblendet.`
    );
  });
}

/** Proposes a look from a sentence. Applies nothing — the owner decides. */
export async function suggestThemeAction(
  prompt: string
): Promise<ActionResult<ThemeSuggestion>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    const suggestion = await suggestTheme(prompt, restaurant.name);
    return ok(suggestion);
  });
}
