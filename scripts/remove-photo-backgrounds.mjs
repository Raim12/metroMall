/**
 * Makes product photos transparent: removes the plain studio background
 * (white, light grey, cream…) that most brand photos sit on, so products blend
 * into the site's colour theme instead of showing as boxes.
 *
 *   node scripts/remove-photo-backgrounds.mjs              # all brand photos
 *   node scripts/remove-photo-backgrounds.mjs --brand royal
 *   node scripts/remove-photo-backgrounds.mjs --dry        # report only
 *   node scripts/remove-photo-backgrounds.mjs file1.webp … # specific files (writes *.preview.png)
 *
 * How: the background colour is the dominant colour of the photo's border.
 * Starting from the border, every connected pixel close to that colour is
 * made transparent (a flood fill), so a white fan surrounded by its own grey
 * outline is never eaten from the inside. Edge pixels get partial alpha for a
 * clean anti-aliased cut, the empty margin is trimmed, and the result is saved
 * back as WebP with transparency (≈10× smaller than PNG, same look).
 *
 * Safety: a photo is left untouched when it has no clear plain background, or
 * when the fill would remove almost everything (a sign it leaked into the
 * product). Processed files are listed in uploads/products/.bg-removed.json so
 * re-runs skip them.
 *
 * A processed photo is saved under a new name (<name>-cut.webp) and
 * prisma/data/catalog.json is updated to match: /api/uploads serves photos as
 * immutable for a year, so reusing the old URL would keep showing the old
 * version to anyone who has seen it. Run `npm run db:seed` afterwards.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..", "uploads", "products");
const LEDGER = path.join(ROOT, ".bg-removed.json");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const brandArg = args.includes("--brand") ? args[args.indexOf("--brand") + 1] : null;
const explicit = args.filter((a) => a.endsWith(".webp") || a.endsWith(".png") || a.endsWith(".jpg"));

/** Colour distance (max channel difference) still counted as background. */
const TOLERANCE = 18;
/** Beyond TOLERANCE, pixels fade from transparent to opaque over this range. */
const FEATHER = 22;

function processRaw(data, width, height) {
  const n = width * height;
  const at = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];

  // 1. Background colour = most common (quantised) colour on the border.
  const border = [];
  for (let x = 0; x < width; x++) border.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) border.push(y * width, y * width + width - 1);
  const buckets = new Map();
  let transparentBorder = 0;
  for (const i of border) {
    const [r, g, b, a] = at(i);
    if (a < 20) {
      transparentBorder++;
      continue;
    }
    const key = `${r >> 3},${g >> 3},${b >> 3}`;
    const e = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    e.count++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(key, e);
  }
  if (transparentBorder / border.length > 0.6) return { skipped: "already transparent" };
  const top = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!top || top.count / border.length < 0.35) return { skipped: "no plain background" };
  const bg = [top.r / top.count, top.g / top.count, top.b / top.count];
  // Only near-neutral, light backgrounds — never cut a coloured photo backdrop.
  if (Math.min(...bg) < 200 || Math.max(...bg) - Math.min(...bg) > 40) return { skipped: "background not light/neutral" };

  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = at(i);
    dist[i] = Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2]));
  }

  // 2. Flood fill from the border through background-coloured pixels.
  const bgMask = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (const i of border) {
    if (!bgMask[i] && dist[i] <= TOLERANCE) {
      bgMask[i] = 1;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % width;
    const y = (i - x) / width;
    const next = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, y > 0 ? i - width : -1, y < height - 1 ? i + width : -1];
    for (const j of next) {
      if (j >= 0 && !bgMask[j] && dist[j] <= TOLERANCE) {
        bgMask[j] = 1;
        queue[tail++] = j;
      }
    }
  }

  const removed = tail / n;
  if (removed < 0.04) return { skipped: "background too small to matter" };
  if (removed > 0.97) return { skipped: "fill leaked into the product" };

  // 3. Alpha: background -> 0; pixels bordering it fade in by colour distance
  //    (anti-aliased edge without a light halo).
  const out = Buffer.from(data);
  for (let i = 0; i < n; i++) {
    if (bgMask[i]) {
      out[i * 4 + 3] = 0;
      continue;
    }
    const x = i % width;
    const y = (i - x) / width;
    const touchesBg =
      (x > 0 && bgMask[i - 1]) || (x < width - 1 && bgMask[i + 1]) || (y > 0 && bgMask[i - width]) || (y < height - 1 && bgMask[i + width]);
    if (touchesBg && dist[i] < TOLERANCE + FEATHER) {
      const t = (dist[i] - TOLERANCE) / FEATHER;
      out[i * 4 + 3] = Math.round(out[i * 4 + 3] * Math.max(0.15, Math.min(1, t)));
    }
  }
  return { out, removed };
}

