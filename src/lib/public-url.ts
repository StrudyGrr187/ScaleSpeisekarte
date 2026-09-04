import "server-only";

import { headers } from "next/headers";

/**
 * Absolute origin of this deployment. Falls back to the incoming request host,
 * so QR codes work in local dev and preview deployments without configuration.
 */
export async function getAppOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * The one canonical guest URL. QR codes and NFC plates both point here, and it
 * depends only on the slug — menu edits never invalidate a printed code.
 */
export async function getMenuUrl(slug: string): Promise<string> {
  return `${await getAppOrigin()}/menu/${slug}`;
}
