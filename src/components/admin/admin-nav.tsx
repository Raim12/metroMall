"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import { signOut } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/enquiries", label: "Enquiries", Icon: MessageSquare },
  { href: "/admin/launch-list", label: "Launch list", Icon: Sparkles },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="border-b bg-ink-900 text-ink-100">
      {/* Phones: brand + actions on one row, links in a swipeable row below.
          From md up everything sits on a single line. */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6 md:flex-nowrap lg:px-8">
        <Link href="/admin" className="flex items-center gap-2 font-heading">
          <span className="text-base font-extrabold tracking-tight">
            METR<span className="text-brand-500">O</span>
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
            Admin
          </span>
        </Link>

        <nav className="no-scrollbar order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 md:order-none md:mx-0 md:w-auto md:flex-1 md:px-0">
          {LINKS.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-white/15 text-white"
                  : "text-ink-200/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="View site"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-4" aria-hidden />
            <span className="hidden sm:inline">View site</span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-200/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
