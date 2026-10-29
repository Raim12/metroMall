"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { WHATSAPP_LINK } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import { cn } from "@/lib/utils";

/** Fixed bottom-right WhatsApp button + scroll-to-top. */
export function FloatingActions() {
  const pathname = usePathname();
  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setShowTop(window.scrollY > 480);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Shopper-facing: on admin pages it only covered order totals on phones.
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 print:hidden">
      {/*
        Kept mounted and toggled with classes rather than mounted/unmounted
        behind AnimatePresence: CSS gives both the enter and the exit
        transition, so this no longer needs an animation library. Hidden from
        the accessibility tree and taken out of the tab order while invisible.
      */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll back to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={cn(
          "grid size-11 place-items-center rounded-full bg-cta-400 text-cta-foreground shadow-lg shadow-cta-600/25 hover:bg-cta-500",
          "transition duration-200 ease-out motion-reduce:transition-none",
          showTop
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2.5 scale-75 opacity-0",
        )}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat with us on WhatsApp"
        className="group relative grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/35 transition-transform duration-150 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
      >
        {/* Attention pulse */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
        <WhatsAppIcon className="relative size-6" />
      </a>
    </div>
  );
}
