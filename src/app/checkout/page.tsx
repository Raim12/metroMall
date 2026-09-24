import type { Metadata } from "next";

import { CheckoutForm } from "@/components/cart/checkout-form";
import { availablePaymentMethods } from "@/lib/payments";
import { FLAT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Metro Electric Co. order.",
};

// Which payment methods exist depends on server-side configuration.
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const methods = availablePaymentMethods();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Delivery across Pakistan. Your details are only used to fulfil this
        order.
      </p>

      <div className="mt-10">
        <CheckoutForm
          availableMethods={methods}
          freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
          flatShippingFee={FLAT_SHIPPING_FEE}
        />
      </div>
    </div>
  );
}
