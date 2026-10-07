/**
 * One-off: moves gas appliances out of `kitchen-appliances` into their own
 * categories, and puts anything misfiled there back where it belongs.
 *
 *   gas-hobs        built-in hobs (gas burners set into the counter)
 *   gas-stoves      table-top gas stoves and cooking ranges
 *   kitchen-hoods   hoods / chimneys
 *
 * Electric cooktops, ovens, microwaves and small appliances stay in
 * kitchen-appliances. Rewrites prisma/data/catalog.json (the catalogue's
 * source of truth); run `npm run db:seed` afterwards to apply it.
 *
 *   node scripts/split-kitchen-categories.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FILE = path.join(import.meta.dirname, "..", "prisma", "data", "catalog.json");
const dry = process.argv.includes("--dry");

/**
 * Brands label many models only by number ("Model 774 SS"), so the
 * description is read too. Order matters: a cooking range has burners but is
 * a stove; a hob's description may mention "gas stove".
 */
function classify(p) {
  const name = p.name;
  const text = `${p.name} ${p.description.slice(0, 500)}`;

  if (/exhaust fan/i.test(name)) return "exhaust-fans";
  if (/cooking range/i.test(name)) return "gas-stoves";
  if (/\bhood\b|chimney|\bSHD-\d/i.test(name)) return "kitchen-hoods";
  // Hanco/Orient hoods named by model only: identified by suction/motor features.
  if (/range hood|chimney|suction|hand motion|auto.?clean|smoke.?sens|voice control|herculean motor|motor warranty/i.test(text))
    return "kitchen-hoods";
  if (/^OR-T\d/i.test(name)) return "kitchen-hoods"; // Orient OR-T01…T06: glass-panel hoods
  if (/built.?in hob|build in hob|\bhob\b|flip burner/i.test(name)) return "gas-hobs";
  if (/electric \+ gas cooktop/i.test(name)) return "gas-hobs";
  if (/\bstove\b/i.test(name) && !/electric|infrared/i.test(name)) return "gas-stoves";
  // Remaining burner-top models (Hanco 3xx/4xx/5xx/7xx/8xx/9xx) are built-in gas hobs.
  if (/burner/i.test(text) && !/infrared|electric stove|ceramic cooker/i.test(text)) return "gas-hobs";
  return "kitchen-appliances";
}

const products = JSON.parse(readFileSync(FILE, "utf8"));
const moves = {};
for (const p of products) {
  if (p.category !== "kitchen-appliances") continue;
  const next = classify(p);
  if (next === p.category) continue;
  moves[next] ??= [];
  moves[next].push(`${p.brand}: ${p.name}`);
  p.category = next;
}

for (const [category, names] of Object.entries(moves)) {
  console.log(`\n→ ${category} (${names.length})`);
  for (const n of names) console.log(`   ${n}`);
}
const left = products.filter((p) => p.category === "kitchen-appliances");
console.log(`\nStaying in kitchen-appliances (${left.length}):`);
for (const p of left) console.log(`   ${p.brand}: ${p.name}`);

if (!dry) {
  writeFileSync(FILE, JSON.stringify(products, null, 1));
  console.log(`\nWrote ${FILE}. Run \`npm run db:seed\` to apply.`);
} else console.log("\n[dry run — nothing written]");
