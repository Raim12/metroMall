import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { Readable } from "node:stream";

/**
 * GET /api/uploads/products/<file>
 *
 * Serves admin-uploaded product photos.
 *
 * These cannot live in `public/`: Next indexes that directory at build time, so
 * a file written at runtime is never served. Streaming them from a route
 * handler behaves the same in dev and production.
 */
export const runtime = "nodejs";

const ROOT = path.join(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Reject traversal outright rather than relying on normalisation alone.
  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(ROOT, ...segments);

  // Belt and braces: the resolved path must still sit inside the upload root.
  if (!filePath.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) return new Response("Not found", { status: 404 });

    const stream = Readable.toWeb(
      createReadStream(filePath),
    ) as NodeReadableStream<Uint8Array>;

    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stats.size),
        // Filenames carry a random suffix, so a given URL is immutable.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
