import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { JoinUsForm } from "@/components/forms/join-us-form";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Apply to join Metro Electric Co. — engineering, production, quality and sales roles in Karachi, Pakistan.",
};

export default function JoinUsPage() {
  return (
    <div className="bg-brand-50/60">
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <Reveal>
          <Card className="gap-0 p-6 sm:p-9">
            <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">
              Join Us
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Please fill in the details below to apply for a role.
            </p>

            <div className="mt-8">
              <JoinUsForm />
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
