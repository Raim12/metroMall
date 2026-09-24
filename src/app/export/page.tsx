import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExportForm } from "@/components/forms/export-form";
import { Reveal } from "@/components/shared/reveal";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Export Queries",
  description:
    "Bulk orders, international shipping and custom specifications — reach the Metro Electric Co. export team.",
};

export default function ExportPage() {
  return (
    <div className="metro-wash min-h-[70vh]">
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Reveal className="text-center">
          <h1 className="font-heading text-4xl font-extrabold sm:text-5xl">
            Export Queries
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Have questions about bulk orders, international shipping or custom
            specifications? Reach out to our export team.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Contact card */}
          <Reveal direction="right">
            <Card className="h-full gap-0 p-6 sm:p-8">
              <h2 className="font-heading text-xl font-extrabold">
                Contact Our Export Team
              </h2>

              <ul className="mt-6 space-y-5">
                {[
                  {
                    Icon: Phone,
                    label: "Phone",
                    caption: SITE.contactPerson,
                    entries: [
                      { value: SITE.phone, href: `tel:+${SITE.phoneDigits}` },
                      ...SITE.landlines.map((line) => ({
                        value: line,
                        href: `tel:${line.replace(/[^\d+]/g, "")}`,
                      })),
                    ],
                  },
                  {
                    Icon: Mail,
                    label: "Email",
                    entries: [
                      { value: SITE.email, href: `mailto:${SITE.email}` },
                    ],
                  },
                  {
                    Icon: MapPin,
                    label: "Address",
                    entries: [{ value: SITE.address.full, href: SITE.mapLink }],
                  },
                ].map(({ Icon, label, caption, entries }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50">
                      <Icon className="size-4 text-brand-700" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {label}
                        {caption ? (
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            ({caption})
                          </span>
                        ) : null}
                      </p>
                      <div className="flex flex-col">
                        {entries.map((entry) => (
                          <a
                            key={entry.value}
                            href={entry.href}
                            className="break-words text-sm text-muted-foreground transition-colors hover:text-brand-700"
                          >
                            {entry.value}
                          </a>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Separator className="my-7" />

              <p className="text-sm font-semibold">Prefer WhatsApp?</p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                  <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.05 22l5.34-1.4a9.84 9.84 0 0 0 4.65 1.18c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2zm0 17.96c-1.47 0-2.91-.4-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.12 8.12 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.68 8.2-8.21 8.2z" />
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16-.35.22-.65.08a8.1 8.1 0 0 1-2.39-1.47 9 9 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5 1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
                </svg>
                Message on WhatsApp
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Available {SITE.hours}
              </p>
            </Card>
          </Reveal>

          {/* Form */}
          <Reveal direction="left" delay={0.08}>
            <Card className="h-full gap-0 p-6 sm:p-8">
              <h2 className="font-heading text-xl font-extrabold">
                Send Your Query
              </h2>
              <div className="mt-6">
                <ExportForm />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
