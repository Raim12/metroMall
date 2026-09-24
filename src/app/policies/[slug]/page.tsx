import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { SITE } from "@/lib/constants";

type PolicySlug = "privacy" | "returns" | "delivery" | "terms";

const POLICIES: Record<
  PolicySlug,
  { title: string; intro: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "Privacy Policy",
    intro: `${SITE.name} collects the minimum information needed to process your order and support your product. We do not sell personal data.`,
    sections: [
      {
        heading: "What we collect",
        body: "Your name, delivery address, phone number and email when you place an order; the contents of any form you submit; and standard technical data such as device type and pages visited.",
      },
      {
        heading: "How we use it",
        body: "To process and deliver orders, handle warranty claims, respond to enquiries, and improve the website. Payment details are handled by our payment provider and never stored on our servers.",
      },
      {
        heading: "Who we share it with",
        body: "Courier partners (to deliver your order) and our payment gateway (to process payment). We do not sell or rent your information to third parties.",
      },
      {
        heading: "Your choices",
        body: `You can request a copy of your data, or ask us to delete it, by emailing ${SITE.email}. We respond within 30 days.`,
      },
    ],
  },
  returns: {
    title: "Return and Exchange Policy",
    intro:
      "We want you to be satisfied with your purchase. If something is not right, here is how returns and exchanges work.",
    sections: [
      {
        heading: "7-day return window",
        body: "Unused products in their original, undamaged packaging can be returned within 7 days of delivery. The product must include all accessories, the remote, mounting hardware and the manual.",
      },
      {
        heading: "Exchanges",
        body: "If you ordered the wrong size or colour, we will exchange it within the same 7-day window, subject to stock. You cover return shipping unless the error was ours.",
      },
      {
        heading: "Installed products",
        body: "Once a fan has been installed it is covered by the warranty rather than the return policy. Any manufacturing defect is repaired or replaced free of charge for one year.",
      },
      {
        heading: "Refunds",
        body: "Approved refunds are issued to the original payment method within 7–10 working days. Cash on Delivery orders are refunded by bank transfer.",
      },
    ],
  },
  delivery: {
    title: "Delivery Policy",
    intro:
      "We deliver across Pakistan through vetted courier partners, and ship internationally for export orders.",
    sections: [
      {
        heading: "Dispatch times",
        body: "In-stock orders are dispatched within 48 hours of confirmation. You receive a tracking number by SMS and email once the parcel leaves our facility.",
      },
      {
        heading: "Delivery times",
        body: "Major cities typically receive orders in 2–4 working days. Remote areas may take up to 7 working days. Delays during peak summer demand are possible and we will keep you informed.",
      },
      {
        heading: "Delivery charges",
        body: "Charges are calculated at checkout based on destination and order weight. Bulk and dealer orders are quoted separately.",
      },
      {
        heading: "Inspection on arrival",
        body: "Please inspect the packaging before accepting delivery. Report any transit damage within 48 hours with photos and we will arrange a free replacement.",
      },
    ],
  },
  terms: {
    title: "Terms and Conditions",
    intro: `By using this website and purchasing from ${SITE.name}, you agree to the terms set out below.`,
    sections: [
      {
        heading: "Orders and pricing",
        body: "All prices are in Pakistani Rupees and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and to decline or cancel an order, in which case any payment taken is refunded in full.",
      },
      {
        heading: "Product information",
        body: "We work hard to describe our products accurately. Specifications such as wattage and RPM are measured under standard test conditions and may vary by approximately 10% in real-world use.",
      },
      {
        heading: "Warranty",
        body: "Products carry a 1-year repair warranty against manufacturing defects. The warranty excludes physical damage, water ingress, unauthorised repairs and operation outside the rated voltage range.",
      },
      {
        heading: "Limitation of liability",
        body: "Our liability in connection with any product is limited to the purchase price of that product. Nothing in these terms limits liability that cannot be limited under Pakistani law.",
      },
      {
        heading: "Contact",
        body: `Questions about these terms can be sent to ${SITE.email} or ${SITE.phone}.`,
      },
    ],
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug as PolicySlug];
  if (!policy) return { title: "Not found" };
  return { title: policy.title, description: policy.intro };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug as PolicySlug];

  if (!policy) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <Reveal>
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
          {policy.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {policy.intro}
        </p>

        <div className="mt-10 space-y-8">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-lg font-bold">
                {section.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          Last updated {new Date().toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
          })}
          . These policies are provided as a starting point and should be
          reviewed by your legal advisor before launch.
        </p>
      </Reveal>
    </div>
  );
}
