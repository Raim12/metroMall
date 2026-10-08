import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — uptime check.
 *
 * Pinged every few minutes by an external monitor (UptimeRobot). That keeps
 * Render's free instance from sleeping after 15 idle minutes, and the monitor
 * alerts the owner if this stops answering. Deliberately cheap: no page
 * render, just one trivial query to prove the database is reachable too.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, database: "up", time: new Date().toISOString() }, { headers });
  } catch {
    // 503 makes the monitor flag the outage instead of reporting "up".
    return Response.json({ ok: false, database: "down" }, { status: 503, headers });
  }
}
