import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem, Reveal } from "@/components/shared/reveal";
import { FanIllustration } from "@/components/product/fan-illustration";
import { CATEGORIES } from "@/lib/constants";

/** The four small categories sit left; Ceiling Fans gets a tall feature tile. */
export function ProductCategories() {
  const small = CATEGORIES.filter((c) => c.slug !== "ceiling-fans");
  const feature = CATEGORIES.find((c) => c.slug === "ceiling-fans")!;

  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Browse the range"
        title="Product"
        highlight="Categories"
        description="From flush-mount cassettes to 60-inch designer ceiling fans â€” every unit built around the same BLDC platform."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {small.map((category) => (
            <RevealItem key={category.slug}>
              <Link
                href={`/catalogue?category=${category.slug}`}
                className="block h-full"
              >
                <Card className="group h-full gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-ink-950/10">
                  <div className="metro-tile aspect-[16/10] p-6 transition-transform duration-500 group-hover:scale-[1.04]">
                    <FanIllustration
                      variant={category.illustration}
                      color="#2b2320"
                      trim="#b87333"
                      title={category.name}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-base font-bold transition-colors group-hover:text-brand-700">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {category.blurb}
                    </p>
                  </div>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal direction="left" delay={0.1} className="h-full">
          <Link href={`/catalogue?category=${feature.slug}`} className="block h-full">
            <Card className="group flex h-full flex-col justify-between gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-ink-950/10">
              <div className="metro-tile flex-1 p-8 transition-transform duration-500 group-hover:scale-[1.04]">
                <div className="mx-auto aspect-square w-full max-w-xs">
                  <FanIllustration
                    variant={feature.illustration}
                    color="#1f2224"
                    trim="#c9a227"
                    spin
                    title={feature.name}
                  />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-heading text-2xl font-extrabold transition-colors group-hover:text-brand-700">
                  {feature.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {feature.blurb}
                </p>
              </div>
            </Card>
          </Link>
        </Reveal>
      </div>

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
