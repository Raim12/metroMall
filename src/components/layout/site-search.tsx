"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import type { Suggestion } from "@/app/api/search/suggest/route";
import { cn, formatPkr } from "@/lib/utils";

/**
 * Search box with a live results dropdown.
 *
 * Typing queries /api/search/suggest and shows matching products immediately;
 * picking one goes straight to that product. Submitting the form still runs
 * the full catalogue search (/catalogue?q=…), so the box works unchanged if
 * the suggestion request is slow, fails, or the shopper just hits Enter.
 *
 * Behaves as a combobox for assistive tech and for the keyboard: Up/Down move
 * through results, Enter opens the highlighted one, Escape closes the list.
 */

/** Keystrokes settle before a request goes out; ~180ms is below notice. */
const DEBOUNCE_MS = 180;

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
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  /** -1 means "nothing highlighted", so Enter runs the full search. */
  const [active, setActive] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Fetch suggestions for the current query.
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // An in-flight request for an older prefix must not overwrite a newer
    // result, so each run aborts the one before it.
    const controller = new AbortController();
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
        setActive(-1);
        setOpen(true);
      } catch {
        // Aborted or offline: leave whatever is on screen and let the form
        // submit handle it.
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  // Close when focus or a click leaves the box.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
      onSearched?.();
    },
    [router, onSearched],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const chosen = suggestions[active];
    if (chosen) {
      go(`/product/${chosen.slug}`);
      return;
    }
    const q = query.trim();
    go(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      // Wraps through -1, so arrowing past either end returns to the plain
      // query and Enter falls back to the full catalogue search.
      setActive((i) => {
        const next = i + delta;
        if (next < -1) return suggestions.length - 1;
        if (next >= suggestions.length) return -1;
        return next;
      });
    }
  };

  const lg = size === "lg";
  const showList = open && query.trim().length >= 2;
  const activeId = active >= 0 ? `${listId}-opt-${active}` : undefined;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <form role="search" onSubmit={submit} className="relative flex w-full">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-muted-foreground",
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
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search fans, geysers, brands…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          className={cn(
            "w-full min-w-0 rounded-l-xl border border-r-0 border-input bg-white text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-400 [&::-webkit-search-cancel-button]:hidden",
            lg ? "h-13 pl-12 pr-9 text-base" : "h-11 pl-9 pr-8 text-sm",
          )}
        />
        {loading ? (
          <Loader2
            className={cn(
              "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground",
              lg ? "right-[7.5rem]" : "right-[5.5rem]",
            )}
            aria-hidden
          />
        ) : null}
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

      {showList ? (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl shadow-ink-950/10">
          {suggestions.length > 0 ? (
            <>
              <ul id={listId} role="listbox" aria-label="Product suggestions" className="max-h-[22rem] overflow-y-auto py-1">
                {suggestions.map((s, i) => (
                  <li key={s.slug} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      // onMouseDown, not onClick: the input's blur would close
                      // the list and unmount this button before a click lands.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        go(`/product/${s.slug}`);
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                        i === active ? "bg-brand-50" : "hover:bg-muted/60",
                      )}
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-white">
                        {s.image ? (
                          <Image
                            src={s.image}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink-900">
                          {s.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.brandName}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700">
                        {formatPkr(s.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(`/catalogue?q=${encodeURIComponent(query.trim())}`);
                }}
                className="block w-full border-t px-3 py-2.5 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                See all results for “{query.trim()}”
              </button>
            </>
          ) : (
            !loading && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No products match “{query.trim()}”.
              </p>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
