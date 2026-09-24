"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategorySlug, Product } from "@/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

export function CatalogueBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as CategorySlug | null;

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const setCategory = (slug: CategorySlug | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.replace(params.toString() ? `/catalogue?${params}` : "/catalogue", {
      scroll: false,
    });
  };

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = products.filter((p) => {
      const matchesCategory = !categoryParam || p.category === categoryParam;
      const matchesQuery =
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.tagline.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted.sort(
          (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
        );
    }
    return sorted;
  }, [products, categoryParam, query, sort]);

  const activeCategory = CATEGORIES.find((c) => c.slug === categoryParam);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fansâ€¦"
            aria-label="Search products"
            className="pl-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <Button
          variant="outline"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="gap-2"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
        </Button>

        <label className="sr-only" htmlFor="sort">
          Sort products
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="ml-auto hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
          <LayoutGrid className="size-4" aria-hidden />
          {visible.length} {visible.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Category chips */}
      {filtersOpen ? (
        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border bg-muted/40 p-3">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              !categoryParam
                ? "border-brand-600 bg-brand-600 text-white"
                : "bg-white hover:border-brand-300 hover:text-brand-700",
            )}
          >
            All products
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                categoryParam === c.slug
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "bg-white hover:border-brand-300 hover:text-brand-700",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      ) : null}

      {activeCategory ? (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
            {activeCategory.name}
            <button
              type="button"
              onClick={() => setCategory(null)}
              aria-label={`Clear ${activeCategory.name} filter`}
              className="rounded-full hover:text-ink-900"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        </div>
      ) : null}

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <p className="font-semibold">No fans match that search</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different keyword, or clear the filters to see the full range.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory(null);
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <RevealGroup
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.05}
        >
          {visible.map((product) => (
            <RevealItem key={product.id} className="h-full">
              <ProductCard product={product} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
