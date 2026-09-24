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
} from "lucide-react";

import { signOut } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/enquiries", label: "Enquiries", Icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="border-b bg-ink-900 text-ink-100">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-2 font-heading">
          <span className="text-base font-extrabold tracking-tight">
            METR<span className="text-brand-500">O</span>
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
            Admin
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {LINKS.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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

        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-4" aria-hidden />
            View site
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-200/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
