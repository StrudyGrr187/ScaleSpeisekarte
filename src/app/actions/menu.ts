"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fail, guard, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import {
  assertCategoryInTenant,
  assertItemInTenant,
  requireDefaultMenu,
  requireTenant,
} from "@/lib/tenant";
import { categorySchema, menuItemSchema } from "@/lib/validation";
import { parsePrice } from "@/lib/money";
import { deleteImage } from "@/lib/storage";

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export async function createCategoryAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    const menu = await requireDefaultMenu(restaurant.id);

    const parsed = categorySchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      icon: formData.get("icon") ?? "",
      active: formData.get("active") !== "false",
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    const last = await prisma.category.findFirst({
      where: { menuId: menu.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        menuId: menu.id,
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        active: parsed.data.active,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
      select: { id: true },
    });

    revalidateAdmin();
    return ok(category, "Kategorie angelegt.");
  });
}

export async function updateCategoryAction(
  categoryId: string,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertCategoryInTenant(categoryId, restaurant.id);

    const parsed = categorySchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
      icon: formData.get("icon") ?? "",
      active: formData.get("active") !== "false",
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    await prisma.category.update({ where: { id: categoryId }, data: parsed.data });
    revalidateAdmin();
    return ok(undefined, "Kategorie gespeichert.");
  });
}

/** Inline rename from the builder row — name only, no full form. */
export async function renameCategoryAction(
  categoryId: string,
  name: string
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertCategoryInTenant(categoryId, restaurant.id);

    const trimmed = name.trim();
    if (!trimmed) return fail("Der Name darf nicht leer sein.");
    if (trimmed.length > 80) return fail("Maximal 80 Zeichen.");

    await prisma.category.update({ where: { id: categoryId }, data: { name: trimmed } });
    revalidateAdmin();
    return ok();
  });
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  active: boolean
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertCategoryInTenant(categoryId, restaurant.id);
    await prisma.category.update({ where: { id: categoryId }, data: { active } });
    revalidateAdmin();
    return ok();
  });
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertCategoryInTenant(categoryId, restaurant.id);

    // Collect image paths before the cascade removes the rows.
    const images = await prisma.menuItem.findMany({
      where: { categoryId, image: { not: null } },
      select: { image: true },
    });
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { image: true },
    });

    await prisma.category.delete({ where: { id: categoryId } });
    await Promise.all([
      ...images.map((i) => deleteImage(i.image)),
      deleteImage(category?.image),
    ]);

    revalidateAdmin();
    return ok(undefined, "Kategorie gelöscht.");
  });
}

export async function reorderCategoriesAction(ids: string[]): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    // Only reorder ids that genuinely belong to this tenant, so a tampered
    // payload cannot touch another restaurant's rows.
    const owned = await prisma.category.findMany({
      where: { id: { in: ids }, menu: { restaurantId: restaurant.id } },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((c) => c.id));
    const ordered = ids.filter((id) => ownedIds.has(id));

    await prisma.$transaction(
      ordered.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } })
      )
    );

    revalidateAdmin();
    return ok();
  });
}

/* ------------------------------------------------------------------ *
 * Menu items
 * ------------------------------------------------------------------ */

function itemFormPayload(formData: FormData) {
  return {
    categoryId: String(formData.get("categoryId") ?? ""),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: String(formData.get("price") ?? ""),
    oldPrice: String(formData.get("oldPrice") ?? ""),
    visible: formData.get("visible") !== "false",
    available: formData.get("available") !== "false",
    featured: formData.get("featured") === "true",
    allergenCodes: formData.getAll("allergenCodes").map(String),
    dietaryTagKeys: formData.getAll("dietaryTagKeys").map(String),
  };
}

async function linkIdsFor(allergenCodes: string[], dietaryTagKeys: string[]) {
  const [allergens, tags] = await Promise.all([
    allergenCodes.length
      ? prisma.allergen.findMany({ where: { code: { in: allergenCodes } }, select: { id: true } })
      : Promise.resolve([]),
    dietaryTagKeys.length
      ? prisma.dietaryTag.findMany({ where: { key: { in: dietaryTagKeys } }, select: { id: true } })
      : Promise.resolve([]),
  ]);
  return {
    allergenIds: allergens.map((a) => a.id),
    tagIds: tags.map((t) => t.id),
  };
}

export async function createItemAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    const parsed = menuItemSchema.safeParse(itemFormPayload(formData));
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    await assertCategoryInTenant(parsed.data.categoryId, restaurant.id);

    const last = await prisma.menuItem.findFirst({
      where: { categoryId: parsed.data.categoryId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const { allergenIds, tagIds } = await linkIdsFor(
      parsed.data.allergenCodes,
      parsed.data.dietaryTagKeys
    );

    const item = await prisma.menuItem.create({
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        oldPrice: parsed.data.oldPrice,
        visible: parsed.data.visible,
        available: parsed.data.available,
        featured: parsed.data.featured,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        allergens: { create: allergenIds.map((allergenId) => ({ allergenId })) },
        dietaryTags: { create: tagIds.map((dietaryTagId) => ({ dietaryTagId })) },
      },
      select: { id: true },
    });

    revalidateAdmin();
    return ok(item, "Gericht angelegt.");
  });
}

