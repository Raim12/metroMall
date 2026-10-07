"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteOrder } from "@/lib/admin/order-actions";

/** Permanently deletes an order (for test/duplicate orders), after confirmation. */
export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    const ok = window.confirm(
      `Delete order ${orderNumber} permanently?\n\nUse this for test or duplicate orders. For a real order the customer cancelled, use "Cancel" instead so the record is kept.\n\nAny stock this order took will be put back.`,
    );
    if (!ok) return;
    startTransition(async () => {
      // Redirects to the orders list on success; only returns on failure.
      const result = await deleteOrder(orderId);
      if (result && !result.ok) toast.error(result.error);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
      Delete order
    </Button>
  );
}
