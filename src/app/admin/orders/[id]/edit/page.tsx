import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderForm, type OrderCustomerValues } from "@/components/admin/order-form";
import { getOrder } from "@/lib/admin/queries";
import { PAYMENT_METHODS, PROVINCES, WALK_IN_ADDRESS } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit order" };

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const initial: OrderCustomerValues = {
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email,
    addressLine1: order.addressLine1 === WALK_IN_ADDRESS ? "" : order.addressLine1,
    addressLine2: order.addressLine2 ?? "",
    city: order.city,
    province: (PROVINCES as readonly string[]).includes(order.province)
      ? (order.province as OrderCustomerValues["province"])
      : "Sindh",
    postalCode: order.postalCode ?? "",
    notes: order.notes ?? "",
    paymentMethod: (PAYMENT_METHODS as readonly string[]).includes(order.paymentMethod)
      ? (order.paymentMethod as OrderCustomerValues["paymentMethod"])
      : "COD",
    shipping: order.shipping,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/admin/orders/${order.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to {order.orderNumber}
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Edit {order.orderNumber}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer, address, payment method and delivery charge. To change the items, delete this order and
          record a new one.
        </p>
      </div>
      <OrderForm mode="edit" orderId={order.id} initial={initial} />
    </div>
  );
}
