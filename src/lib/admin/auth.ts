import { SignJWT, jwtVerify } from "jose";

/**
 * Single-owner admin authentication.
 *
 * There is no user table by design — one person uses this. The password is
 * stored only as a bcrypt hash in `ADMIN_PASSWORD_HASH`, and the session is a
 * signed JWT in an httpOnly cookie.
 *
 * Split by runtime on purpose: everything here uses `jose`, which runs on the
 * edge so `middleware.ts` can verify sessions. bcrypt comparison is Node-only
 * and therefore lives in the login route handler, not here.
 */

export const ADMIN_COOKIE = "metro_admin_session";
const SESSION_HOURS = 12;

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * A bcrypt hash is exactly 60 characters: `$2[abxy]$<cost>$<53 chars>`.
 *
 * Worth checking explicitly, because Next expands `$VAR` inside .env files and
 * will silently truncate an unescaped hash — which otherwise surfaces as a
 * baffling "incorrect password" for the right password.
 */
export function isValidBcryptHash(value: string | undefined): value is string {
  return Boolean(value && /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value));
}

/** True when the admin area has been configured at all. */
export function isAdminConfigured(): boolean {
  return Boolean(
    isValidBcryptHash(process.env.ADMIN_PASSWORD_HASH) &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload.role === "admin";
  } catch {
    // Expired, tampered with, or signed by a rotated secret.
    return false;
  }
}

export const SESSION_MAX_AGE = SESSION_HOURS * 60 * 60;
