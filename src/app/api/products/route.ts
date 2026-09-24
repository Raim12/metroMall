import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";
import type { CategorySlug } from "@/types";

/**
 * GET /api/products
 *
 * Optional query params:
 *   ?category=ceiling-fans   filter by category slug
 *   ?featured=true           only featured products
 *   ?q=nitro                 name/tagline/description search
 */

const CATEGORIES: CategorySlug[] = [
  "ceiling-fans",
  "false-ceiling-fans",
  "pedestal-fans",
  "exhaust-fans",
  "bracket-fans",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (category && !CATEGORIES.includes(category as CategorySlug)) {
    return NextResponse.json(
      { error: `Unknown category "${category}".`, categories: CATEGORIES },
      { status: 400 },
    );
  }

  try {
    let products = await getAllProducts();

    if (category) products = products.filter((p) => p.category === category);
    if (featured === "true") products = products.filter((p) => p.featured);
    if (q) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    return NextResponse.json(
      { count: products.length, products },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("[api/products]", error);
    return NextResponse.json(
      { error: "Could not load products." },
      { status: 500 },
    );
  }
}
