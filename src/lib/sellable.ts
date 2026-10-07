import type { Prisma } from "@/generated/prisma/client";
import { CATEGORIES, FAN_BRANDS } from "@/lib/constants";
import { SLUG_TO_CATEGORY } from "@/lib/category-map";

/**
 * Which products the storefront may show or sell: active, and — for fan
 * categories — only from the brands whose fans we deal in (FAN_BRANDS).
 *
 * Every storefront query and checkout spreads this into its `where`, so the
 * rule lives in one place. Hidden products stay in the database and in the
 * admin; changing FAN_BRANDS brings them back.
 */
const FAN_CATEGORIES = CATEGORIES.filter((c) => c.group === "fans").map(
  (c) => SLUG_TO_CATEGORY[c.slug],
);

export const SELLABLE = {
  active: true,
  OR: [{ category: { notIn: FAN_CATEGORIES } }, { brand: { in: FAN_BRANDS } }],
} satisfies Prisma.ProductWhereInput;
