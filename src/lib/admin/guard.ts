import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

/**
 * Every admin Server Action calls this first. `middleware.ts` guards page
 * navigations, but a Server Action is a POST endpoint that can be invoked
 * directly, so it must not rely on the middleware having run.
 *
 * Kept outside the "use server" files so it is not itself exposed as an action.
 */
export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}
