import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del as blobDelete, put as blobPut } from "@vercel/blob";
import sharp from "sharp";

/**
 * Image storage. Two backends behind one pair of functions:
 *
 *   Vercel Blob — used whenever BLOB_READ_WRITE_TOKEN is set. Serverless hosts
 *                 give you a read-only filesystem, so a deployed app cannot
 *                 keep uploads next to its own code.
 *   Local disk  — public/uploads, for development. No token, no dependency on
 *                 a network service while working offline.
 *
 * Which one produced a stored value is readable from the value itself: local
 * paths start with /uploads/, blob values are absolute URLs. Existing rows
 * therefore keep working after the switch, and deleting picks the right backend.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB before processing
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Blob URLs all live under this host; nothing else may be deleted or proxied. */
export const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export type ImageKind = "logo" | "cover" | "item" | "category";

/** Target box per image role. Everything is re-encoded to WebP. */
const PRESETS: Record<ImageKind, { width: number; height: number; fit: "cover" | "inside" }> = {
  logo: { width: 512, height: 512, fit: "inside" },
  cover: { width: 1600, height: 900, fit: "cover" },
  item: { width: 900, height: 900, fit: "cover" },
  category: { width: 1200, height: 675, fit: "cover" },
};

export class UploadError extends Error {}

function blobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_STORE_ID?.trim()
  );
}

/**
 * Serverless hosts ship the app as a bundle without the `public` directory and
 * with a read-only filesystem, so writing an upload there cannot work — the
 * failure mode differs per host (EROFS, EACCES, ENOENT on Vercel, where
 * /var/task/public does not even exist). Detecting the host is more reliable
 * than guessing from an errno, and it fails before touching the disk.
 */
function serverlessFilesystem(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

const NO_STORAGE_MESSAGE =
  "Auf diesem Server können keine Bilder gespeichert werden. Es fehlt ein Blob-Store — im Vercel-Dashboard unter Storage anlegen, dann setzt Vercel BLOB_READ_WRITE_TOKEN selbst.";

/**
 * Validates, downscales and re-encodes an uploaded image, then stores it.
 * Owner phone photos are routinely 6 MB; nothing that large is ever served.
 */
export async function saveImage(file: File, kind: ImageKind): Promise<string> {
  if (!file || file.size === 0) {
    throw new UploadError("Keine Datei ausgewählt.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Das Bild ist zu groß (maximal 8 MB).");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Nur JPG, PNG, WebP oder AVIF werden unterstützt.");
  }

  const preset = PRESETS[kind];
  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  try {
    output = await sharp(input)
      .rotate() // honour EXIF orientation before resizing
      .resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadError("Die Datei konnte nicht als Bild gelesen werden.");
  }

  const filename = `${kind}-${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;

  if (blobConfigured()) return saveToBlob(filename, output);
  // Checked before the write, so the owner gets the actionable message rather
  // than whichever errno this particular host happens to raise.
  if (serverlessFilesystem()) throw new UploadError(NO_STORAGE_MESSAGE);
  return saveToDisk(filename, output);
}

async function saveToBlob(filename: string, output: Buffer): Promise<string> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    // addRandomSuffix stays off: the filename already carries random bytes, and
    // a predictable key is what makes deletion by stored URL possible.
    const blob = await blobPut(`uploads/${filename}`, output, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      ...(token ? { token } : {}),
    });
    return blob.url;
  } catch (error) {
    console.error("[storage] blob upload failed", error);
    const detail = error instanceof Error ? `: ${error.message}` : "";
    throw new UploadError(`Das Bild konnte nicht gespeichert werden${detail}`);
  }
}

async function saveToDisk(filename: string, output: Buffer): Promise<string> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), output);
  } catch (error) {
    // Fallback for hosts the check above does not recognise: a read-only or
    // absent directory still has to produce a message the owner can act on.
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT") {
      throw new UploadError(NO_STORAGE_MESSAGE);
    }
    throw error;
  }

  return `${PUBLIC_PREFIX}/${filename}`;
}

/**
 * Deletes a previously stored image. Silently ignores anything this module did
 * not produce, so a crafted value can never reach outside the upload directory
 * or delete a blob belonging to someone else.
 */
export async function deleteImage(stored: string | null | undefined): Promise<void> {
  if (!stored) return;

  if (stored.startsWith(`${PUBLIC_PREFIX}/`)) {
    const filename = path.basename(stored);
    const target = path.join(UPLOAD_DIR, filename);
    if (path.dirname(target) !== UPLOAD_DIR) return;

    try {
      await unlink(target);
    } catch {
      // Already gone — deleting an image must never fail the surrounding mutation.
    }
    return;
  }

  if (!isBlobUrl(stored) || !blobConfigured()) return;

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    await blobDelete(stored, token ? { token } : undefined);
  } catch (error) {
    // Same rule as above: a failed cleanup must not roll back the edit that
    // replaced the image, or the owner is stuck with the old picture.
    console.error("[storage] blob delete failed", error);
  }
}

/** True only for URLs on the Vercel Blob host — checked on the parsed hostname. */
export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}
