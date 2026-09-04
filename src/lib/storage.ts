import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Image storage abstraction. The MVP writes to `public/uploads`; swapping in S3
 * or another object store later means reimplementing only these two functions.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB before processing
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type ImageKind = "logo" | "cover" | "item" | "category";

/** Target box per image role. Everything is re-encoded to WebP. */
const PRESETS: Record<ImageKind, { width: number; height: number; fit: "cover" | "inside" }> = {
  logo: { width: 512, height: 512, fit: "inside" },
  cover: { width: 1600, height: 900, fit: "cover" },
  item: { width: 900, height: 900, fit: "cover" },
  category: { width: 1200, height: 675, fit: "cover" },
};

export class UploadError extends Error {}

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

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), output);
  } catch (error) {
    // Serverless hosts (Vercel, Lambda) give you a read-only filesystem, and
    // anything written to /tmp disappears with the invocation. Say so plainly
    // instead of surfacing an EROFS stack trace.
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new UploadError(
        "Auf diesem Server können keine Bilder gespeichert werden (schreibgeschütztes Dateisystem). Dafür wird ein Objektspeicher wie S3 benötigt."
      );
    }
    throw error;
  }

  return `${PUBLIC_PREFIX}/${filename}`;
}

/**
 * Deletes a previously stored image. Silently ignores anything that is not a
 * path this module produced, so a crafted value can never reach outside the
 * upload directory.
 */
export async function deleteImage(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;

  const filename = path.basename(publicPath);
  const target = path.join(UPLOAD_DIR, filename);
  if (path.dirname(target) !== UPLOAD_DIR) return;

  try {
    await unlink(target);
  } catch {
    // Already gone — deleting an image must never fail the surrounding mutation.
  }
}
