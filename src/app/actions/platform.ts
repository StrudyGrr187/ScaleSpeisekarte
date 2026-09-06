"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { fail, guard, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { requirePlatformAdmin } from "@/lib/tenant";
import { tenantCreateSchema, tenantPasswordSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

/**
 * Every action here re-checks the role server-side. The /platform layout also
 * guards, but a server action is its own entry point — a guard in the UI it was
 * rendered from protects nothing.
 */

export async function createTenantAction(
  _prev: ActionResult<{ slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ slug: string }>> {
  return guard(async () => {
    await requirePlatformAdmin();

    const parsed = tenantCreateSchema.safeParse({
      restaurantName: formData.get("restaurantName"),
      name: formData.get("name") || undefined,
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return fail("Diese E-Mail-Adresse wird bereits verwendet.", {
        email: "Diese E-Mail-Adresse wird bereits verwendet.",
      });
    }

    const slug = await uniqueSlug(parsed.data.restaurantName);

    // One transaction: a restaurant without its owner (or vice versa) would be
    // an unusable tenant.
    await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: parsed.data.restaurantName,
          slug,
          openingHours: {
            create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
              dayOfWeek,
              closed: dayOfWeek === 6,
              opensAt: dayOfWeek === 6 ? null : "11:00",
              closesAt: dayOfWeek === 6 ? null : "22:00",
            })),
          },
          menus: { create: { name: "Speisekarte", isDefault: true } },
        },
      });

      await tx.user.create({
        data: {
          email,
          name: parsed.data.name?.trim() || null,
          passwordHash: await hashPassword(parsed.data.password),
          role: "OWNER",
          restaurantId: restaurant.id,
        },
      });
    });

    revalidatePath("/platform");
    return ok({ slug }, "Kunde angelegt.");
  });
}

export async function setTenantPasswordAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    await requirePlatformAdmin();

    const parsed = tenantPasswordSchema.safeParse({
      userId: formData.get("userId"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    // Scoped to owners: the reset form must not be able to aim at another
    // platform admin's account by id.
    const target = await prisma.user.findFirst({
      where: { id: parsed.data.userId, role: { not: "PLATFORM_ADMIN" } },
      select: { id: true },
    });
    if (!target) return fail("Konto nicht gefunden.");

    await prisma.user.update({
      where: { id: target.id },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    });

    return ok(undefined, "Neues Passwort gesetzt.");
  });
}

export async function deleteTenantAction(restaurantId: string): Promise<ActionResult<undefined>> {
  return guard(async () => {
    await requirePlatformAdmin();

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) return fail("Restaurant nicht gefunden.");

    // Menus, categories, items, users and opening hours all cascade.
    await prisma.restaurant.delete({ where: { id: restaurant.id } });

    revalidatePath("/platform");
    return ok(undefined, "Kunde gelöscht.");
  });
}

/**
 * Enters a customer's account. The whole owner surface then works unchanged —
 * far safer than a second, half-complete editor built for the admin alone.
 */
export async function impersonateAction(restaurantId: string): Promise<void> {
  const admin = await requirePlatformAdmin();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });
  if (!restaurant) redirect("/platform");

  await createSession({
    userId: admin.id,
    restaurantId: admin.restaurantId,
    email: admin.email,
    actingRestaurantId: restaurant.id,
  });

  redirect("/admin");
}

export async function stopImpersonatingAction(): Promise<void> {
  const admin = await requirePlatformAdmin();

  await createSession({
    userId: admin.id,
    restaurantId: admin.restaurantId,
    email: admin.email,
    actingRestaurantId: null,
  });

  redirect("/platform");
}

/** Appends a numeric suffix until the slug is free. */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "restaurant";
  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await prisma.restaurant.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
