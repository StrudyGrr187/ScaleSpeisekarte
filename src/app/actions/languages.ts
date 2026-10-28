"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, guard, ok, type ActionResult } from "@/lib/action-result";
import { isAiConfigured } from "@/lib/ai";
import { normalizeLanguages } from "@/lib/languages";
import { requireManager } from "@/lib/tenant";
import { runTranslation } from "@/lib/translation";

/**
 * Saves which languages guests can switch to. Translating is a separate step
 * (translateMenuAction) so a switch flips instantly; the panel starts the
 * translation right after and shows its progress.
 */
export async function setMenuLanguagesAction(codes: unknown): Promise<ActionResult<undefined>> {
  return guard(async () => {
    const { restaurant } = await requireManager();

    const parsed = z.array(z.string().max(8)).max(40).safeParse(codes);
    if (!parsed.success) return fail("Ungültige Sprachauswahl.");

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { languages: normalizeLanguages(parsed.data) },
    });

    revalidatePath("/admin/languages");
    revalidatePath(`/menu/${restaurant.slug}`);
    return ok();
  });
}

/** Translates everything missing or outdated, and waits for it. */
export async function translateMenuAction(): Promise<
  ActionResult<{ translated: number; failed: number }>
> {
  return guard(async () => {
    const { restaurant } = await requireManager();
    if (!isAiConfigured()) {
      return fail("Die KI ist auf diesem Server nicht eingerichtet — ohne sie kann nicht übersetzt werden.");
    }

    const run = await runTranslation(restaurant.id);
    revalidatePath("/admin/languages");

    if (run.error && run.translated === 0) return fail(run.error);

    const message =
      run.failed > 0
        ? `${run.translated} Texte übersetzt, ${run.failed} noch offen. ${run.error ?? ""}`.trim()
        : run.translated > 0
          ? `${run.translated} Texte übersetzt.`
          : "Alles ist bereits übersetzt.";
    return ok({ translated: run.translated, failed: run.failed }, message);
  });
}
