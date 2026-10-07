"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { joinLaunchList } from "@/lib/launch-actions";
import { HOUSE_BRANDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-[#c9a227] focus:bg-white/[0.09]";

/** "Get notified" sign-up on the launch page; entries appear under Admin → Launch list. */
export function NotifyForm({ defaultBrand = "legends" }: { defaultBrand?: string }) {
  const [brand, setBrand] = React.useState(
    HOUSE_BRANDS.some((b) => b.slug === defaultBrand) ? defaultBrand : "legends",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await joinLaunchList({
        brand,
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        city: String(data.get("city") ?? ""),
        website: String(data.get("website") ?? ""),
      });
      if (result.ok) setDone(true);
      else setError(result.error);
    });
  };

  const brandName = HOUSE_BRANDS.find((b) => b.slug === brand)?.name ?? "LEGENDS";

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
        <CheckCircle2 className="size-10 text-[#e2c25b]" aria-hidden />
        <p className="font-heading text-xl font-extrabold text-white">You&apos;re on the list</p>
        <p className="max-w-sm text-sm text-white/65">
          We&apos;ll message you the moment {brandName} launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          Notify me about
        </legend>
        <div className="flex flex-wrap gap-2">
          {HOUSE_BRANDS.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => setBrand(b.slug)}
              aria-pressed={brand === b.slug}
              className={cn(
                "rounded-full border px-4 py-1.5 font-heading text-sm font-black italic tracking-wide transition-colors",
                brand === b.slug
                  ? "border-[#c9a227] bg-[#c9a227] text-[#14100c]"
                  : "border-white/20 text-white/75 hover:border-white/40 hover:text-white",
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input name="name" required autoComplete="name" placeholder="Your name" className={inputClass} />
        </label>
        <label className="block">
          <span className="sr-only">Phone / WhatsApp number</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="Phone / WhatsApp"
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">City (optional)</span>
          <input name="city" autoComplete="address-level2" placeholder="City (optional)" className={inputClass} />
        </label>
      </div>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {error ? (
        <p className="text-sm text-[#ffb4a8]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b8901c] via-[#e2c25b] to-[#b8901c] font-heading text-sm font-black uppercase tracking-[0.15em] text-[#14100c] shadow-[0_8px_30px_-8px_rgba(226,194,91,0.6)] transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Get notified
      </button>
      <p className="text-center text-xs text-white/45">
        We&apos;ll only contact you about the launch. No spam.
      </p>
    </form>
  );
}
