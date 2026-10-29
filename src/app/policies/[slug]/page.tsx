import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { SITE } from "@/lib/constants";
import {
  BANK_ACCOUNT,
  COD_CITY,
  DELIVERY_CHARGE,
  MAX_DELIVERY_WORKING_DAYS,
  RECEIPT_NOTE,
} from "@/lib/delivery";

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
        body: "Courier and cargo partners (to deliver your order), payment providers (to process payment), and the brand's service centre when we register a warranty complaint for you. We do not sell or rent your information to third parties.",
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
        body: "If you ordered the wrong size or colour, we will exchange it within the same 7-day window, subject to stock. You cover return delivery unless the error was ours.",
      },
      {
        heading: "Installed products and warranty",
        body: "Once a product has been installed it is covered by its official brand warranty rather than the return policy. Warranty periods depend on the brand — from 1 year, up to 5–10 years for some brands such as Lahore Fan. We register warranty complaints with the brand's official service centre on your behalf, or guide you to the brand's direct support; repairs are carried out by the brand's authorised technicians.",
      },
      {
        heading: "Refunds",
        body: "Approved refunds are made by bank transfer within 7–10 working days.",
      },
    ],
  },
  delivery: {
    title: "Delivery Policy",
    intro: `We deliver across Pakistan. A delivery charge of Rs. ${DELIVERY_CHARGE} applies to every order.`,
    sections: [
      {
        heading: "Cash on Delivery (Karachi only)",
        body: `Transfer the Rs. ${DELIVERY_CHARGE} delivery charge in advance, then pay for your order in cash when it arrives.`,
      },
      {
        heading: "Full payment in advance (all cities)",
        body: `Transfer the full order amount plus the Rs. ${DELIVERY_CHARGE} delivery charge. Outside ${COD_CITY}, this is the only payment option.`,
      },
      {
        heading: "Bank details",
        body: `${BANK_ACCOUNT.bank} · IBAN ${BANK_ACCOUNT.iban} · Account title: ${BANK_ACCOUNT.title}. ${RECEIPT_NOTE}`,
      },
      {
        heading: "Delivery times",
        body: `In-stock orders are dispatched once your payment receipt is confirmed, and delivered within a maximum of ${MAX_DELIVERY_WORKING_DAYS} working days. We aim to deliver sooner wherever we can, and share the courier or cargo details with you on WhatsApp.`,
      },
      {
        heading: "Bulk and dealer orders",
        body: "Wholesale and bulk orders are quoted separately, including delivery. Send your requirements through our Wholesale page.",
      },
      {
        heading: "Inspection on arrival",
        body: "Please inspect the packaging before accepting delivery. Report any transit damage within 24 hours, with photos, and we will arrange a replacement or repair with you.",
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
        body: "Product details and specifications are provided by the brands. We work hard to show them accurately; figures such as wattage are measured by the brand under standard test conditions and may vary in real-world use.",
      },
      {
        heading: "Warranty",
        body: `Products carry their brand's official warranty; periods and terms are set by each brand. ${SITE.name} is an authorized dealer: we register warranty complaints with the brand's official service centre on your behalf, or guide you to the brand's direct support, but repairs are carried out by the brand's own authorised technicians.`,
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
