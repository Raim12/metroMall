import type { Metadata } from "next";

import { CatalogueBrowser } from "@/components/product/catalogue-browser";
import { CtaBanner } from "@/components/home/cta-banner";
import { getCatalogue, getCatalogueFacets, type CatalogueSort } from "@/lib/products";
import { BRANDS, brandName, categoryBySlug } from "@/lib/constants";
import type { CategorySlug } from "@/types";

/*
 * Rendered per request: filtering, search and paging all come from the URL,
 * and only the current page of products is sent to the browser.
 */
export const dynamic = "force-dynamic";

const SORTS: CatalogueSort[] = ["featured", "price-asc", "price-desc", "newest"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(params: Awaited<SearchParams>) {
  const category = one(params.category);
  const brand = one(params.brand);
  const sort = one(params.sort) as CatalogueSort | undefined;
  return {
    category: categoryBySlug(category ?? "") ? (category as CategorySlug) : undefined,
    brand: BRANDS.some((b) => b.slug === brand) ? brand : undefined,
    q: one(params.q)?.slice(0, 80) || undefined,
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    page: Math.max(1, Number.parseInt(one(params.page) ?? "1", 10) || 1),
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category, brand } = parse(await searchParams);
  const parts = [brand && brandName(brand), category && categoryBySlug(category)?.name].filter(Boolean);
  return {
    title: parts.length ? parts.join(" ") : "Products Catalogue",
    description:
      "Shop genuine fans and home appliances from Pak Fans, Royal, Super Asia, GFC, Orient, Tamoor, SK, Sonex and more — delivered across Pakistan.",
  };
}

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parse(await searchParams);
  const [result, facets] = await Promise.all([getCatalogue(filters), getCatalogueFacets(filters.category)]);

  const heading = [
    filters.brand && brandName(filters.brand),
    filters.category ? categoryBySlug(filters.category)?.name : filters.brand ? "Products" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            {heading || "Products Catalogue"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Genuine fans and home appliances from Pakistan&apos;s leading brands,
            with official brand warranty and delivery nationwide.
          </p>
        </header>

        <CatalogueBrowser
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          facets={facets}
          filters={filters}
        />
      </div>

      <CtaBanner
        title="Bulk or dealer pricing?"
        body="Tell us the products and quantities — our team will send you a quote within one business day."
        cta="Send a bulk query"
        href="/export"
      />
    </>
  );
}
