"use client";

import * as React from "react";
import { Check, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleQueryHandled } from "@/lib/admin/actions";

export function QueryHandledToggle({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("handled", String(!handled));

      const result = await toggleQueryHandled(formData);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={handled ? "outline" : "default"}
      disabled={pending}
      onClick={toggle}
      className={handled ? "" : "bg-brand-600 hover:bg-brand-700"}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : handled ? (
        <Undo2 className="size-3.5" aria-hidden />
      ) : (
        <Check className="size-3.5" aria-hidden />
      )}
      {handled ? "Reopen" : "Mark handled"}
    </Button>
  );
}
