import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Category } from "../src/generated/prisma/client";
import { PRODUCTS } from "./seed-data";
import type { CategorySlug } from "../src/types";

/**
 * Seeds the catalogue from prisma/seed-data.ts.
 *
 * Idempotent: products are upserted on `slug`, and their child rows are
 * replaced wholesale so re-running picks up edits to the source data without
 * creating duplicates. Safe to run against a populated database.
 */

/** Opening stock for a newly seeded product, so the shop is usable at once. */
const SEED_STOCK = 25;

const CATEGORY: Record<CategorySlug, Category> = {
  "ceiling-fans": Category.CEILING_FANS,
  "false-ceiling-fans": Category.FALSE_CEILING_FANS,
  "pedestal-fans": Category.PEDESTAL_FANS,
  "exhaust-fans": Category.EXHAUST_FANS,
  "bracket-fans": Category.BRACKET_FANS,
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env first.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  console.log(`Seeding ${PRODUCTS.length} products…`);

  for (const p of PRODUCTS) {
    const scalars = {
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      category: CATEGORY[p.category],
      sizes: p.sizes,
      illustration: p.illustration,
      images: p.images ?? [],
      badge: p.badge ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      inTheBox: p.inTheBox,
      featured: p.featured ?? false,
      active: true,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      // Stock is set only on first insert. Re-seeding must never overwrite
      // live inventory the owner has adjusted in the admin dashboard.
      create: { slug: p.slug, ...scalars, stock: SEED_STOCK },
      update: scalars,
    });

    // Replace child rows rather than diffing them — the source array is the
    // single source of truth and these tables are small.
    await prisma.$transaction([
      prisma.productColor.deleteMany({ where: { productId: product.id } }),
      prisma.productFeature.deleteMany({ where: { productId: product.id } }),
      prisma.productSpec.deleteMany({ where: { productId: product.id } }),
      prisma.productColor.createMany({
        data: p.colors.map((c, i) => ({
          productId: product.id,
          name: c.name,
          hex: c.hex,
          trim: c.trim,
          position: i,
        })),
      }),
      prisma.productFeature.createMany({
        data: p.features.map((f, i) => ({
          productId: product.id,
          icon: f.icon,
          title: f.title,
          body: f.body,
          position: i,
        })),
      }),
      prisma.productSpec.createMany({
        data: p.specs.map((s) => ({
          productId: product.id,
          speed: s.speed,
          watts: s.watts,
          rpm: s.rpm,
        })),
      }),
    ]);

    console.log(`  ✓ ${p.slug}`);
  }

  const [products, colors, features, specs] = await Promise.all([
    prisma.product.count(),
    prisma.productColor.count(),
    prisma.productFeature.count(),
    prisma.productSpec.count(),
  ]);

  console.log(
    `\nDone. products=${products} colors=${colors} features=${features} specs=${specs}`,
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
