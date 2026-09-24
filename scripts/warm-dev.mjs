/**
 * Pre-compiles every dev route so the first click isn't slow.
 *
 * `next dev` compiles a route the first time it is requested, which costs
 * 10-20s per page on this project. Run this in a second terminal right after
 * `npm run dev` and that cost is paid up front, in the background, instead of
 * while you are waiting on a page.
 *
 *   npm run dev      # terminal 1
 *   npm run warm     # terminal 2
 *
 * Production is unaffected — it prerenders at build time and serves in ~20ms.
 */

const BASE = process.env.WARM_URL ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/catalogue",
  "/about",
  "/export",
  "/join-us",
  "/support/faq",
  "/support/contact",
  "/checkout",
  "/policies/terms",
  "/product/metro-astro-inverter",
  "/admin/login",
];

async function waitForServer(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(5000) });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

console.log(`Waiting for ${BASE} ...`);

if (!(await waitForServer())) {
  console.error(`No dev server at ${BASE}. Start it with: npm run dev`);
  process.exit(1);
}

console.log("Warming routes (first compile is the slow one)\n");

let total = 0;

for (const route of ROUTES) {
  const started = Date.now();
  try {
    // Redirects are expected on gated routes; we only care that it compiled.
    const response = await fetch(`${BASE}${route}`, { redirect: "manual" });
    const elapsed = Date.now() - started;
    total += elapsed;
    console.log(
      `  ${String(elapsed).padStart(6)}ms  ${String(response.status).padEnd(3)}  ${route}`,
    );
  } catch (error) {
    console.log(
      `  ${"fail".padStart(6)}       ${route}  (${error instanceof Error ? error.message : "error"})`,
    );
  }
}

console.log(
  `\nDone in ${(total / 1000).toFixed(1)}s. Navigating the site should be quick now.`,
);
