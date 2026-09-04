"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fail, guard, ok, type ActionResult } from "@/lib/action-result";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { findPreset } from "@/lib/cuisine-presets";
import { normalizeHex } from "@/lib/color";

/**
 * Seeds a starter menu from a cuisine preset. Refuses to run once the menu has
 * content, so it can never overwrite real work.
 */
export async function applyPresetAction(
  presetKey: string,
  accentColor?: string
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    const menu = await requireDefaultMenu(restaurant.id);

    const preset = findPreset(presetKey);
    if (!preset) return fail("Unbekannte Vorlage.");

    const existing = await prisma.category.count({ where: { menuId: menu.id } });
    if (existing > 0) {
      return fail("Es gibt bereits Kategorien — die Vorlage wurde nicht angewendet.");
    }

    const [allergens, tags] = await Promise.all([
      prisma.allergen.findMany({ select: { id: true, code: true } }),
      prisma.dietaryTag.findMany({ select: { id: true, key: true } }),
    ]);
    const allergenByCode = new Map(allergens.map((a) => [a.code, a.id]));
    const tagByKey = new Map(tags.map((t) => [t.key, t.id]));

    for (const [categoryIndex, category] of preset.categories.entries()) {
      await prisma.category.create({
        data: {
          menuId: menu.id,
          name: category.name,
          icon: category.icon,
          sortOrder: categoryIndex,
          active: true,
          items: {
            create: category.items.map((item, itemIndex) => ({
              name: item.name,
              description: item.description ?? null,
              price: item.price,
              sortOrder: itemIndex,
              // Flagged so the builder can point out untouched sample rows.
              isExample: true,
              allergens: {
                create: (item.allergens ?? [])
                  .map((code) => allergenByCode.get(code))
                  .filter((id): id is string => Boolean(id))
                  .map((allergenId) => ({ allergenId })),
              },
              dietaryTags: {
                create: (item.tags ?? [])
                  .map((key) => tagByKey.get(key))
                  .filter((id): id is string => Boolean(id))
                  .map((dietaryTagId) => ({ dietaryTagId })),
              },
            })),
          },
        },
      });
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        onboardedAt: new Date(),
        primaryColor: normalizeHex(accentColor ?? "") ?? preset.accent,
      },
    });

    revalidatePath("/admin", "layout");
    return ok();
  });
}

/** Lets the owner skip the wizard without seeding anything. */
export async function skipOnboardingAction(): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { onboardedAt: new Date() },
    });
    revalidatePath("/admin", "layout");
    return ok();
  });
}
