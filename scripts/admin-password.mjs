/**
 * Generates the two values the admin area needs.
 *
 *   npm run admin:password -- "your-chosen-password"
 *
 * The password itself is never stored anywhere — only its bcrypt hash goes in
 * .env, so someone reading the file still cannot sign in.
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error(
    '\nUsage: npm run admin:password -- "your-chosen-password"\n\n' +
      "Pick something long. This is the only credential protecting live orders.\n",
  );
  process.exit(1);
}

if (password.length < 12) {
  console.error(
    `\nThat password is ${password.length} characters. Use at least 12 —\n` +
      "this single password guards every order and customer address.\n",
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const secret = randomBytes(48).toString("base64url");

/*
 * Next.js expands `$VAR` inside .env files, which silently mangles a bcrypt
 * hash ("$2b$12$abc..." loses $2b, $12 and $abc). Escaping each `$` keeps the
 * value intact. Hosting dashboards (Vercel, Railway) do NOT expand, so they
 * take the raw hash instead.
 */
const escaped = hash.replaceAll("$", "\\$");

console.log(`
Add these two lines to your .env file:

ADMIN_PASSWORD_HASH="${escaped}"
ADMIN_SESSION_SECRET="${secret}"

The backslashes are required: Next expands $VAR in .env files and would
otherwise eat most of the hash.

When setting this in a hosting dashboard instead, paste the raw hash with
no backslashes:

${hash}

Then restart the dev server and sign in at /admin/login.

Notes:
  - .env is gitignored; never commit these values.
  - Changing ADMIN_SESSION_SECRET signs out any active session.
  - Re-run this command to rotate the password.
`);
