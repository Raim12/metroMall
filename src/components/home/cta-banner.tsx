import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export function CtaBanner({
  title = "Ready to Elevate Your Experience?",
  body = "Experience powerful cooling and energy efficiency â€” explore our latest fan collection today.",
  cta = "Shop Now",
  href = "/catalogue",
  className,
}: {
  title?: string;
  body?: string;
  cta?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8", className)}>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-10 shadow-xl shadow-ink-950/15 sm:px-10 sm:py-12">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-brand-500/40 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-200/90 sm:text-base">
                {body}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="shrink-0 bg-cta-400 font-bold text-cta-foreground shadow-lg hover:bg-cta-500"
            >
              <Link href={href}>
                {cta}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
