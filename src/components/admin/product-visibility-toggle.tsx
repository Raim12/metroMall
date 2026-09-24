"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setProductActive } from "@/lib/admin/actions";

export function ProductVisibilityToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("active", String(!active));

      const result = await setProductActive(formData);
      if (result.ok) toast.success(result.message ?? "Updated.");
      else toast.error(result.error);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      disabled={pending}
      className={active ? "" : "border-brand-500 text-brand-700"}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : active ? (
        <EyeOff className="size-4" aria-hidden />
      ) : (
        <Eye className="size-4" aria-hidden />
      )}
      {active ? "Hide from shop" : "Publish to shop"}
    </Button>
  );
}