async function processFile(file, { preview = false } = {}) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = processRaw(data, info.width, info.height);
  if (!result.out) return result;
  if (dry) return { removed: result.removed };

  let img = sharp(result.out, { raw: { width: info.width, height: info.height, channels: 4 } });
  // Trim the now-empty margin, then pad evenly so every product sits centred.
  const trimmed = await img.trim({ threshold: 1 }).toBuffer({ resolveWithObject: true }).catch(() => null);
  if (trimmed) {
    const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.04);
    img = sharp(trimmed.data, { raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 } }).extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  if (preview) await img.png().toFile(file.replace(/\.\w+$/, ".preview.png"));
  else await img.webp({ quality: 82, alphaQuality: 90 }).toFile(file + ".tmp");
  return { removed: result.removed };
}

// ------------------------------------------------------------------ run

if (explicit.length) {
  for (const f of explicit) console.log(path.basename(f), await processFile(f, { preview: true }));
  process.exit(0);
}

const ledger = new Set(existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : []);
const files = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!brandArg || d.name === brandArg))
  .flatMap((d) => readdirSync(path.join(ROOT, d.name)).filter((f) => f.endsWith(".webp")).map((f) => `${d.name}/${f}`))
  .filter((rel) => !ledger.has(rel) && !rel.endsWith("-cut.webp"));
const renamed = new Map(); // old public URL -> new public URL

const { renameSync, unlinkSync } = await import("node:fs");
const stats = { processed: 0 };
let i = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (i < files.length) {
      const rel = files[i++];
      const abs = path.join(ROOT, rel);
      try {
        const r = await processFile(abs);
        if (r.skipped) stats[r.skipped] = (stats[r.skipped] ?? 0) + 1;
        else {
          stats.processed++;
          if (!dry) {
            const cut = rel.replace(/\.webp$/, "-cut.webp");
            renameSync(abs + ".tmp", path.join(ROOT, cut));
            unlinkSync(abs);
            ledger.add(cut);
            renamed.set(`/api/uploads/products/${rel}`, `/api/uploads/products/${cut}`);
          }
        }
      } catch (error) {
        stats.errors = (stats.errors ?? 0) + 1;
        console.error(rel, error.message);
      }
      if ((stats.processed + 1) % 250 === 0) console.log(`  ${i}/${files.length}…`);
    }
  }),
);
if (!dry) {
  writeFileSync(LEDGER, JSON.stringify([...ledger].sort(), null, 0));
  const catalogFile = path.resolve(import.meta.dirname, "..", "prisma", "data", "catalog.json");
  const catalog = JSON.parse(readFileSync(catalogFile, "utf8"));
  for (const p of catalog) p.images = p.images.map((u) => renamed.get(u) ?? u);
  writeFileSync(catalogFile, JSON.stringify(catalog, null, 1));
  if (renamed.size) console.log(`Renamed ${renamed.size} photo(s); run \`npm run db:seed\` to apply.`);
}
console.log(dry ? "[dry run]" : "", stats);
