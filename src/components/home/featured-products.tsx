import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

/**
 * Featured products as a continuously scrolling rail rather than a static
 * grid, so the whole featured set passes by without the visitor scrolling.
 *
 * There are no arrows or dots: the rail moves on its own and pauses when the
 * pointer or keyboard focus is inside it, which is what makes a card
 * clickable. Adding controls to something that is already moving gives two
 * competing sources of truth for "where am I in the list".
 *
 * Stays a server component — the motion is pure CSS, so this ships no
 * JavaScript of its own.
 */
export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  // Roughly five seconds per product, so a long list does not race past and a
  // short one does not crawl.
  const durationSeconds = Math.max(30, products.length * 5);

  return (
    <Section className="bg-white">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="Top picks"
          title="Featured"
          highlight="Products"
          description="Handpicked fans and appliances from our top brands."
        />
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/catalogue">
            Browse catalogue
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/*
        Full-bleed: the rail runs edge to edge rather than stopping at the
        container, so cards enter and leave the viewport instead of appearing
        to pile up against a margin.
      */}
      <div
        className="relative mt-10 -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8"
        aria-label="Featured products"
      >
        {/* Fades the cut-off cards at each edge instead of slicing them. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
        />

        <div
          className="product-rail gap-5 px-4 sm:px-6 lg:px-8"
          style={{ "--rail-duration": `${durationSeconds}s` } as React.CSSProperties}
        >
          {/*
            The list twice over. The second copy is hidden from assistive tech
            so the products are not announced twice.
          */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 gap-5"
              aria-hidden={copy === 1}
            >
              {products.map((product) => (
                <ProductCard
                  key={`${copy}-${product.id}`}
                  product={product}
                  className="h-full w-[16rem] shrink-0 sm:w-[18rem]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
