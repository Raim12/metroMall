"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Search box that sends the shopper to the catalogue results
 * (/catalogue?q=…). Used in the header's search panel and on the homepage.
 */
export function SiteSearch({
  autoFocus = false,
  size = "md",
  className,
  onSearched,
}: {
  autoFocus?: boolean;
  size?: "md" | "lg";
  className?: string;
  onSearched?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
    onSearched?.();
  };

  const lg = size === "lg";

  return (
    <form role="search" onSubmit={submit} className={cn("relative flex w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          lg ? "left-4 size-5" : "left-3 size-4",
        )}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fans, geysers, brands…"
        aria-label="Search products"
        className={cn(
          "w-full min-w-0 rounded-l-xl border border-r-0 border-input bg-white text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-400 [&::-webkit-search-cancel-button]:hidden",
          lg ? "h-13 pl-12 pr-3 text-base" : "h-11 pl-9 pr-3 text-sm",
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-r-xl bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700",
          lg ? "px-6 text-base" : "px-4 text-sm",
        )}
      >
        Search
      </button>
    </form>
  );
}
