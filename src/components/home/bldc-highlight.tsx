import Link from "next/link";
import { ArrowRight, Battery, Gauge, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { SAVINGS, SHOWCASE_FAN_BRANDS, brandListText } from "@/lib/constants";

const PILLARS = [
  {
    icon: Zap,
    title: `${SAVINGS.inverterWatts}W+ Inverter Fans`,
    body: `Inverter (BLDC) ceiling fans run from about ${SAVINGS.inverterWatts}W, against ${SAVINGS.regularWattsLow}–${SAVINGS.regularWattsHigh}W for a regular fan.`,
  },
  {
    icon: Gauge,
    title: `Up to ${SAVINGS.savingsPercent}% Energy Saving`,
    body: "Lower running costs every month — over a Pakistani summer, the saving pays for the fan.",
  },
  {
    icon: Battery,
    title: "AC/DC for Load-Shedding",
    body: "AC/DC models also run on 12V DC from a solar panel or battery, so they keep going when the power goes.",
  },
];

/** Energy-saving explainer for inverter and AC/DC fans. */
export function BldcHighlight() {
  return (
    <Section className="metro-wash">
      <SectionHeading
        eyebrow={`Up to ${SAVINGS.savingsPercent}% energy saving`}
        title="Save Power with"
        highlight="Inverter Fans"
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <RevealGroup className="space-y-4">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <RevealItem key={title}>
              <Card className="gap-2 border-l-4 border-l-brand-600 bg-white/90 p-5 transition-shadow hover:shadow-lg hover:shadow-ink-950/10">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50">
                    <Icon className="size-4 text-brand-700" aria-hidden />
                  </span>
                  <h3 className="font-heading text-base font-bold">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal direction="left" delay={0.1} className="space-y-5 text-sm leading-relaxed text-foreground/80">
          <p>
            A regular ceiling fan uses an induction motor that wastes much of its power as heat.
            An <strong className="font-semibold text-foreground">inverter fan</strong> uses a
            brushless (BLDC) motor controlled electronically — it moves the same air on a fraction of
            the power, runs cooler and quieter, and offers precise speed control from a remote.
          </p>
          <p>
            We stock inverter and AC/DC fans from Pakistan&apos;s leading brands —{" "}
            {brandListText(SHOWCASE_FAN_BRANDS)} — every one genuine, with the official brand
            warranty.
          </p>
          <p>
            Not sure which is right for you? Our team will help you compare models, wattage and
            budget before you buy.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex rounded-full border border-brand-300 bg-white px-5 py-2 font-heading text-sm font-bold text-brand-700 shadow-sm">
              Up to {SAVINGS.savingsPercent}% Energy Saving
            </span>
            <Link
              href="/catalogue?category=ceiling-fans-inverter"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
              Shop inverter fans
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
