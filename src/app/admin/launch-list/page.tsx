import Link from "next/link";
import { Download, ExternalLink, MessageCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteSignupButton } from "@/components/admin/delete-signup-button";
import { prisma } from "@/lib/prisma";
import { HOUSE_BRANDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Launch list" };

/** Pakistani mobile numbers as wa.me wants them: 0300… -> 92300… */
const whatsappNumber = (phone: string) => phone.replace(/^\+/, "").replace(/^0/, "92");

export default async function LaunchListPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: brandParam } = await searchParams;
  const brand = HOUSE_BRANDS.some((b) => b.slug === brandParam) ? brandParam : undefined;

  const [signups, counts] = await Promise.all([
    prisma.launchSignup.findMany({
      where: brand ? { brand } : {},
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.launchSignup.groupBy({ by: ["brand"], _count: true }),
  ]);
  const countOf = (slug?: string) =>
    slug ? (counts.find((c) => c.brand === slug)?._count ?? 0) : counts.reduce((s, c) => s + c._count, 0);
  const brandName = (slug: string) => HOUSE_BRANDS.find((b) => b.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Launch list</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            People who asked to be told when your own brands launch, from the{" "}
            <Link href="/legends" target="_blank" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
              LEGENDS page
              <ExternalLink className="size-3" aria-hidden />
            </Link>
            . Download the list to message everyone on launch day.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={`/admin/launch-list/export${brand ? `?brand=${brand}` : ""}`}>
            <Download className="size-4" aria-hidden />
            Download for Excel
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[{ slug: undefined, name: "All" }, ...HOUSE_BRANDS].map((b) => (
          <Link
            key={b.name}
            href={b.slug ? `/admin/launch-list?brand=${b.slug}` : "/admin/launch-list"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              brand === b.slug ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:border-brand-300",
            )}
          >
            {b.name} <span className="tabular-nums opacity-70">{countOf(b.slug)}</span>
          </Link>
        ))}
      </div>

      <Card className="gap-0 p-0">
        {signups.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            No sign-ups yet. Share <strong>metroelectromall.com/legends</strong> on social media and WhatsApp
            to start collecting them.
          </p>
        ) : (
          <ul className="divide-y">
            {signups.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <a href={`tel:${s.phone}`} className="hover:text-brand-700">
                      {s.phone}
                    </a>
                    {s.city ? ` · ${s.city}` : ""} · {brandName(s.brand)} ·{" "}
                    {s.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber(s.phone)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`WhatsApp ${s.name}`}
                  className="rounded-md p-2 text-[#1fa855] transition-colors hover:bg-[#25D366]/10"
                >
                  <MessageCircle className="size-4" aria-hidden />
                </a>
                <DeleteSignupButton id={s.id} name={s.name} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
