import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { HOUSE_BRANDS } from "@/lib/constants";

/**
 * GET /admin/launch-list/export[?brand=legends] — the launch list as a CSV
 * that opens in Excel, for messaging everyone on launch day.
 *
 * The middleware already guards /admin, but this checks the session too so
 * the customer list can never leak through a misconfigured matcher.
 */
export async function GET(request: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) return new Response("Not found", { status: 404 });

  const brand = new URL(request.url).searchParams.get("brand");
  const rows = await prisma.launchSignup.findMany({
    where: brand && HOUSE_BRANDS.some((b) => b.slug === brand) ? { brand } : {},
    orderBy: { createdAt: "asc" },
  });

  const brandName = (slug: string) => HOUSE_BRANDS.find((b) => b.slug === slug)?.name ?? slug;
  // Quote every cell; neutralise leading =,+,-,@ so Excel can't run it as a formula.
  const cell = (v: string) => `"${v.replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;
  const lines = [
    ["Name", "Phone", "City", "Brand", "Signed up"].map(cell).join(","),
    ...rows.map((r) =>
      [r.name, r.phone, r.city ?? "", brandName(r.brand), r.createdAt.toISOString().slice(0, 10)]
        .map(cell)
        .join(","),
    ),
  ];

  const file = `launch-list${brand ? `-${brand}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
  // BOM so Excel reads the file as UTF-8 (Urdu names, etc.).
  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "no-store",
    },
  });
}
