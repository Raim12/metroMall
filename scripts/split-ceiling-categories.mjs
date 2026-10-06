/**
 * One-off: splits the single `ceiling-fans` category into three, by motor type.
 *
 *   ceiling-fans-standard   mains only, works with a dimmer/regulator
 *   ceiling-fans-acdc       runs on 220V AC or 12V DC (~45W)
 *   ceiling-fans-inverter   BLDC inverter (~30W)
 *
 * Rewrites prisma/data/catalog.json, which is the catalogue's source of truth —
 * classifying only in the database would be undone by the next `npm run db:seed`.
 *
 *   node scripts/split-ceiling-categories.mjs [--dry]
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = path.join(ROOT, "prisma", "data", "catalog.json");
const dry = process.argv.includes("--dry");

const INVERTER = /\binverter\b|\bbldc\b/i;
const ACDC = /\bac\s*[\/\-]?\s*dc\b|\ba\s*\/\s*c\s*d\s*\/\s*c\b/i;

/**
 * The product name is the manufacturer's own label and the most reliable
 * signal, so it is checked first; the description is only consulted when the
 * name is silent.
 *
 * Fans named as both — Super Asia's "AC/DC INVERTER FAN" range — are genuinely
 * hybrid. They are filed under inverter, because the BLDC motor is what
 * determines the running cost a customer is comparing on.
 */
function classify(product) {
  const { name } = product;
  if (INVERTER.test(name)) return "ceiling-fans-inverter";
  if (ACDC.test(name)) return "ceiling-fans-acdc";

  const rest = `${product.tagline ?? ""} ${product.description ?? ""}`;
  if (INVERTER.test(rest)) return "ceiling-fans-inverter";
  if (ACDC.test(rest)) return "ceiling-fans-acdc";

  return "ceiling-fans-standard";
}

const products = JSON.parse(readFileSync(FILE, "utf8"));
const counts = {
  "ceiling-fans-standard": 0,
  "ceiling-fans-acdc": 0,
  "ceiling-fans-inverter": 0,
};
const byBrand = {};
let touched = 0;

for (const product of products) {
  // Re-runnable: pick up both the original slug and the split ones.
  if (!product.category.startsWith("ceiling-fans")) continue;
  if (product.category === "false-ceiling-fans") continue;

  const next = classify(product);
  if (product.category !== next) touched++;
  product.category = next;
  counts[next]++;

  byBrand[product.brand] ??= { standard: 0, acdc: 0, inverter: 0 };
  byBrand[product.brand][next.replace("ceiling-fans-", "")]++;
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);

console.log(`ceiling fans classified: ${total}  (changed: ${touched})\n`);
for (const [slug, n] of Object.entries(counts)) {
  console.log(`  ${slug.padEnd(24)} ${String(n).padStart(4)}`);
}

console.log("\nper brand:");
console.log(`  ${"brand".padEnd(12)} ${"std".padStart(5)} ${"acdc".padStart(5)} ${"inv".padStart(5)}`);
for (const [brand, row] of Object.entries(byBrand).sort()) {
  console.log(
    `  ${brand.padEnd(12)} ${String(row.standard).padStart(5)} ${String(row.acdc).padStart(5)} ${String(row.inverter).padStart(5)}`,
  );
}

if (dry) {
  console.log("\n--dry: nothing written.");
  process.exit(0);
}

// Keep one backup so the split can be undone without a git checkout.
const backup = `${FILE}.before-ceiling-split`;
if (!existsSync(backup)) {
  copyFileSync(FILE, backup);
  console.log(`\nbackup written: ${path.basename(backup)}`);
}

writeFileSync(FILE, `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(`updated ${path.basename(FILE)} — run: npm run db:seed`);
