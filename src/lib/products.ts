import "server-only";

import { prisma } from "@/lib/prisma";
import { CATEGORY_TO_SLUG, SLUG_TO_CATEGORY } from "@/lib/category-map";
import { SELLABLE } from "@/lib/sellable";
import { BRANDS } from "@/lib/constants";
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

// Re-exported: admin code and scripts import the mapping from here.
export { SLUG_TO_CATEGORY };

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
    where: { ...SELLABLE },
    include: withRelations,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { slug, ...SELLABLE },
    include: withRelations,
  });
  return row ? toProduct(row) : undefined;
}

/**
 * Featured products, listed brand by brand in the order of BRANDS (Pak Fans
 * first), then by the owner's featured rank within a brand.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { ...SELLABLE, featured: true },
    include: withRelations,
    orderBy: [{ featuredRank: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });
  const brandOrder = (slug: string) => {
    const i = BRANDS.findIndex((b) => b.slug === slug);
    return i === -1 ? BRANDS.length : i;
  };
  // Array.prototype.sort is stable, so the rank order above survives within a brand.
  return rows.sort((a, b) => brandOrder(a.brand) - brandOrder(b.brand)).map(toListing);
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

  const sortsByPrice = query.sort === "price-asc" || query.sort === "price-desc";
  const where: Prisma.ProductWhereInput = {
    ...SELLABLE,
    // "Price coming soon" products (price 0) would all sort first; leave them
    // out of price-sorted views.
    ...(sortsByPrice ? { price: { gt: 0 } } : {}),
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
          : [
              { featured: "desc" },
              // Explicit order first; unranked products fall through to the
              // old brand/name ordering behind them.
              { featuredRank: { sort: "asc", nulls: "last" } },
              { brand: "asc" },
              { name: "asc" },
            ];

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

/**
 * Product counts for the filter chips, so empty categories/brands can be hidden.
 * Brand counts follow the selected category: inside a fan category only the
 * brands whose fans we sell appear.
 */
export async function getCatalogueFacets(category?: CategorySlug) {
  const [byCategory, byBrand] = await Promise.all([
    prisma.product.groupBy({ by: ["category"], where: { ...SELLABLE }, _count: true }),
    prisma.product.groupBy({
      by: ["brand"],
      where: { ...SELLABLE, ...(category ? { category: SLUG_TO_CATEGORY[category] } : {}) },
      _count: true,
    }),
  ]);
  return {
    categories: Object.fromEntries(
      byCategory.map((r) => [CATEGORY_TO_SLUG[r.category], r._count]),
    ) as Partial<Record<CategorySlug, number>>,
    brands: Object.fromEntries(byBrand.map((r) => [r.brand, r._count])) as Record<string, number>,
  };
}

/**
 * Categories whose tile photo is chosen by hand rather than left to the
 * ordering below.
 *
 * The automatic pick is "first sellable product in the category", which is
 * fine until the product that happens to sort first is not the one that should
 * front the range. Pinning the cover here is deliberately separate from the
 * `featured` flag: marking a product featured to fix a tile would also push it
 * into the homepage carousel, which is curated for its own reasons.
 *
 * Keyed by category slug, valued by product slug.
 */
const COVER_OVERRIDES: Partial<Record<CategorySlug, string>> = {
  // The GFC wooden fan sorts first but reads as a dated wooden finish. Tamoor
  // is the same flat-on square shot in white, which the client prefers.
  "false-ceiling-fans": "tamoor-false-ceiling-fan",
  // Super Asia fronts geysers (a featured Hanco geyser otherwise wins the tile).
  "water-heaters": "super-asia-geh-735ai-auto-ignition",
  // Ignition, tempered-glass stove, as the client asked.
  "gas-stoves": "nasgas-dg-117-gt-2-burner-auto-ignition-tempered-glass-gas-stove",
};

/** One representative photo per category, for the homepage tiles. */
export async function getCategoryCovers(): Promise<Partial<Record<CategorySlug, string>>> {
  const overrideSlugs = Object.values(COVER_OVERRIDES);

  const [rows, pinned] = await Promise.all([
    prisma.product.findMany({
      where: { ...SELLABLE, NOT: { images: { isEmpty: true } } },
      select: { category: true, images: true },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      distinct: ["category"],
    }),
    overrideSlugs.length
      ? prisma.product.findMany({
          where: { ...SELLABLE, slug: { in: overrideSlugs }, NOT: { images: { isEmpty: true } } },
          select: { slug: true, images: true },
        })
      : Promise.resolve([]),
  ]);

  const covers = Object.fromEntries(
    rows.map((r) => [CATEGORY_TO_SLUG[r.category], r.images[0]]),
  ) as Partial<Record<CategorySlug, string>>;

  // Applied on top, so an override that no longer resolves — product renamed,
  // delisted or left without photos — quietly falls back to the automatic pick
  // rather than leaving the tile blank.
  const bySlug = new Map(pinned.map((p) => [p.slug, p.images[0]]));
  for (const [category, productSlug] of Object.entries(COVER_OVERRIDES)) {
    const image = bySlug.get(productSlug);
    if (image) covers[category as CategorySlug] = image;
  }

  return covers;
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
    where: { slug, ...SELLABLE },
    select: { id: true, category: true },
  });

  if (!current) {
    const fallback = await prisma.product.findMany({
      where: { ...SELLABLE },
      include: withRelations,
      take: limit,
    });
    return fallback.map(toListing);
  }

  const sameCategory = await prisma.product.findMany({
    where: { ...SELLABLE, category: current.category, id: { not: current.id } },
    include: withRelations,
    take: limit,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit).map(toListing);
  }

  const others = await prisma.product.findMany({
    where: {
      ...SELLABLE,
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
    where: { ...SELLABLE },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** Brands, and brand + category pairs, that have sellable products — for the sitemap. */
export async function getSitemapListings() {
  const rows = await prisma.product.groupBy({
    by: ["brand", "category"],
    where: { ...SELLABLE },
  });
  const pairs = rows.map((r) => ({ brand: r.brand, category: CATEGORY_TO_SLUG[r.category] }));
  return { brands: [...new Set(pairs.map((p) => p.brand))], pairs };
}
