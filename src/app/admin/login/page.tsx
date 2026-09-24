import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";
import { isAdminConfigured } from "@/lib/admin/auth";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = isAdminConfigured();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href={null} className="h-12 w-auto" />
        </div>

        {configured ? (
          <Suspense>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
            <p className="font-semibold text-destructive">
              Admin access is not configured
            </p>
            <p className="mt-2 text-muted-foreground">
              Run{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                npm run admin:password
              </code>{" "}
              and add the printed values to your{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                .env
              </code>
              , then restart the server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
