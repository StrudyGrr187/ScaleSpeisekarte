"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fail, guard, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { assertCategoryInTenant, assertItemInTenant, requireTenant } from "@/lib/tenant";
import { z } from "zod";
import { openingHoursSchema, restaurantSchema } from "@/lib/validation";
import { deleteImage, saveImage, UploadError, type ImageKind } from "@/lib/storage";
import { FONT_PAIR_KEYS } from "@/lib/fonts";
import { normalizeHex } from "@/lib/color";

function revalidateAll(slug: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/menu/${slug}`);
}

export async function updateRestaurantAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    const parsed = restaurantSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description") ?? "",
      address: formData.get("address") ?? "",
      phone: formData.get("phone") ?? "",
      website: formData.get("website") ?? "",
      currency: formData.get("currency"),
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    if (parsed.data.slug !== restaurant.slug) {
      const taken = await prisma.restaurant.findUnique({
        where: { slug: parsed.data.slug },
        select: { id: true },
      });
      if (taken) {
        return fail("Diese Adresse ist bereits vergeben.", {
          slug: "Diese Adresse ist bereits vergeben.",
        });
      }
    }

    await prisma.restaurant.update({ where: { id: restaurant.id }, data: parsed.data });

    revalidateAll(restaurant.slug);
    if (parsed.data.slug !== restaurant.slug) revalidatePath(`/menu/${parsed.data.slug}`);

    return ok(
      undefined,
      parsed.data.slug !== restaurant.slug
        ? "Gespeichert. Achtung: Die Menü-Adresse hat sich geändert — gedruckte QR-Codes zeigen ins Leere."
        : "Gespeichert."
    );
  });
}

export async function updateOpeningHoursAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    const hours = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const closed = formData.get(`closed-${dayOfWeek}`) === "true";
      const opensAt = String(formData.get(`opensAt-${dayOfWeek}`) ?? "");
      const closesAt = String(formData.get(`closesAt-${dayOfWeek}`) ?? "");
      return {
        dayOfWeek,
        closed,
        opensAt: closed || !opensAt ? null : opensAt,
        closesAt: closed || !closesAt ? null : closesAt,
      };
    });

    const parsed = openingHoursSchema.safeParse({ hours });
    if (!parsed.success) {
      return fail("Bitte Zeiten im Format HH:MM angeben.", zodFieldErrors(parsed.error));
    }

    await prisma.$transaction(
      parsed.data.hours.map((day) =>
        prisma.openingHour.upsert({
          where: {
            restaurantId_dayOfWeek: { restaurantId: restaurant.id, dayOfWeek: day.dayOfWeek },
          },
          update: { closed: day.closed, opensAt: day.opensAt, closesAt: day.closesAt },
          create: { restaurantId: restaurant.id, ...day },
        })
      )
    );

    revalidateAll(restaurant.slug);
    return ok(undefined, "Öffnungszeiten gespeichert.");
  });
}

/**
 * Single upload entry point for every image role. `target` decides which row the
 * resulting path is written to; all of them are tenant-checked first.
 */
export async function uploadImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    const kind = String(formData.get("kind") ?? "") as ImageKind;
    const targetId = String(formData.get("targetId") ?? "");
    const file = formData.get("file");

    if (!(file instanceof File)) return fail("Keine Datei erhalten.");
    if (!["logo", "cover", "item", "category"].includes(kind)) {
      return fail("Unbekannter Bildtyp.");
    }

    // Verify ownership *before* writing anything to disk.
    if (kind === "item") await assertItemInTenant(targetId, restaurant.id);
    if (kind === "category") await assertCategoryInTenant(targetId, restaurant.id);

    let url: string;
    try {
      url = await saveImage(file, kind);
    } catch (error) {
      if (error instanceof UploadError) return fail(error.message);
      throw error;
    }

    if (kind === "logo") {
      await deleteImage(restaurant.logo);
      await prisma.restaurant.update({ where: { id: restaurant.id }, data: { logo: url } });
    } else if (kind === "cover") {
      await deleteImage(restaurant.coverImage);
      await prisma.restaurant.update({ where: { id: restaurant.id }, data: { coverImage: url } });
    } else if (kind === "item") {
      const previous = await prisma.menuItem.findUnique({
        where: { id: targetId },
        select: { image: true },
      });
      await deleteImage(previous?.image);
      await prisma.menuItem.update({ where: { id: targetId }, data: { image: url } });
    } else {
      const previous = await prisma.category.findUnique({
        where: { id: targetId },
        select: { image: true },
      });
      await deleteImage(previous?.image);
      await prisma.category.update({ where: { id: targetId }, data: { image: url } });
    }

    revalidateAll(restaurant.slug);
    return ok({ url }, "Bild hochgeladen.");
  });
}

export async function removeImageAction(
  kind: ImageKind,
  targetId: string
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    if (kind === "logo") {
      await deleteImage(restaurant.logo);
      await prisma.restaurant.update({ where: { id: restaurant.id }, data: { logo: null } });
    } else if (kind === "cover") {
      await deleteImage(restaurant.coverImage);
      await prisma.restaurant.update({ where: { id: restaurant.id }, data: { coverImage: null } });
    } else if (kind === "item") {
      await assertItemInTenant(targetId, restaurant.id);
      const previous = await prisma.menuItem.findUnique({
        where: { id: targetId },
        select: { image: true },
      });
      await deleteImage(previous?.image);
      await prisma.menuItem.update({ where: { id: targetId }, data: { image: null } });
    } else {
      await assertCategoryInTenant(targetId, restaurant.id);
      const previous = await prisma.category.findUnique({
        where: { id: targetId },
        select: { image: true },
      });
      await deleteImage(previous?.image);
      await prisma.category.update({ where: { id: targetId }, data: { image: null } });
    }

    revalidateAll(restaurant.slug);
    return ok(undefined, "Bild entfernt.");
  });
}

/**
 * Applies a look — whether picked by hand or accepted from the AI proposal.
 * Values are checked against the closed registries, never trusted as given.
 */
const lookSchema = z.object({
  menuTheme: z.enum(["MODERN", "CLASSIC"]),
  // Closed registry: a font key the app cannot resolve would render as the
  // browser default, so it must never reach the database.
  fontPair: z.enum(FONT_PAIR_KEYS as [string, ...string[]]),
  primaryColor: z
    .string()
    .transform((v) => normalizeHex(v))
    .refine((v): v is string => v !== null, { message: "Ungültiger Farbwert." })
    .optional(),
});

export async function applyLookAction(input: unknown): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireTenant();

    const parsed = lookSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Ungültige Auswahl.");
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        menuTheme: parsed.data.menuTheme,
        fontPair: parsed.data.fontPair,
        ...(parsed.data.primaryColor ? { primaryColor: parsed.data.primaryColor } : {}),
      },
    });

    revalidateAll(restaurant.slug);
    return ok(undefined, "Look übernommen.");
  });
}
