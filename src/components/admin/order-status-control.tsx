"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/admin/actions";
import { OrderStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

/** The transitions an owner actually makes day to day. */
const NEXT: { status: OrderStatus; label: string; primary?: boolean }[] = [
  { status: OrderStatus.PAID, label: "Mark paid", primary: true },
  { status: OrderStatus.FULFILLED, label: "Mark fulfilled", primary: true },
  { status: OrderStatus.CANCELLED, label: "Cancel" },
  { status: OrderStatus.REFUNDED, label: "Refund" },
];

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [pending, startTransition] = React.useTransition();

  function apply(status: OrderStatus) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("status", status);

      const result = await updateOrderStatus(formData);
      if (result.ok) {
        toast.success(result.message ?? "Order updated.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
      ) : null}

      {NEXT.filter((n) => n.status !== current).map((n) => (
        <Button
          key={n.status}
          size="sm"
          variant={n.primary ? "default" : "outline"}
          disabled={pending}
          onClick={() => apply(n.status)}
          className={cn(
            n.primary && "bg-brand-600 hover:bg-brand-700",
            n.status === OrderStatus.CANCELLED &&
              "text-destructive hover:bg-destructive/10",
          )}
        >
          {n.label}
        </Button>
      ))}
    </div>
  );
}
