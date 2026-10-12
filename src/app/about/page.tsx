import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { CtaBanner } from "@/components/home/cta-banner";
import { BRANDS, CORE_ETHOS, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: SITE.description,
};

const MILESTONES = [
  { value: String(SITE.since), label: "Trusted since" },
  { value: `${BRANDS.length}+`, label: "National brands" },
  { value: "Electric & Gas", label: "Home appliances" },
  { value: "Dealer & Wholesale", label: "Prices for every budget" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="metro-wash">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              About Us
            </span>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Trusted since {SITE.since}.
              <span className="block text-brand-600">Authorized Dealer &amp; Wholesaler.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Since {SITE.since}, {SITE.name} has been a leading Authorized Dealer and Wholesaler of
              top-tier electric and gas home appliances in Pakistan. We bridge the gap between top
              brands and end consumers, bringing you genuine, high-quality products at unbeatable
              prices.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Mission */}
      <Section className="bg-white">
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-3xl bg-ink-900 px-6 py-12 text-center text-white shadow-xl shadow-ink-950/15 sm:px-12 sm:py-16">
            <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Our Mission</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-ink-200/90 sm:text-base">
              To provide budget-friendly, top-quality appliances with unmatched customer
              satisfaction — the right product for every home, every design and every budget, backed
              by genuine brand warranties and people who stand by you after the sale.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m) => (
            <RevealItem key={m.label}>
              <Card className="h-full gap-1 p-6 text-center">
                <p className="font-heading text-2xl font-extrabold text-brand-700 sm:text-3xl">
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Why choose us */}
      <Section className="bg-muted/40">
        <SectionHeading eyebrow="Why choose us" title="What We" highlight="Stand For" />

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CORE_ETHOS.map((item) => (
            <RevealItem key={item.title} className="h-full">
              <Card className="h-full gap-3 border-t-4 border-t-brand-600 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-950/10">
                <h3 className="font-heading text-base font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <CtaBanner
        title="Want to work with us?"
        body="We are always looking for sales staff, technicians and dealers who care about customers."
        cta="See open roles"
        href="/join-us"
      />
    </>
  );
}
