import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { FanIllustration } from "@/components/product/fan-illustration";
import { SAVINGS } from "@/lib/constants";
import type { Product } from "@/types";

const POINTS = [
  "45â€“55W at top speed instead of 110â€“120W",
  "Six precise speeds with remote and timer",
  "Runs steady between 140V and 260V â€” no stabiliser",
  "1-year repair warranty, nationwide service network",
];

/** Split-screen: efficiency copy on the left, hero render on the right. */
export function TechShowcase({ product }: { product: Product }) {
  const color = product.colors[0];

  return (
    <Section eager className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal direction="right">
          <Eyebrow>Energy, rethought</Eyebrow>

          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Cut your fan&apos;s power bill by{" "}
            <span className="text-brand-600">
              {SAVINGS.savingsPercent}%
            </span>
            , not its airflow.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            A conventional induction fan burns {SAVINGS.regularWatts}W to move
            air. Our BLDC motor does the same job on {SAVINGS.inverterWatts}W by
            replacing mechanical brushes with electronic commutation â€” no
            friction, no heat build-up, and no wasted current. Over a Pakistani
            summer, that difference pays for the fan.
          </p>

          <ul className="mt-7 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100">
                  <Check className="size-3 text-brand-700" aria-hidden />
                </span>
                <span className="text-sm text-foreground/80">{point}</span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="mt-8 bg-brand-600 font-semibold hover:bg-brand-700"
          >
            <Link href="/catalogue">
              Explore inverter fans
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </Reveal>

        <Reveal direction="left" delay={0.1}>
          <div className="metro-tile relative overflow-hidden rounded-3xl border p-8 shadow-xl shadow-ink-950/5 sm:p-12">
            <div className="mx-auto aspect-square w-full max-w-md">
              <FanIllustration
                variant={product.illustration}
                color={color.hex}
                trim={color.trim}
                spin
                title={`${product.name} in ${color.name}`}
              />
            </div>

            <div className="absolute bottom-5 left-5 rounded-2xl border bg-white px-4 py-3 shadow-lg">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                Top speed draw
              </p>
              <p className="font-heading text-2xl font-extrabold text-brand-700">
                {SAVINGS.inverterWatts}W
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
