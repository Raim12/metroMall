import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/shared/reveal";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import { WhatsAppBadge } from "@/components/shared/whatsapp-badge";
import { OPENING_HOURS, SITE, WHATSAPP_LINK } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Call, email, WhatsApp or visit Metro Electric Co. on M.A. Jinnah Road, Karachi — our team replies within one business day.",
};

interface Channel {
  Icon: React.ComponentType<{ className?: string }>;
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
    Icon: WhatsAppIcon,
    title: "WhatsApp",
    blurb: "Our preferred channel — message us any time.",
    value: SITE.whatsapp,
    href: WHATSAPP_LINK,
  },
  {
    Icon: MapPin,
    title: "Office",
    blurb: "Visit us at our office.",
    value: SITE.address.full,
    href: SITE.mapLink,
  },
  {
    Icon: Phone,
    title: "Phone",
    blurb: `Call us, ${SITE.hours}`,
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
            WhatsApp or call us for the quickest reply, or fill out the form
            and we&apos;ll get back to you.
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
                  <span className="mt-1 flex items-center gap-2">
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="break-words text-sm font-semibold text-cta-300 underline underline-offset-4"
                    >
                      {value}
                    </a>
                    {title === "Phone" ? <WhatsAppBadge /> : null}
                  </span>
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

            {/* The full week, since the cards above only have room for a byline. */}
            <Card className="mt-4 gap-0 p-6">
              <h2 className="flex items-center gap-2.5 font-heading text-base font-extrabold">
                <Clock className="size-4 text-brand-600" aria-hidden />
                Opening hours
              </h2>
              <dl className="mt-4 space-y-2.5">
                {OPENING_HOURS.map((row) => (
                  <div key={row.days}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
                      <dt className="font-semibold text-ink-900">{row.days}</dt>
                      <dd className="tabular-nums text-muted-foreground">{row.time}</dd>
                    </div>
                    {row.note ? (
                      <p className="mt-0.5 text-xs text-brand-700">{row.note}</p>
                    ) : null}
                  </div>
                ))}
              </dl>
            </Card>
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
