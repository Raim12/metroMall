import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { ProductImage } from "@/components/product/product-image";
import { CATEGORIES, type CategoryGroup } from "@/lib/constants";
import type { CategorySlug } from "@/types";

const GROUPS: { group: CategoryGroup; title: string }[] = [
  { group: "fans", title: "Fans" },
  { group: "appliances", title: "Home Appliances" },
];

/** Category tiles, each fronted by a real product photo from that category. */
export function ProductCategories({
  covers,
  counts,
}: {
  covers: Partial<Record<CategorySlug, string>>;
  counts: Partial<Record<CategorySlug, number>>;
}) {
  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Browse the range"
        title="Product"
        highlight="Categories"
        description="Fans and home appliances from Pakistan's leading brands — all genuine, all with official brand warranty."
      />

      {GROUPS.map(({ group, title }) => {
        const categories = CATEGORIES.filter((c) => c.group === group && counts[c.slug]);
        if (!categories.length) return null;
        return (
          <div key={group} className="mt-12">
            <h3 className="mb-4 font-heading text-xl font-extrabold">{title}</h3>
            <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <RevealItem key={category.slug}>
                  <Link href={`/catalogue?category=${category.slug}`} className="block h-full">
                    <Card className="group h-full gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-ink-950/10">
                      <div className="aspect-[4/3] bg-white p-4 transition-transform duration-500 group-hover:scale-[1.04]">
                        <ProductImage
                          src={covers[category.slug]}
                          alt={category.name}
                          illustration={category.illustration ?? "ceiling-3"}
                          color="#2b2320"
                          trim="#b87333"
                          sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                        />
                      </div>
                      <div className="border-t p-4">
                        <h4 className="font-heading text-sm font-bold transition-colors group-hover:text-brand-700 sm:text-base">
                          {category.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {counts[category.slug]} products
                        </p>
                      </div>
                    </Card>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        );
      })}

      <div className="mt-10 flex justify-center">
        <Button
          asChild
          size="lg"
          className="bg-cta-400 font-bold text-cta-foreground shadow-lg shadow-cta-600/20 hover:bg-cta-500"
        >
          <Link href="/catalogue">
            View All Products
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
