import "server-only";

import { GoogleGenAI } from "@google/genai";
import { AppError } from "@/lib/action-result";

// Flash-Lite is cheaper and typically has more available capacity than the
// flagship Flash model while still supporting images, PDFs and JSON schemas.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export class AiNotConfiguredError extends AppError {
  constructor() {
    super(
      "Die KI-Funktionen sind auf diesem Server nicht eingerichtet (GEMINI_API_KEY nicht gefunden)."
    );
  }
}

const globalForAi = globalThis as unknown as {
  gemini?: GoogleGenAI;
};

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new AiNotConfiguredError();
  globalForAi.gemini ??= new GoogleGenAI({ apiKey });
  return globalForAi.gemini;
}

/** Retries short-lived provider overloads before surfacing an error to the UI. */
export async function generateWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= 2 || !isTemporaryProviderError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * 2 ** attempt));
    }
  }
}

function isTemporaryProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand");
}

/**
 * Maps SDK failures onto messages an owner can act on. The raw error is logged
 * server-side; the client never sees provider internals.
 */
export function toAiError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  console.error("[ai]", error);

  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("API key not valid") ||
    message.includes("API_KEY_INVALID") ||
    message.includes("401")
  ) {
    return new AppError("Der KI-Zugang wurde abgelehnt. Bitte den API-Key prüfen.");
  }
  if (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("429")
  ) {
    return new AppError("Das Kontingent der KI ist gerade erschöpft oder ausgelastet. Bitte in einer Minute erneut versuchen.");
  }
  if (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand")
  ) {
    return new AppError("Die KI ist momentan stark ausgelastet. Bitte in Kürze erneut versuchen.");
  }
  if (
    message.includes("ENOTFOUND") ||
    message.includes("fetch failed")
  ) {
    return new AppError("Keine Verbindung zur KI. Bitte Internetverbindung prüfen.");
  }
  return new AppError(`Die KI-Anfrage ist fehlgeschlagen: ${message}`);
}
