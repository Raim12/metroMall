import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Metro Admin" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell.
 *
 * Note this layout does NOT render the storefront Navbar/Footer — those live
 * in the root layout, so this nests inside them. `admin-nav` provides its own
 * chrome and the pages are wrapped to sit clear of the sticky site header.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <AdminNav />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
