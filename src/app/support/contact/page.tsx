import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/shared/reveal";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Call, email, WhatsApp or visit Metro Electric Co. on M.A. Jinnah Road, Karachi â€” our team replies within one business day.",
};

interface Channel {
  Icon: typeof Mail;
  title: string;
  blurb: string;
  value: string;
  href: string;
  /** Additional numbers listed beneath the primary one. */
  extra?: { value: string; href: string }[];
}

const CHANNELS: Channel[] = [
  {
    Icon: Mail,
    title: "Email",
    blurb: "Our friendly team is here to help.",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    Icon: MessageCircle,
    title: "Live chat",
    blurb: "Message us on WhatsApp any time.",
    value: SITE.whatsapp,
    href: WHATSAPP_LINK,
  },
  {
    Icon: MapPin,
    title: "Office",
    blurb: "Visit us at our factory office.",
    value: SITE.address.full,
    href: SITE.mapLink,
  },
  {
    Icon: Phone,
    title: "Phone",
    blurb: SITE.hours,
    value: SITE.phone,
    href: `tel:+${SITE.phoneDigits}`,
    /** Landlines, listed under the mobile number. */
    extra: SITE.landlines.map((line) => ({
      value: line,
      href: `tel:${line.replace(/[^\d+]/g, "")}`,
    })),
  },
];

export default function ContactPage() {
  return (
    <div className="metro-wash">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Reveal className="text-center">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Chat with our friendly team!
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            We&apos;d love to hear from you. Fill out the form or reach us
            through any of the channels below.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Reveal direction="right">
            <div className="grid h-full gap-4 sm:grid-cols-2">
              {CHANNELS.map(({ Icon, title, blurb, value, href, extra }) => (
                <Card
                  key={title}
                  className="gap-2 border-ink-900 bg-ink-900 p-5 text-white transition-transform hover:-translate-y-1"
                >
                  <Icon className="size-5 text-cta-300" aria-hidden />
                  <h2 className="font-heading text-base font-bold">{title}</h2>
                  <p className="text-xs text-ink-200/85">{blurb}</p>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="mt-1 break-words text-sm font-semibold text-cta-300 underline underline-offset-4"
                  >
                    {value}
                  </a>
                  {extra?.map((line) => (
                    <a
                      key={line.value}
                      href={line.href}
                      className="break-words text-sm font-semibold text-cta-300 underline underline-offset-4"
                    >
                      {line.value}
                    </a>
                  ))}
                </Card>
              ))}
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.08}>
            <Card className="h-full gap-0 border-ink-900 bg-ink-900 p-6 text-white sm:p-8">
              <h2 className="font-heading text-xl font-extrabold">
                Send us a message
              </h2>
              <div className="mt-6">
                <ContactForm variant="dark" />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
