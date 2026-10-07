import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OrderForm } from "@/components/admin/order-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New order" };

/** Record an order taken by phone or at the shop. */
export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-extrabold">New order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record an order taken by phone or at the shop. Stock is updated the same way as a website order.
        </p>
      </div>
      <OrderForm mode="new" />
    </div>
  );
}
