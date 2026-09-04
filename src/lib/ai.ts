import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "@/lib/action-result";

/**
 * Shared Claude client. AI features are optional: without a key the app runs
 * exactly as before and the UI hides them, rather than failing at click time.
 */

export const AI_MODEL = "claude-opus-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export class AiNotConfiguredError extends AppError {
  constructor() {
    super("Die KI-Funktionen sind auf diesem Server nicht eingerichtet.");
  }
}

const globalForAi = globalThis as unknown as { anthropic?: Anthropic };

export function getAiClient(): Anthropic {
  if (!isAiConfigured()) throw new AiNotConfiguredError();
  globalForAi.anthropic ??= new Anthropic();
  return globalForAi.anthropic;
}

/**
 * Maps SDK failures onto messages an owner can act on. The raw error is logged
 * server-side; the client never sees provider internals.
 */
export function toAiError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  console.error("[ai]", error);

  if (error instanceof Anthropic.AuthenticationError) {
    return new AppError("Der KI-Zugang wurde abgelehnt. Bitte den API-Key prüfen.");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AppError("Die KI ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.");
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AppError("Keine Verbindung zur KI. Bitte Internetverbindung prüfen.");
  }
  if (error instanceof Anthropic.APIError) {
    return new AppError("Die KI konnte die Anfrage nicht verarbeiten. Bitte erneut versuchen.");
  }
  return new AppError("Die KI-Anfrage ist fehlgeschlagen. Bitte erneut versuchen.");
}
