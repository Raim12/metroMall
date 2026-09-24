import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { HOME_FAQS } from "@/lib/constants";

export function FaqSection() {
  // Two balanced columns, matching the reference layout.
  const mid = Math.ceil(HOME_FAQS.length / 2);
  const columns = [HOME_FAQS.slice(0, mid), HOME_FAQS.slice(mid)];

  return (
    <Section className="bg-white">
      <SectionHeading
        title="Frequently Asked Questions"
        description="Everything you need to know about our products and services."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {columns.map((column, ci) => (
          <Reveal key={ci} delay={ci * 0.08}>
            <Accordion type="single" collapsible className="space-y-3">
              {column.map((faq) => (
                <AccordionItem
                  key={faq.q}
                  value={faq.q}
                  className="overflow-hidden rounded-xl border bg-card px-4 data-[state=open]:border-brand-300 data-[state=open]:bg-brand-50/50"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/support/faq">Know More</Link>
        </Button>
      </div>
    </Section>
  );
}
