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
  [Category.TABLE_FANS]: "table-fans",
  [Category.AIR_COOLERS]: "air-coolers",
  [Category.WATER_HEATERS]: "water-heaters",
  [Category.WASHING_MACHINES]: "washing-machines",
  [Category.KITCHEN_APPLIANCES]: "kitchen-appliances",
  [Category.WATER_DISPENSERS]: "water-dispensers",
  [Category.HEATERS]: "heaters",
  [Category.OTHER_APPLIANCES]: "other-appliances",
};

export const SLUG_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_SLUG).map(([cat, slug]) => [slug, cat]),
) as Record<CategorySlug, Category>;

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
    brand: row.brand,
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

/**
 * For grids and sliders: the full description (up to 4,000 characters on
 * imported products) is never shown there, so don't ship it to the browser.
 */
function toListing(row: ProductRow): Product {
  const product = toProduct(row);
  const short = product.description.split("\n")[0].slice(0, 220);
  return { ...product, description: short };
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
  return rows.map(toListing);
}

export const CATALOGUE_PAGE_SIZE = 24;

export type CatalogueSort = "featured" | "price-asc" | "price-desc" | "newest";

export interface CatalogueQuery {
  category?: CategorySlug;
  brand?: string;
  q?: string;
  sort?: CatalogueSort;
  page?: number;
}

/**
 * Filtered, paginated catalogue. Filtering happens in Postgres rather than the
 * browser: with 1,000+ products, shipping the whole list to the client would
 * make every catalogue visit download megabytes of JSON.
 */
export async function getCatalogue(query: CatalogueQuery) {
  const page = Math.max(1, query.page ?? 1);
  const terms = (query.q ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 6);

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(query.category ? { category: SLUG_TO_CATEGORY[query.category] } : {}),
    ...(query.brand ? { brand: query.brand } : {}),
    // Every word must appear somewhere in the name, tagline or brand.
    AND: terms.map((t) => ({
      OR: [
        { name: { contains: t, mode: "insensitive" } },
        { tagline: { contains: t, mode: "insensitive" } },
        { brand: { contains: t, mode: "insensitive" } },
      ],
    })),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ price: "asc" }]
      : query.sort === "price-desc"
        ? [{ price: "desc" }]
        : query.sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ featured: "desc" }, { brand: "asc" }, { name: "asc" }];

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: withRelations,
      orderBy: [...orderBy, { id: "asc" }],
      skip: (page - 1) * CATALOGUE_PAGE_SIZE,
      take: CATALOGUE_PAGE_SIZE,
    }),
  ]);

  return {
    products: rows.map(toListing),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / CATALOGUE_PAGE_SIZE)),
  };
}

/** Product counts for the filter chips, so empty categories/brands can be hidden. */
export async function getCatalogueFacets() {
  const [byCategory, byBrand] = await Promise.all([
    prisma.product.groupBy({ by: ["category"], where: { active: true }, _count: true }),
    prisma.product.groupBy({ by: ["brand"], where: { active: true }, _count: true }),
  ]);
  return {
    categories: Object.fromEntries(
      byCategory.map((r) => [CATEGORY_TO_SLUG[r.category], r._count]),
    ) as Partial<Record<CategorySlug, number>>,
    brands: Object.fromEntries(byBrand.map((r) => [r.brand, r._count])) as Record<string, number>,
  };
}

/** One representative photo per category, for the homepage tiles. */
export async function getCategoryCovers(): Promise<Partial<Record<CategorySlug, string>>> {
  const rows = await prisma.product.findMany({
    where: { active: true, NOT: { images: { isEmpty: true } } },
    select: { category: true, images: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    distinct: ["category"],
  });
  return Object.fromEntries(rows.map((r) => [CATEGORY_TO_SLUG[r.category], r.images[0]]));
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
    return fallback.map(toListing);
  }

  const sameCategory = await prisma.product.findMany({
    where: { active: true, category: current.category, id: { not: current.id } },
    include: withRelations,
    take: limit,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit).map(toListing);
  }

  const others = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: [current.id, ...sameCategory.map((p) => p.id)] },
    },
    include: withRelations,
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...others].map(toListing);
}

/** Used by `generateStaticParams` and the sitemap. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
