import { Battery, Wrench, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";

const PILLARS = [
  {
    icon: Zap,
    title: "Energy Efficiency Redefined",
    body: "Reduced power consumption from 110W to just 50â€“55W per hour â€” cutting electricity bills by nearly half.",
  },
  {
    icon: Wrench,
    title: "Brushless = Longer Life",
    body: "No brushes means zero friction, no overheating, and an exponentially extended fan lifespan.",
  },
  {
    icon: Battery,
    title: "AC/DC Innovation",
    body: "Runs on efficient 12V DC instead of traditional 220V AC â€” safer, smarter, and future-ready.",
  },
];

export function BldcHighlight() {
  return (
    <Section className="metro-wash">
      <SectionHeading
        eyebrow="ðŸ‡µðŸ‡° Pakistan's First"
        title="Revolutionizing Fans with"
        highlight="BLDC Technology"
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
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
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal direction="left" delay={0.1} className="space-y-5 text-sm leading-relaxed text-foreground/80">
          <p>
            Metro Electric Co. holds the historic distinction of being one of{" "}
            <strong className="font-semibold text-foreground">
              Pakistan&apos;s first official manufacturers
            </strong>{" "}
            to integrate{" "}
            <strong className="font-semibold text-foreground">
              BLDC (Brushless Direct Current) motor technology
            </strong>{" "}
            into ceiling and pedestal fans.
          </p>

          <p>
            Our BLDC motor uses{" "}
            <strong className="font-semibold text-foreground">
              permanent magnets
            </strong>{" "}
            on the rotor, driven by a precision-controlled magnetic field from{" "}
            <strong className="font-semibold text-foreground">
              99.99% pure copper windings
            </strong>
            . With electronic commutation replacing mechanical brushes, we
            eliminated wear, noise and energy waste â€” achieving unmatched
            efficiency and reliability.
          </p>

          <blockquote className="border-l-4 border-brand-400 bg-white/70 py-2 pl-4 italic text-muted-foreground">
            &ldquo;This breakthrough didn&apos;t happen overnight. It took
            countless sleepless nights, relentless R&amp;D, and the courage to
            build what didn&apos;t exist.&rdquo;
          </blockquote>

          <p>
            Today, Metro Electric Co. stands among the market leaders in AC/DC
            fans â€” driving national progress, creating jobs, and building a
            legacy Pakistanis can be proud of.
          </p>

          <div className="pt-2">
            <span className="inline-flex rounded-full border border-brand-300 bg-white px-5 py-2 font-heading text-sm font-bold text-brand-700 shadow-sm">
              Pioneers of BLDC in Pakistan
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
