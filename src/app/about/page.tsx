import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { CtaBanner } from "@/components/home/cta-banner";
import { CORE_ETHOS, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Metro Electric Co. has built high-efficiency fans in Karachi, Pakistan for decades â€” engineering-led, quality first, and locally developed BLDC technology.",
};

const MILESTONES = [
  { value: "30+", label: "Years of manufacturing" },
  { value: "1M+", label: "Fans in Pakistani homes" },
  { value: "64%", label: "Energy saved vs. AC fans" },
  { value: "12", label: "Export destinations" },
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
              Built in Karachi.
              <span className="block text-brand-600">
                Engineered for Pakistan.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {SITE.name} began as a small electrical workshop and grew into one
              of the country&apos;s most respected fan manufacturers â€” not by
              chasing volume, but by refusing to ship anything we would not
              install in our own homes.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Mission */}
      <Section className="bg-white">
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-3xl bg-ink-900 px-6 py-12 text-center text-white shadow-xl shadow-ink-950/15 sm:px-12 sm:py-16">
            <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
              Our Mission
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-ink-200/90 sm:text-base">
              To manufacture fans with zero compromise on quality. From the very
              beginning, profit maximisation was never our primary objective â€”
              since day one our focus has been on delivering the utmost level of
              quality and performance possible, even when it requires us to
              invest more than what is commercially convenient. This philosophy
              defines who we are and continues to guide every product we create.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m) => (
            <RevealItem key={m.label}>
              <Card className="h-full gap-1 p-6 text-center">
                <p className="font-heading text-3xl font-extrabold text-brand-700">
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Core ethos */}
      <Section className="bg-muted/40">
        <SectionHeading
          eyebrow="What we stand for"
          title="Our Core"
          highlight="Ethos"
        />

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CORE_ETHOS.map((item) => (
            <RevealItem key={item.title} className="h-full">
              <Card className="h-full gap-3 border-t-4 border-t-brand-600 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-950/10">
                <h3 className="font-heading text-base font-bold">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <CtaBanner
        title="Want to work with us?"
        body="We are always looking for engineers, technicians and dealers who care about the details."
        cta="See open roles"
        href="/join-us"
      />
    </>
  );
}
