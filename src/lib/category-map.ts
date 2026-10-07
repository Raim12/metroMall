import type { Category } from "@/generated/prisma/client";
import { CATEGORIES } from "@/lib/constants";
import type { CategorySlug } from "@/types";

/**
 * URL slug <-> Prisma enum. The enum value is always the slug in
 * SCREAMING_SNAKE_CASE ("ceiling-fans-acdc" <-> CEILING_FANS_ACDC), so the
 * mapping is derived from CATEGORIES instead of being kept in sync by hand.
 */
export const SLUG_TO_CATEGORY = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.slug.toUpperCase().replace(/-/g, "_")]),
) as Record<CategorySlug, Category>;

export const CATEGORY_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_CATEGORY).map(([slug, category]) => [category, slug]),
) as Record<Category, CategorySlug>;
