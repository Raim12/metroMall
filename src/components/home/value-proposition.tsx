import { BadgeCheck, HandCoins, Headset, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { CORE_ETHOS } from "@/lib/constants";

/** The four reasons from the brand brief, in the order the client gave them. */
const REASONS = [
  { title: "Brand Variety", Icon: BadgeCheck },
  { title: "Affordability", Icon: HandCoins },
  { title: "Expert Guidance", Icon: Headset },
  { title: "Seamless Warranty Bridge", Icon: ShieldCheck },
].map((r) => ({ ...r, body: CORE_ETHOS.find((e) => e.title === r.title)?.body ?? "" }));

export function ValueProposition() {
  return (
    <section className="bg-ink-900 py-16 text-white sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-300">
            Authorized dealer, retailer &amp; wholesaler
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
            Why Should You Choose Us?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-200/80 sm:text-base">
            Budget-friendly, top-quality appliances with unmatched customer satisfaction.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ title, body, Icon }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <Card className="h-full gap-3 border-white/15 bg-white/10 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-cta-400/15">
                  <Icon className="size-5 text-cta-300" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-200/85">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
