"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { fail, guard, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { loginSchema, registerSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function loginAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      return fail("Bitte prüfe deine Eingaben.", zodFieldErrors(parsed.error));
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, restaurantId: true },
    });

    // Always run a comparison so a missing account and a wrong password take
    // the same time and cannot be told apart by response timing.
    const dummyHash = "$2a$12$" + "0".repeat(53);
    const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummyHash);

    if (!user || !valid) {
      return fail("E-Mail oder Passwort ist falsch.");
    }

    await createSession({
      userId: user.id,
      restaurantId: user.restaurantId,
      email: user.email,
    });

    return ok();
  });
}

export async function registerAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const parsed = registerSchema.safeParse({
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
    const user = await prisma.$transaction(async (tx) => {
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

      return tx.user.create({
        data: {
          email,
          name: parsed.data.name?.trim() || null,
          passwordHash: await hashPassword(parsed.data.password),
          role: "OWNER",
          restaurantId: restaurant.id,
        },
        select: { id: true, email: true, restaurantId: true },
      });
    });

    await createSession({
      userId: user.id,
      restaurantId: user.restaurantId,
      email: user.email,
    });

    return ok();
  });
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
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

export async function changePasswordAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData
): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { requireUser } = await import("@/lib/tenant");
    const sessionUser = await requireUser();

    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    if (newPassword.length < 8) {
      return fail("Bitte prüfe deine Eingaben.", {
        newPassword: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { passwordHash: true },
    });
    if (!user) return fail("Konto nicht gefunden.");

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      return fail("Das aktuelle Passwort ist falsch.", {
        currentPassword: "Das aktuelle Passwort ist falsch.",
      });
    }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return ok(undefined, "Passwort geändert.");
  });
}
