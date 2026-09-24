import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueBrowser } from "@/components/product/catalogue-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { CtaBanner } from "@/components/home/cta-banner";
import { getAllProducts } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Products Catalogue",
  description:
    "Browse the full Metro Electric Co. range — inverter ceiling fans, pedestal fans, exhaust fans, false-ceiling cassettes and bracket fans.",
};

function CatalogueSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-96 rounded-xl" />
      ))}
    </div>
  );
}

export default async function CataloguePage() {
  const products = await getAllProducts();

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Products Catalogue
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every Metro fan is built on the same BLDC platform — pick the form
            factor that suits the room.
          </p>
        </header>

        <Suspense fallback={<CatalogueSkeleton />}>
          <CatalogueBrowser products={products} />
        </Suspense>
      </div>

      <CtaBanner
        title="Bulk or dealer pricing?"
        body="Tell us the volumes and destination — our export desk quotes FOB and CIF within one business day."
        cta="Send an export query"
        href="/export"
      />
    </>
  );
}
