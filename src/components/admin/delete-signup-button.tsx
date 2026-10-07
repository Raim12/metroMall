"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteLaunchSignup } from "@/lib/admin/launch-list-actions";

export function DeleteSignupButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove ${name} from the launch list?`)) return;
        startTransition(async () => {
          await deleteLaunchSignup(id);
        });
      }}
      aria-label={`Remove ${name}`}
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
    </button>
  );
}
