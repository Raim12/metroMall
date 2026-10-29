import { WhatsAppIcon } from "@/components/shared/social-icons";
import { WHATSAPP_LINK } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Small green WhatsApp button set beside the mobile number, since the number
 * is the same for calls and WhatsApp and the team prefers both.
 */
export function WhatsAppBadge({ className }: { className?: string }) {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Message us on WhatsApp"
      title="WhatsApp us"
      className={cn(
        "inline-grid size-6 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110",
        className,
      )}
    >
      <WhatsAppIcon className="size-3.5" />
    </a>
  );
}
