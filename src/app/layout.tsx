import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import localFont from "next/font/local";

import { Navbar } from "@/components/layout/navbar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/shared/motion-provider";
import { DeferredChrome } from "@/components/shared/deferred-chrome";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { SITE } from "@/lib/constants";
import "./globals.css";

/**
 * The typeface from the Metro Electric Co. logo, used only for the word
 * "Metro" in running text so the brand reads consistently with the mark.
 * `display: "block"` because a brand word swapping typeface mid-read is worse
 * than a brief pause.
 */
const bazooka = localFont({
  src: "../../public/fonts/bazooka.woff2",
  variable: "--font-brand",
  display: "block",
  weight: "400",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Headings: a heavy grotesque that matches the Metro wordmark's lettering. */
const archivo = Archivo({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Authorized Dealer of Fans & Home Appliances in Pakistan`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "fans Karachi",
    "home appliances Karachi",
    "authorized dealer",
    "wholesale fans Pakistan",
    "inverter fan",
    "AC DC fan",
    "geysers",
    "gas appliances",
    "Metro Electric",
  ],
  openGraph: {
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_PK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `suppressHydrationWarning` applies to this element's own attributes only
    // (not its subtree). Browser extensions — QuillBot injects
    // `data-qb-installed`, password managers and translators do similar — stamp
    // attributes onto <html> before React hydrates, which React would otherwise
    // report as a server/client mismatch.
    // The font variables live on <html> because that is where globals.css
    // applies `font-sans`; set on <body> they were out of scope there and the
    // whole site fell back to the browser's default serif.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${archivo.variable} ${bazooka.variable}`}
    >
      <body className="min-h-dvh bg-background antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <MotionProvider>
          <AnnouncementBar />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />

          <CartHydrator />
          <DeferredChrome />
        </MotionProvider>
      </body>
    </html>
  );
}
