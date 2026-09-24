import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueryHandledToggle } from "@/components/admin/query-handled-toggle";
import { listQueries } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const handled = filter === "handled" ? true : filter === "open" ? false : undefined;
  const queries = await listQueries(handled);

  const tabs = [
    { label: "All", value: undefined },
    { label: "Open", value: "open" },
    { label: "Handled", value: "handled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Export and support messages from the website forms.
        </p>
      </div>

      <div className="flex gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/enquiries?filter=${t.value}` : "/admin/enquiries"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === t.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "bg-white hover:border-brand-300",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {queries.length === 0 ? (
        <Card className="p-16 text-center text-sm text-muted-foreground">
          Nothing here.
        </Card>
      ) : (
        <ul className="space-y-3">
          {queries.map((q) => (
            <li key={q.id}>
              <Card className={cn("gap-3 p-5", q.handled && "opacity-70")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={cn(
                          "border-transparent",
                          q.type === "EXPORT"
                            ? "bg-brand-100 text-brand-800 hover:bg-brand-100"
                            : "bg-muted text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {q.type === "EXPORT" ? "Export" : "Support"}
                      </Badge>
                      <span className="font-semibold">
                        {q.firstName} {q.lastName ?? ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {q.createdAt.toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {q.subject ? (
                      <p className="mt-1.5 text-sm font-medium">{q.subject}</p>
                    ) : null}

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <a
                        href={`mailto:${q.email}`}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-brand-700"
                      >
                        <Mail className="size-3.5" aria-hidden />
                        {q.email}
                      </a>
                      {q.phone ? (
                        <a
                          href={`tel:${q.phone}`}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-brand-700"
                        >
                          <Phone className="size-3.5" aria-hidden />
                          {q.phone}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <QueryHandledToggle id={q.id} handled={q.handled} />
                </div>

                <p className="whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm leading-relaxed">
                  {q.message}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
