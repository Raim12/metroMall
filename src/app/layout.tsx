import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | AC DC Inverter Ceiling Fans in Pakistan`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "inverter fan",
    "BLDC fan Pakistan",
    "ceiling fan",
    "AC DC fan",
    "energy saving fan",
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
    // (not its subtree). Browser extensions â€” QuillBot injects
    // `data-qb-installed`, password managers and translators do similar â€” stamp
    // attributes onto <html> before React hydrates, which React would otherwise
    // report as a server/client mismatch.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} min-h-dvh bg-background antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <Navbar />
        <main id="main">{children}</main>
        <Footer />

        <CartHydrator />
        <CartSheet />
        <FloatingActions />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
