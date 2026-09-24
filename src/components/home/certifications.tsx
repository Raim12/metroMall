import { Award, ShieldCheck, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem, Reveal } from "@/components/shared/reveal";
import { CERTIFICATIONS } from "@/lib/constants";

const ICONS = {
  shield: ShieldCheck,
  award: Award,
  star: Star,
} as const;

export function Certifications() {
  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Trusted & Certified"
        title="Our Certifications & Awards"
        description="Recognised for quality, innovation and excellence in fan manufacturing across Pakistan and beyond."
      />

      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CERTIFICATIONS.map((cert) => {
          const Icon = ICONS[cert.icon];
          return (
            <RevealItem key={cert.title}>
              <Card className="h-full gap-4 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-950/10">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="text-sm font-bold">{cert.title}</span>
                </div>

                {/* Certification seal */}
                <div className="mx-auto grid aspect-square w-full max-w-[8.5rem] place-items-center rounded-xl bg-brand-50">
                  <div className="grid size-24 place-items-center rounded-full border-[6px] border-brand-500 bg-white text-center">
                    <span className="px-1 font-heading text-[0.7rem] font-extrabold uppercase leading-tight text-brand-700">
                      {cert.title}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  {cert.caption}
                </p>
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <Reveal delay={0.15} className="mt-10 flex justify-center">
        <div className="flex items-center divide-x rounded-2xl border bg-white px-2 shadow-sm">
          {[
            { value: "100%", label: "Quality Tested" },
            { value: "ISO", label: "Certified" },
            { value: "PSQCA", label: "Approved" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-4 text-center">
              <p className="font-heading text-lg font-extrabold text-brand-700">
                {stat.value}
              </p>
              <p className="text-[0.7rem] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
