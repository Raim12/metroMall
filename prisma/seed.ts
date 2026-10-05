import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Category } from "../src/generated/prisma/client";
import type { CategorySlug } from "../src/types";

/**
 * Seeds the catalogue from prisma/data/catalog.json — the multi-brand range
 * imported from the manufacturers' websites. Photos referenced there live in
 * uploads/products/<brand>/ and must be copied alongside the database.
 *
 * Idempotent: products are upserted on `slug` and their colour rows replaced,
 * so re-running picks up edits to the JSON without creating duplicates.
 *
 * Fields the owner manages in the admin dashboard are only set on first
 * insert, never overwritten: price, stock settings, active and featured.
 */

interface SeedProduct {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: CategorySlug;
  sizes: string[];
  colors: { name: string; hex: string; trim: string }[];
  illustration: string;
  images: string[];
  badge: string | null;
  featured: boolean;
  active: boolean;
  sourceUrl: string | null;
}

/** "ceiling-fans" -> Category.CEILING_FANS */
const toCategory = (slug: CategorySlug) =>
  Category[slug.toUpperCase().replace(/-/g, "_") as keyof typeof Category];

/** The original single-brand placeholder range, replaced by this catalogue. */
const LEGACY_BRAND = "metro";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env first.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const products: SeedProduct[] = JSON.parse(
    readFileSync(path.join(__dirname, "data", "catalog.json"), "utf8"),
  );

  // Order history keeps its snapshots: OrderItem.productId is SET NULL on delete.
  const removed = await prisma.product.deleteMany({ where: { brand: LEGACY_BRAND } });
  if (removed.count) console.log(`Removed ${removed.count} placeholder Metro products.`);

  console.log(`Seeding ${products.length} products…`);

  let created = 0;
  let updated = 0;
  for (const [i, p] of products.entries()) {
    const category = toCategory(p.category);
    if (!category) throw new Error(`Unknown category "${p.category}" on ${p.slug}`);

    const content = {
      brand: p.brand,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      category,
      sizes: p.sizes,
      illustration: p.illustration,
      images: p.images,
      badge: p.badge,
      sourceUrl: p.sourceUrl,
    };

    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data: content })
      : await prisma.product.create({
          data: {
            slug: p.slug,
            ...content,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            // Baseline for the nightly price sync (scripts/sync-prices.ts).
            sourcePrice: p.price || null,
            featured: p.featured,
            active: p.active,
            // Stock levels are unknown at import; the shop never blocks a sale
            // until the owner switches tracking on per product.
            trackStock: false,
            stock: 0,
          },
        });
    if (existing) updated++;
    else created++;

    await prisma.$transaction([
      prisma.productColor.deleteMany({ where: { productId: product.id } }),
      prisma.productColor.createMany({
        data: p.colors.map((c, position) => ({
          productId: product.id,
          name: c.name,
          hex: c.hex,
          trim: c.trim,
          position,
        })),
        skipDuplicates: true,
      }),
    ]);

    if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/${products.length}`);
  }

  const [total, active, hidden] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: false } }),
  ]);

  console.log(
    `\nDone. created=${created} updated=${updated} | products=${total} (active=${active}, hidden=${hidden})`,
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
