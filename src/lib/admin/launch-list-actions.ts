"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/guard";

export async function deleteLaunchSignup(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.launchSignup.deleteMany({ where: { id } });
  revalidatePath("/admin/launch-list");
  return { ok: true };
}
