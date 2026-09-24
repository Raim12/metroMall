import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isAdminConfigured,
  isValidBcryptHash,
} from "@/lib/admin/auth";

/**
 * POST /api/admin/login
 *
 * Node runtime (not edge) because bcrypt needs it — middleware only verifies
 * the resulting JWT, which is edge-safe.
 */
export const runtime = "nodejs";

/**
 * Crude in-memory throttle. Resets on restart and is per-instance, so it is
 * not a substitute for a real rate limiter (Redis/Upstash) once this runs on
 * more than one instance — but it stops casual password guessing today.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
    return false;
  }

  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    // Distinguish "never configured" from "configured but mangled", because
    // the second looks identical to a wrong password from the outside.
    const raw = process.env.ADMIN_PASSWORD_HASH;
    const mangled = Boolean(raw) && !isValidBcryptHash(raw);

    return NextResponse.json(
      {
        error: mangled
          ? "ADMIN_PASSWORD_HASH is malformed. In a .env file each $ must be escaped as \\$ — re-run: npm run admin:password"
          : "Admin access is not configured. Run: npm run admin:password",
      },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const valid = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH!,
  );

  if (!valid) {
    // Deliberately vague: never reveal whether the account or the password
    // was the problem.
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 },
    );
  }

  attempts.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
