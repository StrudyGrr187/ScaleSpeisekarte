"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuspended } from "@/lib/suspension";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { fail, guard, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { loginSchema } from "@/lib/validation";

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
      select: {
        id: true,
        email: true,
        passwordHash: true,
        restaurantId: true,
        restaurant: { select: { suspendedAt: true, suspendedUntil: true } },
      },
    });

    // Always run a comparison so a missing account and a wrong password take
    // the same time and cannot be told apart by response timing.
    const dummyHash = "$2a$12$" + "0".repeat(53);
    const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummyHash);

    if (!user || !valid) {
      return fail("E-Mail oder Passwort ist falsch.");
    }

    // Checked only after the password: someone guessing addresses must not be
    // able to learn which accounts exist, or which of them are suspended. The
    // reason and end date stay with the operator.
    if (user.restaurant && isSuspended(user.restaurant)) {
      return fail(
        "Dieses Konto ist vorübergehend gesperrt. Bitte wende dich an deinen Ansprechpartner."
      );
    }

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