export async function updateItemAction(
  itemId: string,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertItemInTenant(itemId, restaurant.id);

    const parsed = menuItemSchema.safeParse(itemFormPayload(formData));
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    await assertCategoryInTenant(parsed.data.categoryId, restaurant.id);

    const { allergenIds, tagIds } = await linkIdsFor(
      parsed.data.allergenCodes,
      parsed.data.dietaryTagKeys
    );

    // Moving an item to another category keeps its old sortOrder otherwise,
    // which collides with an existing row and scrambles the target's order.
    const current = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { categoryId: true, sortOrder: true },
    });
    let sortOrder = current?.sortOrder ?? 0;
    if (current && current.categoryId !== parsed.data.categoryId) {
      const last = await prisma.menuItem.findFirst({
        where: { categoryId: parsed.data.categoryId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }

    await prisma.$transaction([
      prisma.menuItemAllergen.deleteMany({ where: { menuItemId: itemId } }),
      prisma.menuItemDietaryTag.deleteMany({ where: { menuItemId: itemId } }),
      prisma.menuItem.update({
        where: { id: itemId },
        data: {
          categoryId: parsed.data.categoryId,
          sortOrder,
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          oldPrice: parsed.data.oldPrice,
          visible: parsed.data.visible,
          available: parsed.data.available,
          featured: parsed.data.featured,
          isExample: false,
          allergens: { create: allergenIds.map((allergenId) => ({ allergenId })) },
          dietaryTags: { create: tagIds.map((dietaryTagId) => ({ dietaryTagId })) },
        },
      }),
    ]);

    revalidateAdmin();
    return ok(undefined, "Gericht gespeichert.");
  });
}

/** Inline edit of a single field from the builder row. */
export async function updateItemFieldAction(
  itemId: string,
  field: "name" | "price",
  value: string
): Promise<ActionResult<{ price: number } | undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertItemInTenant(itemId, restaurant.id);

    if (field === "name") {
      const trimmed = value.trim();
      if (!trimmed) return fail("Der Name darf nicht leer sein.");
      if (trimmed.length > 120) return fail("Maximal 120 Zeichen.");
      await prisma.menuItem.update({ where: { id: itemId }, data: { name: trimmed, isExample: false } });
      revalidateAdmin();
      return ok(undefined);
    }

    const cents = parsePrice(value);
    if (cents === null) return fail("Bitte einen gültigen Preis eingeben.");
    if (cents > 100_000_00) return fail("Preis ist unrealistisch hoch.");

    await prisma.menuItem.update({ where: { id: itemId }, data: { price: cents, isExample: false } });
    revalidateAdmin();
    return ok({ price: cents });
  });
}

export async function toggleItemFlagAction(
  itemId: string,
  field: "available" | "visible" | "featured",
  value: boolean
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertItemInTenant(itemId, restaurant.id);
    await prisma.menuItem.update({ where: { id: itemId }, data: { [field]: value } });
    revalidateAdmin();
    return ok();
  });
}

export async function duplicateItemAction(itemId: string): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertItemInTenant(itemId, restaurant.id);

    const source = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { allergens: true, dietaryTags: true },
    });
    if (!source) return fail("Gericht nicht gefunden.");

    const last = await prisma.menuItem.findFirst({
      where: { categoryId: source.categoryId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const copy = await prisma.menuItem.create({
      data: {
        categoryId: source.categoryId,
        name: `${source.name} (Kopie)`,
        description: source.description,
        price: source.price,
        oldPrice: source.oldPrice,
        // Deliberately not copying `image`: two rows pointing at one file means
        // deleting either copy unlinks the file the other still renders.
        image: null,
        // Copies start hidden so a half-edited duplicate never reaches guests.
        visible: false,
        available: source.available,
        featured: false,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        allergens: { create: source.allergens.map((a) => ({ allergenId: a.allergenId })) },
        dietaryTags: { create: source.dietaryTags.map((t) => ({ dietaryTagId: t.dietaryTagId })) },
      },
      select: { id: true },
    });

    revalidateAdmin();
    return ok(copy, "Kopie angelegt — sie ist noch ausgeblendet.");
  });
}

export async function deleteItemAction(itemId: string): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertItemInTenant(itemId, restaurant.id);

    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { image: true },
    });

    await prisma.menuItem.delete({ where: { id: itemId } });
    await deleteImage(item?.image);

    revalidateAdmin();
    return ok(undefined, "Gericht gelöscht.");
  });
}

/**
 * Reorders items and, when they moved between categories, reassigns them.
 * `categoryId` is the destination; `ids` is its complete new order.
 */
export async function reorderItemsAction(
  categoryId: string,
  ids: string[]
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    await assertCategoryInTenant(categoryId, restaurant.id);

    const owned = await prisma.menuItem.findMany({
      where: { id: { in: ids }, category: { menu: { restaurantId: restaurant.id } } },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((i) => i.id));
    const ordered = ids.filter((id) => ownedIds.has(id));

    await prisma.$transaction(
      ordered.map((id, index) =>
        prisma.menuItem.update({ where: { id }, data: { sortOrder: index, categoryId } })
      )
    );

    revalidateAdmin();
    return ok();
  });
}

/* ------------------------------------------------------------------ *
 * Publishing
 * ------------------------------------------------------------------ */

export async function setPublishedAction(published: boolean): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();
    const menu = await requireDefaultMenu(restaurant.id);

    if (published) {
      const itemCount = await prisma.menuItem.count({
        where: { category: { menuId: menu.id }, visible: true },
      });
      if (itemCount === 0) {
        return fail("Die Karte enthält noch kein sichtbares Gericht.");
      }
    }

    await prisma.menu.update({
      where: { id: menu.id },
      data: { published, publishedAt: published ? new Date() : null },
    });

    revalidateAdmin();
    revalidatePath(`/menu/${restaurant.slug}`);
    return ok(
      undefined,
      published ? "Die Karte ist jetzt veröffentlicht." : "Die Karte ist wieder ein Entwurf."
    );
  });
}
