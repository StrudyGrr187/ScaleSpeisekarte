import { z } from "zod";

/**
 * A message that is safe to show the user. Only errors thrown as `AppError`
 * reach the browser verbatim; everything else is reported generically so that
 * Prisma constraint names, file paths or config hints never leak out.
 */
export class AppError extends Error {}

/**
 * Every server action returns this shape. `fieldErrors` is keyed by form field
 * so a form can render errors inline instead of dumping one banner.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok(): ActionResult<undefined>;
export function ok<T>(data: T, message?: string): ActionResult<T>;
export function ok<T>(data?: T, message?: string): ActionResult<T | undefined> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Flattens a Zod error into first-message-per-field. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/**
 * Wraps an action body so an unexpected throw becomes a clean result instead of
 * a Next.js error overlay. Redirect/notFound control-flow errors are re-thrown.
 */
export async function guard<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (error as { digest: string }).digest === "NEXT_NOT_FOUND")
    ) {
      throw error;
    }
    // Full detail stays on the server; the client gets something it can act on.
    console.error("[action]", error);
    if (error instanceof AppError) return fail(error.message);
    return fail("Da ist etwas schiefgelaufen. Bitte versuche es erneut.");
  }
}
