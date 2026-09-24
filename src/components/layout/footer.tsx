import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/shared/social-icons";
import { FOOTER_COLUMNS, SITE } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-ink-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: logo + link columns */}
          <div>
            <Logo tone="light" className="h-11 w-auto sm:h-12" />

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300/85">
              {SITE.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.heading}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cta-300">
                    {column.heading}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-ink-200/85 transition-colors hover:text-cta-300"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right: contact + map */}
          <div className="space-y-4">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cta-300" aria-hidden />
                <span className="text-ink-200/85">
                  {SITE.address.line1}
                  <br />
                  {SITE.address.line2}
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-cta-300" aria-hidden />
                <span className="flex flex-col gap-0.5">
                  <a
                    href={`tel:+${SITE.phoneDigits}`}
                    className="text-ink-200/85 transition-colors hover:text-cta-300"
                  >
                    {SITE.phone}
                  </a>
                  {SITE.landlines.map((line) => (
                    <a
                      key={line}
                      href={`tel:${line.replace(/[^\d+]/g, "")}`}
                      className="text-ink-200/85 transition-colors hover:text-cta-300"
                    >
                      {line}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="size-4 shrink-0 text-cta-300" aria-hidden />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-ink-200/85 transition-colors hover:text-cta-300"
                >
                  {SITE.email}
                </a>
              </li>
            </ul>

            <div className="overflow-hidden rounded-2xl border border-white/15 shadow-lg">
              <iframe
                src={SITE.mapEmbed}
                title="Metro Electric Co. location on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-56 w-full border-0"
              />
            </div>
            <a
              href={SITE.mapLink}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex text-xs font-semibold text-cta-300 underline-offset-4 hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row">
          <p className="text-xs text-ink-300/70">
            Â© {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { href: SITE.social.instagram, Icon: InstagramIcon, label: "Instagram" },
              { href: SITE.social.facebook, Icon: FacebookIcon, label: "Facebook" },
              { href: SITE.social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid size-9 place-items-center rounded-lg border border-white/15 text-ink-200 transition-colors hover:border-cta-300 hover:text-cta-300"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
