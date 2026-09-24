import "server-only";

import { prisma } from "@/lib/prisma";
import { Category } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import type { CategorySlug, FanVariant, Product, ProductFeature } from "@/types";

/**
 * Catalogue access.
 *
 * The signatures here are unchanged from Phase 1 — the UI already awaited them
 * — so swapping the static array for Postgres required no component edits.
 *
 * `server-only` makes it a build error to import this into a Client Component,
 * which would otherwise leak the database client into the browser bundle.
 */

const CATEGORY_TO_SLUG: Record<Category, CategorySlug> = {
  [Category.CEILING_FANS]: "ceiling-fans",
  [Category.FALSE_CEILING_FANS]: "false-ceiling-fans",
  [Category.PEDESTAL_FANS]: "pedestal-fans",
  [Category.EXHAUST_FANS]: "exhaust-fans",
  [Category.BRACKET_FANS]: "bracket-fans",
};

export const SLUG_TO_CATEGORY: Record<CategorySlug, Category> = {
  "ceiling-fans": Category.CEILING_FANS,
  "false-ceiling-fans": Category.FALSE_CEILING_FANS,
  "pedestal-fans": Category.PEDESTAL_FANS,
  "exhaust-fans": Category.EXHAUST_FANS,
  "bracket-fans": Category.BRACKET_FANS,
};

/** Child rows are ordered here so the UI never has to sort. */
const withRelations = {
  colors: { orderBy: { position: "asc" } },
  features: { orderBy: { position: "asc" } },
  specs: { orderBy: { speed: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof withRelations }>;

/** Maps a database row onto the `Product` shape the components expect. */
function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    category: CATEGORY_TO_SLUG[row.category],
    sizes: row.sizes,
    colors: row.colors.map((c) => ({ name: c.name, hex: c.hex, trim: c.trim })),
    illustration: row.illustration as FanVariant,
    images: row.images.length > 0 ? row.images : undefined,
    badge: row.badge ?? undefined,
    rating: row.rating,
    reviewCount: row.reviewCount,
    features: row.features.map((f) => ({
      icon: f.icon as ProductFeature["icon"],
      title: f.title,
      body: f.body,
    })),
    specs: row.specs.map((s) => ({
      speed: s.speed,
      watts: s.watts,
      rpm: s.rpm,
    })),
    inTheBox: row.inTheBox,
    featured: row.featured,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: withRelations,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { slug, active: true },
    include: withRelations,
  });
  return row ? toProduct(row) : undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: withRelations,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProduct);
}

/**
 * Same-category products first, then anything else, so a thin category still
 * fills the three recommendation slots.
 */
export async function getRelatedProducts(
  slug: string,
  limit = 3,
): Promise<Product[]> {
  const current = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true, category: true },
  });

  if (!current) {
    const fallback = await prisma.product.findMany({
      where: { active: true },
      include: withRelations,
      take: limit,
    });
    return fallback.map(toProduct);
  }

  const sameCategory = await prisma.product.findMany({
    where: { active: true, category: current.category, id: { not: current.id } },
    include: withRelations,
    take: limit,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit).map(toProduct);
  }

  const others = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: [current.id, ...sameCategory.map((p) => p.id)] },
    },
    include: withRelations,
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...others].map(toProduct);
}

/** Used by `generateStaticParams` and the sitemap. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
