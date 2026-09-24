import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <Section className="bg-white">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="E-Force Series"
          title="Best Selling"
          highlight="Fans"
          description="The models our customers keep coming back for."
        />
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/catalogue">
            Browse catalogue
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {products.map((product) => (
          <RevealItem key={product.id} className="h-full">
            <ProductCard product={product} className="h-full" />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
