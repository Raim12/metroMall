import type { Metadata } from "next";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/shared/reveal";
import { SITE, SUPPORT_FAQS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about Metro Electric Co. fans â€” the difference between AC/DC and inverter models, warranty cover and service.",
};

const TAB_LABELS = {
  difference: "Difference",
  warranty: "Warranty",
  service: "Service",
} as const;

export default function FaqPage() {
  return (
    <div className="bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          {/* FAQs */}
          <Reveal direction="right">
            <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Find answers to common questions, or contact our support team.
            </p>

            <Tabs defaultValue="difference" className="mt-7 w-full">
              <TabsList>
                {(
                  Object.keys(TAB_LABELS) as (keyof typeof TAB_LABELS)[]
                ).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {TAB_LABELS[key]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {(
                Object.keys(SUPPORT_FAQS) as (keyof typeof SUPPORT_FAQS)[]
              ).map((key) => (
                <TabsContent key={key} value={key} className="mt-6">
                  <Accordion type="single" collapsible className="space-y-3">
                    {SUPPORT_FAQS[key].map((faq) => (
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
                </TabsContent>
              ))}
            </Tabs>
          </Reveal>

          {/* Support panel */}
          <Reveal direction="left" delay={0.08}>
            <Card className="gap-0 border-ink-900 bg-ink-900 p-6 text-white sm:p-8">
              <h2 className="font-heading text-xl font-extrabold">
                Still have questions?
              </h2>
              <p className="mt-1.5 text-sm text-ink-200/85">
                Contact our support team and we&apos;ll get back to you as soon
                as possible.
              </p>

              <div className="mt-6">
                <ContactForm variant="dark" />
              </div>

              <p className="mt-4 text-xs text-ink-200/85">
                Prefer direct contact? Email us at{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="font-semibold text-cta-300 underline underline-offset-2"
                >
                  {SITE.email}
                </a>
              </p>
              <p className="mt-2 text-xs text-ink-200/85">
                Or see all the ways to reach us on our{" "}
                <Link
                  href="/support/contact"
                  className="font-semibold text-cta-300 underline underline-offset-2"
                >
                  contact page
                </Link>
                .
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
