import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Product image storage.
 *
 * Files are written to `uploads/products/` at the project root — deliberately
 * NOT inside `public/`. Next builds a manifest of `public/` at build time, so
 * anything written there afterwards is never served (a runtime upload 404s
 * under `next start`). Instead these are streamed back by the route handler at
 * `src/app/api/uploads/[...path]/route.ts`, which works identically in dev and
 * production.
 *
 * This needs a persistent disk (a VPS, Render, Railway, Fly). It does NOT work
 * on serverless hosting such as Vercel, where the filesystem is ephemeral and
 * per-invocation. To deploy there, swap the two functions below for a blob
 * client (Vercel Blob, Supabase Storage, S3) — everything else stores and
 * renders a plain URL string, so nothing else changes.
 */

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");
const PUBLIC_PREFIX = "/api/uploads/products";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

/** Only formats a browser will actually render. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {}

export function assertValidImage(file: File): void {
  if (!(file.type in ALLOWED)) {
    throw new UploadError(
      `Unsupported format "${file.type || "unknown"}". Use JPEG, PNG, WebP or AVIF.`,
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadError(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
    );
  }
  if (file.size === 0) {
    throw new UploadError("That file is empty.");
  }
}

/**
 * Persists an uploaded image and returns the public URL to store on the
 * product. Filenames are randomised so a re-upload never collides and nothing
 * user-supplied reaches the filesystem path.
 */
export async function saveProductImage(
  file: File,
  slug: string,
): Promise<string> {
  assertValidImage(file);

  const extension = ALLOWED[file.type];
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "product";
  const filename = `${safeSlug}-${randomBytes(6).toString("hex")}.${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `${PUBLIC_PREFIX}/${filename}`;
}

/**
 * Best-effort delete. A missing file is not an error — the database row is the
 * source of truth, and a stray orphan is harmless next to a failed save.
 */
export async function deleteProductImage(url: string): Promise<void> {
  if (!url.startsWith(`${PUBLIC_PREFIX}/`)) return;

  const filename = path.basename(url);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Already gone, or never written to disk (e.g. an external URL).
  }
}
